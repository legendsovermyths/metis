import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Circle, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { getJourney, type JourneyRow } from "@/lib/service";

const GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈", "◇", "ψ"] as const;

function journeyGlyph(id: number): string {
  return GLYPHS[Math.abs(id) % GLYPHS.length];
}

export default function JourneyDetailPage() {
  const { id } = useParams();
  const numericId = id !== undefined ? Number(id) : NaN;
  const [row, setRow] = useState<JourneyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const totalTopics = row.journey.arcs.reduce((n, a) => n + a.topics.length, 0);
  const progressPct = 0;

  const toggleArc = (arcKey: string) => {
    setExpandedArcs((prev) => {
      const next = new Set(prev);
      if (next.has(arcKey)) next.delete(arcKey);
      else next.add(arcKey);
      return next;
    });
  };

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-8 pb-24 md:pb-8">
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
              const completed = 0;
              const total = arc.topics.length;
              const isExpanded = expandedArcs.has(arcKey);

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
                          {completed}/{total}
                        </span>
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
                    <div className="border-t border-border px-5 py-3">
                      {arc.topics.map((topic, ti) => (
                        <div
                          key={`${arcKey}-t-${ti}`}
                          className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-surface-hover"
                        >
                          <Circle className="h-5 w-5 shrink-0 text-border" strokeWidth={1.5} />
                          <span className="text-sm text-foreground">{topic.name}</span>
                          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
                            {topic.mode}
                          </span>
                        </div>
                      ))}
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
    </div>
  );
}
