import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { JourneyRow } from "@/lib/service";
import { useJourneyCreation } from "@/context/JourneyCreationContext";
import { journeyGlyph, useMasthead, mastheadStyle } from "@/lib/editorial";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function JourneysPage() {
  const { journeyRows, journeysLoading, journeysError, pendingJourneys, lastCreatedId, clearLastCreatedId, removeJourney } = useJourneyCreation();
  const navigate = useNavigate();
  const masthead = useMasthead();
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (deleteTargetId === null) return;
    setIsDeleting(true);
    try {
      await removeJourney(deleteTargetId);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  }

  useEffect(() => {
    if (lastCreatedId != null) {
      clearLastCreatedId();
      navigate(`/journeys/${lastCreatedId}`);
    }
  }, [lastCreatedId, clearLastCreatedId, navigate]);

  const totalCount = journeyRows.length + pendingJourneys.length;
  const totalTopicsCompleted = journeyRows.reduce((a, r) => a + r.completed_topics, 0);
  const totalTopics = journeyRows.reduce((a, r) => a + r.total_topics, 0);

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] overflow-hidden flex flex-col pb-20 md:pb-0">
      <div className="relative mx-auto w-full max-w-3xl flex-1 flex flex-col px-6 md:px-8">

        {/* Masthead */}
        <header className="pt-8 md:pt-10">
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>Metis · Log of Journeys</span>
            <span className="hidden sm:inline">
              {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        <main className="flex-1 py-10 md:py-12">

          {/* Hero */}
          <section className="mb-12 animate-blur-in">
            <div>
              <p className="label-whisper text-text-tertiary mb-3">Paths</p>
              <h1 className="display-hero text-5xl text-foreground">Journeys</h1>
              <div
                className="h-px w-12 mt-5 mb-4 animate-reveal-line"
                style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
              />
              <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-md">
                Courses set, and the steps you've taken along them.
              </p>
            </div>
          </section>

          {/* Loading */}
          {journeysLoading && pendingJourneys.length === 0 && (
            <div className="flex justify-center gap-1 py-16 text-text-tertiary">
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
            </div>
          )}

          {/* Error */}
          {!journeysLoading && journeysError && (
            <div className="rounded-xl bg-surface p-6 text-center text-sm text-text-secondary">
              {journeysError}
            </div>
          )}

          {/* Empty state */}
          {!journeysLoading && !journeysError && journeyRows.length === 0 && pendingJourneys.length === 0 && (
            <div className="flex flex-col items-center py-24 text-center animate-blur-in">
              <span className="display-hero text-[8rem] text-foreground/[0.06] select-none leading-none mb-6">∫</span>
              <p className="font-display italic text-base text-foreground/70 max-w-sm leading-relaxed mb-2">
                No paths charted yet.
              </p>
              <p className="text-sm text-text-tertiary max-w-xs leading-relaxed">
                Begin one from the home page — your advisor will help you plan its course.
              </p>
            </div>
          )}

          {/* The Itinerary — list of paths */}
          {(journeyRows.length > 0 || pendingJourneys.length > 0) && (
            <section>
              {/* Section header — hairline rule with counts */}
              <div className="flex items-baseline gap-4 mb-1">
                <span className="label-whisper text-text-tertiary">The Itinerary</span>
                <div className="flex-1 h-px bg-border/30" />
                {totalCount > 0 && (
                  <span className="label-whisper text-text-tertiary tabular-nums">
                    {totalCount} {totalCount === 1 ? "path" : "paths"}
                    {totalTopics > 0 && (
                      <span className="ml-1 text-text-tertiary/80">
                        · {totalTopicsCompleted}/{totalTopics} steps
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div>
                {/* Pending skeletons */}
                {pendingJourneys.map((j) => (
                  <div
                    key={j.tempId}
                    className="flex items-start gap-5 border-b border-border/20 py-7 animate-blur-in"
                  >
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded bg-surface mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-4 mb-2">
                        <div className="h-3.5 w-48 animate-pulse rounded bg-surface" />
                        <div className="h-3 w-8 shrink-0 animate-pulse rounded-full bg-surface" />
                      </div>
                      {j.chapterTitle ? (
                        <p className="font-display text-xs italic text-text-tertiary leading-snug mb-3">
                          from {j.chapterTitle}
                        </p>
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
                    <span className="flex items-center gap-0.5 shrink-0 mt-1.5">
                      <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                    </span>
                  </div>
                ))}

                {/* Journey rows */}
                {journeyRows.map((row, i) => {
                  const title = row.journey.journey_title || row.chapter_title || "Untitled journey";
                  const fillRatios = arcFillRatios(row);
                  const glyph = journeyGlyph(row.id);
                  const isStarted = row.completed_topics > 0;
                  const isComplete = row.total_topics > 0 && row.completed_topics >= row.total_topics;

                  return (
                    <div
                      key={row.id}
                      className="group relative border-b border-border/20 last:border-0 animate-blur-in opacity-0"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <Link
                        to={`/journeys/${row.id}`}
                        className="flex items-start gap-5 py-7 hover:bg-surface-hover/40 -mx-2 px-2 rounded-lg transition-colors duration-200"
                      >
                        {/* Glyph — amber-tinted, opacity tied to progress */}
                        <span
                          className="w-8 shrink-0 pt-0.5 font-display text-3xl italic select-none transition-opacity duration-200 group-hover:opacity-80"
                          style={{
                            color: "hsl(var(--amber))",
                            opacity: isComplete ? 0.75 : isStarted ? 0.55 : 0.35,
                          }}
                        >
                          {glyph}
                        </span>

                        {/* Content */}
                        <div className="min-w-0 flex-1 pr-6">
                          <div className="flex items-baseline justify-between gap-4">
                            <p className="font-display text-sm italic text-foreground leading-snug">
                              {title}
                            </p>
                            <span className="shrink-0 label-whisper text-text-tertiary tabular-nums">
                              {row.completed_topics}/{row.total_topics}
                            </span>
                          </div>

                          {row.chapter_title && (
                            <p className="mt-1 font-display text-xs italic text-text-tertiary leading-snug">
                              from {row.chapter_title}
                            </p>
                          )}

                          {/* Segmented arc progress */}
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
                                      opacity: 0.75,
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

                      {/* Delete button — appears on row hover */}
                      <button
                        onClick={() => setDeleteTargetId(row.id)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-1.5 text-text-tertiary hover:text-foreground/70"
                        aria-label="Delete journey"
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <line x1="1" y1="1" x2="10" y2="10" />
                          <line x1="10" y1="1" x2="1" y2="10" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* Delete confirmation */}
        <AlertDialog open={deleteTargetId !== null} onOpenChange={(open) => { if (!open) setDeleteTargetId(null); }}>
          <AlertDialogContent className="max-w-sm border-border/60 bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display italic text-base font-normal text-foreground">
                Remove this journey?
              </AlertDialogTitle>
              {deleteTargetId !== null && (() => {
                const row = journeyRows.find((r) => r.id === deleteTargetId);
                const title = row?.journey.journey_title || row?.chapter_title || "this journey";
                return (
                  <AlertDialogDescription className="font-display text-sm italic text-text-secondary leading-relaxed">
                    <span className="text-foreground/80">{title}</span> and all its dialogues will be permanently deleted.
                  </AlertDialogDescription>
                );
              })()}
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2">
              <AlertDialogCancel className="font-display italic text-sm border-border/50 bg-transparent text-text-secondary hover:bg-surface-hover/40 hover:text-foreground">
                Keep it
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="font-display italic text-sm bg-foreground/90 text-background hover:bg-foreground"
              >
                {isDeleting ? "Removing…" : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Colophon */}
        <footer className="pb-8 md:pb-10">
          <div className="h-px w-full bg-border/30 mb-4" />
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>μῆτις · gr. mêtis — cunning intelligence</span>
            <span>—  fol. iii  —</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
