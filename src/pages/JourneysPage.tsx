import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import type { JourneyRow } from "@/lib/service";
import { useJourneyCreation } from "@/context/JourneyCreationContext";

const GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈", "◇", "ψ"] as const;

function countTopics(row: JourneyRow): number {
  return row.journey.arcs.reduce((n, a) => n + a.topics.length, 0);
}

function journeyGlyph(id: number): string {
  return GLYPHS[Math.abs(id) % GLYPHS.length];
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

  // Navigate to the newly created journey once it lands in the DB
  useEffect(() => {
    if (lastCreatedId != null) {
      clearLastCreatedId();
      navigate(`/journeys/${lastCreatedId}`);
    }
  }, [lastCreatedId, clearLastCreatedId, navigate]);

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Journeys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your learning paths — each journey is a deep exploration of a subject
          </p>
        </div>

        {journeysLoading && pendingJourneys.length === 0 && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin opacity-60" />
          </div>
        )}

        {!journeysLoading && journeysError && (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
            {journeysError}
          </div>
        )}

        {!journeysLoading && !journeysError && journeyRows.length === 0 && pendingJourneys.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center shadow-soft animate-fade-in">
            <p className="text-sm text-muted-foreground leading-relaxed">
              No journeys yet. Use <span className="font-medium text-foreground">Create a journey</span> on Home
              to open chat with your advisor and plan a path.
            </p>
          </div>
        )}

        {(journeyRows.length > 0 || pendingJourneys.length > 0) && (
          <div className="space-y-3">
            {/* Pending journey skeletons */}
            {pendingJourneys.map((j) => (
              <div
                key={j.tempId}
                className="rounded-xl border border-border bg-card shadow-soft overflow-hidden animate-fade-in"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2.5 pt-1">
                      <div className="h-4 w-48 animate-pulse rounded-full bg-surface" />
                      {j.chapterTitle ? (
                        <p className="text-sm text-muted-foreground/70">Chapter · {j.chapterTitle}</p>
                      ) : (
                        <div className="h-3 w-36 animate-pulse rounded-full bg-surface" />
                      )}
                      <div className="h-2.5 w-20 animate-pulse rounded-full bg-surface" />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 rounded-full bg-surface overflow-hidden">
                      <div className="h-full w-1/3 rounded-full bg-foreground/10 animate-pulse" />
                    </div>
                    <div className="h-3 w-6 animate-pulse rounded-full bg-surface" />
                  </div>
                </div>
                <div className="border-t border-border divide-y divide-border">
                  {[0.55, 0.40, 0.65].map((w, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-4">
                      <div
                        className="animate-pulse rounded-full bg-surface"
                        style={{ height: "0.625rem", width: `${w * 100}%`, animationDelay: `${i * 120}ms` }}
                      />
                      <div
                        className="ml-auto h-2 w-8 animate-pulse rounded-full bg-surface shrink-0"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-6 py-3 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground/50" />
                  <span className="text-xs text-muted-foreground/60">Crafting your journey…</span>
                </div>
              </div>
            ))}

            {journeyRows.map((row, i) => {
              const total = countTopics(row);
              const completedTopics = row.progress.arcs.reduce((n, a) => n + a.topic_idx, 0);
              const pct = total > 0 ? Math.round((completedTopics / total) * 100) : 0;
              const title = row.journey.journey_title || row.chapter_title || "Untitled journey";
              const blurb = row.chapter_title ? `Chapter · ${row.chapter_title}` : "Open to continue this path.";

              return (
                <Link
                  key={row.id}
                  to={`/journeys/${row.id}`}
                  className="group block rounded-xl border border-border bg-card p-6 shadow-soft transition-all duration-200 hover:shadow-medium hover:border-border/80 animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface text-xl font-medium text-foreground">
                      {journeyGlyph(row.id)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-medium text-foreground">{title}</h3>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">{blurb}</p>
                      <p className="mt-2 text-xs text-muted-foreground/80">{formatDate(row.created_at)}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 rounded-full bg-surface overflow-hidden">
                          <div
                            className="h-full rounded-full bg-foreground/70 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          {completedTopics}/{total}
                        </span>
                      </div>
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
