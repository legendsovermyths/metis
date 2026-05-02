import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Dumbbell } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getJourney, teachingInit, type JourneyRow } from "@/lib/service";
import { getArcAssessmentMeta, loadQuizResult } from "@/lib/mockAssessment";


export default function JourneyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = id !== undefined ? Number(id) : NaN;
  const [row, setRow] = useState<JourneyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const arcKeys = useMemo(() => {
    if (!row) return [];
    return row.journey.arcs.map((_, i) => `arc-${i}`);
  }, [row]);

  const [expandedArcs, setExpandedArcs] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedArcs(new Set(arcKeys));
  }, [arcKeys]);

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      setLoading(false);
      setError("Invalid journey");
      return;
    }
    setLoading(true);
    setError(null);
    getJourney(numericId)
      .then(setRow)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [numericId]);

  const completedTopics = row?.completed_topics ?? 0;
  const totalTopics = row?.total_topics ?? 0;

  const completedSet = useMemo(() => {
    const set = new Set<string>();
    if (!row) return set;
    let remaining = completedTopics;
    for (let a = 0; a < row.journey.arcs.length && remaining > 0; a++) {
      const arc = row.journey.arcs[a];
      for (let t = 0; t < arc.topics.length && remaining > 0; t++) {
        set.add(`${a}-${t}`);
        remaining--;
      }
    }
    return set;
  }, [row, completedTopics]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center gap-1 paper-texture text-muted-foreground">
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-4 paper-texture px-6">
        <p className="text-muted-foreground">{error || "Journey not found"}</p>
        <Link
          to="/journeys"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          All journeys
        </Link>
      </div>
    );
  }

  const title = row.journey.journey_title || row.chapter_title || "Untitled journey";
  const allDone = completedTopics >= totalTopics && totalTopics > 0;

  const toggleArc = (arcKey: string) => {
    setExpandedArcs((prev) => {
      const next = new Set(prev);
      if (next.has(arcKey)) next.delete(arcKey);
      else next.add(arcKey);
      return next;
    });
  };

  const handleContinue = async () => {
    if (starting) return;
    setStarting(true);
    try {
      await teachingInit(numericId);
      navigate("/teach");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStarting(false);
    }
  };

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-8 pb-28">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/journeys"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All journeys
        </Link>

        <div className="mb-10 animate-fade-in">
          <h1 className="font-display text-4xl italic tracking-tight text-foreground leading-tight">
            {title}
          </h1>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground/35">
            {[
              row.journey.arcs.length > 0 && `${row.journey.arcs.length} arc${row.journey.arcs.length === 1 ? "" : "s"}`,
              totalTopics > 0 && `${totalTopics} topics`,
              row.chapter_title,
            ].filter(Boolean).join(" · ")}
          </p>

          {row.journey.arcs.length > 0 && (
            <div className="mt-5">
              <Link
                to={`/journeys/${numericId}/practice`}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 transition-colors hover:text-foreground"
              >
                <Dumbbell className="h-3 w-3" strokeWidth={1.75} />
                Practice problems · {row.journey.arcs.length} sheet{row.journey.arcs.length === 1 ? "" : "s"}
              </Link>
            </div>
          )}
        </div>

        {row.journey.arcs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground/50 animate-fade-in">
            This journey has no arcs yet.
          </p>
        ) : (
          <div className="mt-2">
            {row.journey.arcs.map((arc, i) => {
              const arcKey = `arc-${i}`;
              const arcCompleted = arc.topics.filter((_, t) => completedSet.has(`${i}-${t}`)).length;
              const total = arc.topics.length;
              const arcDone = arcCompleted === total && total > 0;
              const isExpanded = expandedArcs.has(arcKey);

              const meta = getArcAssessmentMeta(i, arc.arc_title);
              const lastQuiz = meta.has_quiz ? loadQuizResult(numericId, i) : null;
              const showAssessmentRow = meta.has_quiz;
              const quizScoreText = lastQuiz
                ? Number.isInteger(lastQuiz.score)
                  ? `${lastQuiz.score}`
                  : lastQuiz.score.toFixed(1)
                : null;

              return (
                <div
                  key={arcKey}
                  className="border-t border-border/15 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Arc header — click to toggle */}
                  <button
                    type="button"
                    onClick={() => toggleArc(arcKey)}
                    className="flex w-full items-start gap-5 pt-5 pb-3 text-left group"
                  >
                    {/* Arc number */}
                    <span className="w-7 shrink-0 text-[10px] tabular-nums text-muted-foreground/25 pt-0.5 font-medium select-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Arc title + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn(
                          "text-sm font-medium transition-colors",
                          arcDone ? "text-muted-foreground/45" : "text-foreground"
                        )}>
                          {arc.arc_title}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          {arcDone && (
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30">done</span>
                          )}
                          {meta.has_quiz && (
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30">check-in</span>
                          )}
                          <span className="text-[10px] tabular-nums text-muted-foreground/30">{arcCompleted}/{total}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Topics — expanded */}
                  {isExpanded && (
                    <div className="pl-12 pb-6 animate-fade-in">
                      <p className="text-xs leading-loose">
                        {arc.topics.map((topic, ti) => (
                          <span key={ti}>
                            <span className={completedSet.has(`${i}-${ti}`)
                              ? "text-muted-foreground/30 line-through"
                              : "text-foreground/65"
                            }>
                              {topic.name}
                            </span>
                            {ti < arc.topics.length - 1 && (
                              <span className="mx-2 text-muted-foreground/20">·</span>
                            )}
                          </span>
                        ))}
                      </p>

                      {showAssessmentRow && (
                        <div className="flex items-center gap-5 mt-4">
                          {meta.has_quiz && (
                            <Link
                              to={`/journeys/${numericId}/arc/${i}/quiz`}
                              className="text-[10px] uppercase tracking-widest text-muted-foreground/40 transition-colors hover:text-foreground"
                            >
                              {lastQuiz ? `Check-in · last ${quizScoreText}/${lastQuiz.total}` : "Check-in →"}
                            </Link>
                          )}
                          <Link
                            to={`/journeys/${numericId}/arc/${i}/complete`}
                            className="text-[10px] uppercase tracking-widest text-muted-foreground/40 transition-colors hover:text-foreground"
                          >
                            End of arc →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalTopics === 0 && row.journey.arcs.length > 0 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">No topics listed in arcs yet.</p>
        )}
      </div>

      {row.journey.arcs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/20 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
            <span className="text-[10px] text-muted-foreground/35 tabular-nums">
              {completedTopics} of {totalTopics} topics
            </span>
            <Button
              onClick={handleContinue}
              disabled={starting || allDone}
              className="rounded-xl px-6 shadow-soft"
            >
              {starting ? (
                <>
                  <span className="mr-2 flex items-center gap-0.5">
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                  </span>
                  Starting...
                </>
              ) : allDone ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Completed
                </>
              ) : completedTopics > 0 ? (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Start
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
