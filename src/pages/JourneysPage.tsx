import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { JourneyRow } from "@/lib/service";
import { useJourneyCreation } from "@/context/JourneyCreationContext";

const GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈", "◇", "ψ"] as const;

function journeyGlyph(id: number): string {
  return GLYPHS[Math.abs(id) % GLYPHS.length];
}

/** Returns per-arc fill ratios (0..1) derived from aggregate completed_topics. */
function arcFillRatios(row: JourneyRow): number[] {
  const arcs = row.journey.arcs;
  let remaining = row.completed_topics;
  return arcs.map((arc) => {
    const size = arc.topics.length;
    if (size === 0) return 0;
    if (remaining >= size) {
      remaining -= size;
      return 1;
    }
    const pct = remaining / size;
    remaining = 0;
    return pct;
  });
}

function formatDate(createdAt: number): string {
  try {
    return new Date(createdAt * 1000).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function JourneysPage() {
  const { journeyRows, journeysLoading, journeysError, pendingJourneys, lastCreatedId, clearLastCreatedId } = useJourneyCreation();
  const navigate = useNavigate();

  useEffect(() => {
    if (lastCreatedId != null) {
      clearLastCreatedId();
      navigate(`/journeys/${lastCreatedId}`);
    }
  }, [lastCreatedId, clearLastCreatedId, navigate]);

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-10 pb-24 md:pb-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between animate-fade-in">
          <div>
            <h1 className="font-display text-4xl italic tracking-tight text-foreground">Journeys</h1>
            {journeyRows.length > 0 && (
              <p className="mt-1 font-display text-xs italic text-muted-foreground/50">
                {journeyRows.length} {journeyRows.length === 1 ? "path" : "paths"}
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {journeysLoading && pendingJourneys.length === 0 && (
          <div className="flex justify-center gap-1 py-16 text-muted-foreground">
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current opacity-40" />
          </div>
        )}

        {/* Error */}
        {!journeysLoading && journeysError && (
          <div className="rounded-xl bg-surface p-6 text-center text-sm text-muted-foreground">
            {journeysError}
          </div>
        )}

        {/* Empty state */}
        {!journeysLoading && !journeysError && journeyRows.length === 0 && pendingJourneys.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center animate-fade-in">
            <span className="font-display text-[8rem] italic text-muted-foreground/[0.07] select-none leading-none mb-8">∫</span>
            <p className="text-sm text-muted-foreground/50 leading-relaxed max-w-xs">
              No journeys yet. Use <span className="font-medium text-foreground/70">Create a journey</span> on Home
              to open chat with your advisor and plan a path.
            </p>
          </div>
        )}

        {(journeyRows.length > 0 || pendingJourneys.length > 0) && (
          <div>

            {/* Pending skeletons */}
            {pendingJourneys.map((j) => (
              <div
                key={j.tempId}
                className="flex items-start gap-5 border-b border-border/20 py-7 animate-fade-in"
              >
                {/* Glyph placeholder */}
                <div className="h-8 w-8 shrink-0 animate-pulse rounded bg-surface mt-0.5" />

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <div className="h-3.5 w-48 animate-pulse rounded bg-surface" />
                    <div className="h-3 w-8 shrink-0 animate-pulse rounded-full bg-surface" />
                  </div>
                  {j.chapterTitle ? (
                    <p className="text-xs text-muted-foreground/40 mb-3">Chapter · {j.chapterTitle}</p>
                  ) : (
                    <div className="h-2.5 w-28 animate-pulse rounded-full bg-surface mb-3" />
                  )}
                  <div className="flex gap-[3px]">
                    {[1, 2, 3].map((k) => (
                      <div
                        key={k}
                        className="h-[3px] flex-1 animate-pulse rounded-full bg-surface"
                        style={{ animationDelay: `${k * 100}ms` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Thinking indicator */}
                <span className="flex items-center gap-0.5 shrink-0 mt-1.5">
                  <span className="thinking-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span className="thinking-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span className="thinking-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
                </span>
              </div>
            ))}

            {/* Journey rows */}
            {journeyRows.map((row, i) => {
              const title = row.journey.journey_title || row.chapter_title || "Untitled journey";
              const blurb = row.chapter_title ? `Chapter · ${row.chapter_title}` : null;
              const fillRatios = arcFillRatios(row);
              const glyph = journeyGlyph(row.id);
              const isStarted = row.completed_topics > 0;
              const isComplete = row.total_topics > 0 && row.completed_topics >= row.total_topics;

              return (
                <Link
                  key={row.id}
                  to={`/journeys/${row.id}`}
                  className="group flex items-start gap-5 border-b border-border/20 py-7 last:border-0 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Glyph — amber-tinted, opacity tied to progress */}
                  <span
                    className="w-8 shrink-0 pt-0.5 font-display text-3xl italic select-none transition-opacity duration-200 group-hover:opacity-70"
                    style={{
                      color: "hsl(var(--amber))",
                      opacity: isComplete ? 0.6 : isStarted ? 0.4 : 0.22,
                    }}
                  >
                    {glyph}
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    {/* Title row with count on the right */}
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-display text-sm italic text-foreground leading-snug">
                        {title}
                      </p>
                      <span className="shrink-0 font-display text-xs italic tabular-nums text-muted-foreground/40">
                        {row.completed_topics}/{row.total_topics}
                      </span>
                    </div>

                    {blurb && (
                      <p className="mt-0.5 text-xs text-muted-foreground/40">{blurb}</p>
                    )}

                    {/* Segmented arc progress track — full width of content column */}
                    <div className="mt-3 flex gap-[3px]">
                      {fillRatios.length > 0 ? (
                        fillRatios.map((fill, idx) => (
                          <div
                            key={idx}
                            className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/25"
                          >
                            <div
                              className="h-full rounded-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
                              style={{
                                width: `${fill * 100}%`,
                                backgroundColor: "hsl(var(--amber))",
                                opacity: 0.7,
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="h-[3px] flex-1 rounded-full bg-border/15" />
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
