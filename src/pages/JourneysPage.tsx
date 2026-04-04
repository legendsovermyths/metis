import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { getAllJourneys, type JourneyRow } from "@/lib/service";

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
  const [rows, setRows] = useState<JourneyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    return getAllJourneys()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Journeys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your learning paths — each journey is a deep exploration of a subject
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin opacity-60" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center shadow-soft animate-fade-in">
            <p className="text-sm text-muted-foreground leading-relaxed">
              No journeys yet. Use <span className="font-medium text-foreground">Create a journey</span> on Home
              to open chat with your advisor and plan a path.
            </p>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div className="space-y-3">
            {rows.map((row, i) => {
              const total = countTopics(row);
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
                            style={{ width: "0%" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">
                          0/{total}
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
