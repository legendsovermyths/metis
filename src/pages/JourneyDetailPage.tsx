import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Circle, Loader2, Play, Dumbbell, PenSquare } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getJourney, teachingInit, type JourneyRow } from "@/lib/service";
import { getArcAssessmentMeta, loadQuizResult } from "@/lib/mockAssessment";

const GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈", "◇", "ψ"] as const;

function journeyGlyph(id: number): string {
  return GLYPHS[Math.abs(id) % GLYPHS.length];
}

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
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center paper-texture">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
  const description = row.chapter_title ? `Chapter · ${row.chapter_title}` : "Your learning path";
  const progressPct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
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

        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-xl font-medium text-foreground">
              {journeyGlyph(row.id)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-foreground/70 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground tabular-nums">{progressPct}%</span>
          </div>

          {row.journey.arcs.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Link
                to={`/journeys/${numericId}/practice`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-soft transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                <Dumbbell className="h-3.5 w-3.5" strokeWidth={1.75} />
                Practice problems
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {row.journey.arcs.length} sheet{row.journey.arcs.length === 1 ? "" : "s"}
                </span>
              </Link>
            </div>
          )}
        </div>

        {row.journey.arcs.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft animate-fade-in">
            <p className="text-sm text-muted-foreground">
              This journey has no arcs yet. You can flesh it out in the next phase.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="rounded-xl border border-border bg-card shadow-soft overflow-hidden animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => toggleArc(arcKey)}
                    className="flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground">{arc.arc_title}</h3>
                        <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                          {arcCompleted}/{total}
                        </span>
                        {arcDone && <Check className="h-3.5 w-3.5 text-green-500" />}
                        {meta.has_quiz && (
                          <span
                            title="Check-in available"
                            className="flex h-4 items-center gap-1 rounded-full border border-border/70 bg-surface/70 px-1.5 text-[9px] font-medium uppercase tracking-widest text-muted-foreground"
                          >
                            <PenSquare className="h-2.5 w-2.5" strokeWidth={2} />
                            check-in
                          </span>
                        )}
                        {lastQuiz && (
                          <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                            · {quizScoreText}/{lastQuiz.total}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border">
                      <div className="px-5 py-3">
                        {arc.topics.map((topic, ti) => {
                          const topicDone = completedSet.has(`${i}-${ti}`);
                          return (
                            <div
                              key={`${arcKey}-t-${ti}`}
                              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-hover"
                            >
                              {topicDone ? (
                                <Check className="h-5 w-5 shrink-0 text-green-500" strokeWidth={1.5} />
                              ) : (
                                <Circle className="h-5 w-5 shrink-0 text-border" strokeWidth={1.5} />
                              )}
                              <span className={cn("text-sm", topicDone ? "text-muted-foreground" : "text-foreground")}>
                                {topic.name}
                              </span>
                              <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                                {topic.mode}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {showAssessmentRow && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 bg-surface/30 px-4 py-3">
                          {meta.has_quiz && (
                            <Link
                              to={`/journeys/${numericId}/arc/${i}/quiz`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground"
                            >
                              <PenSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
                              Check-in
                              {lastQuiz && (
                                <span className="ml-1 text-muted-foreground tabular-nums">
                                  · last {quizScoreText}/{lastQuiz.total}
                                </span>
                              )}
                            </Link>
                          )}
                          <Link
                            to={`/journeys/${numericId}/arc/${i}/complete`}
                            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            End-of-arc page
                            <ArrowRight className="h-3 w-3" />
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
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {completedTopics}/{totalTopics} topics
            </span>
            <Button
              onClick={handleContinue}
              disabled={starting || allDone}
              className="rounded-xl px-6 shadow-soft"
            >
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : allDone ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Completed
                </>
              ) : completedTopics > 0 ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Continue
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
