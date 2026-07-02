import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getJourney, teachingInit, type JourneyRow } from "@/lib/service";
import { journeyGlyph, toRoman } from "@/lib/editorial";

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
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center gap-1 paper-texture text-text-tertiary">
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
        <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-4 paper-texture px-6">
        <p className="text-text-secondary">{error || "Journey not found"}</p>
        <Link to="/studies" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
          Return to the study
        </Link>
      </div>
    );
  }

  const title = row.journey.journey_title || row.chapter_title || "Untitled journey";
  const allDone = completedTopics >= totalTopics && totalTopics > 0;
  const progressRatio = totalTopics > 0 ? completedTopics / totalTopics : 0;
  const glyph = journeyGlyph(row.id);

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
      await teachingInit("Journey", numericId);
      navigate("/teach");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStarting(false);
    }
  };

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] overflow-hidden px-6 py-8 pb-32">
      <div className="mx-auto max-w-2xl">

        {/* Back nav */}
        <Link
          to="/studies"
          className="mb-10 inline-flex items-center gap-1.5 text-text-tertiary transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="label-whisper">Return to the study</span>
        </Link>

        {/* Header — journey glyph watermark behind */}
        <header className="relative mb-12 animate-blur-in">
          <span
            className="pointer-events-none select-none font-display italic absolute -top-10 -right-4 leading-none"
            style={{ fontSize: "clamp(10rem, 22vw, 18rem)", color: "hsl(var(--foreground) / 0.035)" }}
            aria-hidden
          >
            {glyph}
          </span>

          <p className="label-whisper text-text-tertiary mb-4 relative z-10">From the Itinerary</p>
          <h1 className="display-hero text-4xl md:text-5xl text-foreground leading-tight mb-0 relative z-10">
            {title}
          </h1>
          <div
            className="h-px w-12 mt-5 mb-5 animate-reveal-line relative z-10"
            style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
          />
          {row.chapter_title && (
            <p className="font-display italic text-base text-text-secondary leading-relaxed mb-3 relative z-10">
              from {row.chapter_title}
            </p>
          )}
          <p className="label-whisper text-text-tertiary tabular-nums relative z-10">
            {[
              row.journey.arcs.length > 0 && `${row.journey.arcs.length} ${row.journey.arcs.length === 1 ? "arc" : "arcs"}`,
              totalTopics > 0 && `${totalTopics} topics`,
            ].filter(Boolean).join(" · ")}
          </p>
        </header>

        {row.journey.arcs.length === 0 ? (
          <p className="mt-4 font-display italic text-sm text-text-secondary animate-blur-in">
            This journey has no arcs yet.
          </p>
        ) : (
          <>
            {/* Section header for the arc list */}
            <div className="flex items-baseline gap-4 mb-2">
              <span className="label-whisper text-text-tertiary">The Course</span>
              <div className="flex-1 h-px bg-border/30" />
              <span className="label-whisper text-text-tertiary tabular-nums">
                {completedTopics}/{totalTopics} steps
              </span>
            </div>

            {/* Arc list with vertical timeline line */}
            <div className="relative mt-2">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-border/20" />

              {row.journey.arcs.map((arc, i) => {
                const arcKey = `arc-${i}`;
                const arcCompleted = arc.topics.filter((_, t) => completedSet.has(`${i}-${t}`)).length;
                const total = arc.topics.length;
                const arcDone = arcCompleted === total && total > 0;
                const isExpanded = expandedArcs.has(arcKey);

                return (
                  <div
                    key={arcKey}
                    className="relative animate-blur-in opacity-0"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {/* Arc header */}
                    <button
                      type="button"
                      onClick={() => toggleArc(arcKey)}
                      className="flex w-full items-start gap-6 pt-6 pb-3 text-left group"
                    >
                      {/* Decorative Roman numeral */}
                      <span
                        className="display-hero w-16 shrink-0 select-none leading-none text-right relative z-10"
                        style={{
                          fontSize: "3.5rem",
                          color: "hsl(var(--foreground))",
                          opacity: arcDone ? 0.04 : 0.07,
                        }}
                      >
                        {toRoman(i + 1)}
                      </span>

                      {/* Arc title + meta */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className={cn(
                            "text-sm font-medium transition-colors group-hover:text-foreground",
                            arcDone ? "text-text-tertiary" : "text-foreground"
                          )}>
                            {arc.arc_title}
                          </span>
                          <div className="flex items-center gap-3 shrink-0">
                            {arcDone && (
                              <span className="font-display italic text-[11px] text-text-tertiary">finis</span>
                            )}
                            <span className="text-[10px] tabular-nums text-text-tertiary">{arcCompleted}/{total}</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Topics — expanded as pill tags */}
                    {isExpanded && (
                      <div className="pl-[5.5rem] pb-7 animate-blur-in">
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {arc.topics.map((topic, ti) => (
                            <span
                              key={ti}
                              className={cn(
                                "text-xs border-b pb-0.5 transition-colors",
                                completedSet.has(`${i}-${ti}`)
                                  ? "text-text-tertiary line-through border-text-tertiary/20"
                                  : "text-text-secondary border-border/30"
                              )}
                            >
                              {topic.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {totalTopics === 0 && row.journey.arcs.length > 0 && (
          <p className="mt-4 text-center font-display italic text-xs text-text-tertiary">No topics listed in arcs yet.</p>
        )}
      </div>

      {/* Fixed action bar — top edge gilds with amber as progress advances */}
      {row.journey.arcs.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl">
          <div className="h-px w-full bg-border/30 relative overflow-hidden">
            {totalTopics > 0 && (
              <div
                className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                style={{
                  width: `${progressRatio * 100}%`,
                  backgroundColor: "hsl(var(--amber))",
                  opacity: 0.7,
                }}
              />
            )}
          </div>
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
            <span className="font-display italic text-xs text-text-tertiary tabular-nums">
              step {completedTopics} of {totalTopics}
            </span>
            <Button
              onClick={() => void handleContinue()}
              disabled={starting}
              className="rounded-xl px-6 shadow-soft"
            >
              {starting ? (
                <>
                  <span className="mr-2 flex items-center gap-0.5">
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-current" />
                  </span>
                  Starting…
                </>
              ) : allDone ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Revisit
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
