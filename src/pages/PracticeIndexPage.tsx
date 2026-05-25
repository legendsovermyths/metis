import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Dumbbell, Loader2 } from "lucide-react";
import { getJourney, type JourneyRow } from "@/lib/service";
import { getArcAssessmentMeta, getPractice } from "@/lib/mockAssessment";

interface SheetSummary {
  arc_idx: number;
  arc_title: string;
  problem_count: number;
}

export default function PracticeIndexPage() {
  const { id } = useParams();
  const journeyId = Number(id);

  const [row, setRow] = useState<JourneyRow | null>(null);
  const [sheets, setSheets] = useState<SheetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(journeyId)) {
      setError("Invalid journey");
      setLoading(false);
      return;
    }
    setLoading(true);
    getJourney(journeyId)
      .then(async (r) => {
        setRow(r);
        const candidates = r.journey.arcs
          .map((arc, i) => ({ arc, i, meta: getArcAssessmentMeta(i, arc.arc_title) }))
          .filter(({ meta }) => meta.has_practice);
        const counts = await Promise.all(
          candidates.map(({ i }) => getPractice(journeyId, i).then((set) => set.problems.length))
        );
        setSheets(
          candidates.map(({ arc, i }, k) => ({
            arc_idx: i,
            arc_title: arc.arc_title,
            problem_count: counts[k],
          }))
        );
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [journeyId]);

  if (loading) {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !row) {
    return (
      <div className="paper-texture flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground">{error ?? "Journey not found"}</p>
        <Link
          to={`/journeys/${id}`}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to journey
        </Link>
      </div>
    );
  }

  const title = row.journey.journey_title || row.chapter_title || "Untitled journey";

  return (
    <div className="paper-texture flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link
            to={`/journeys/${id}`}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Back to journey</span>
          </Link>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            Practice
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
          <header className="mb-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-foreground">
                <Dumbbell className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                  Practice · {title}
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  Problem sheets
                </h1>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Pick a sheet. Each problem shows the prompt, hints, and a worked solution — no
              grading, no submission.
            </p>
          </header>

          {sheets.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center shadow-soft">
              <p className="text-sm text-muted-foreground">
                No practice sheets available yet for this journey.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sheets.map((s, k) => (
                <Link
                  key={s.arc_idx}
                  to={`/journeys/${journeyId}/practice/${s.arc_idx}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-foreground/20 hover:bg-surface-hover animate-fade-in-up opacity-0"
                  style={{ animationDelay: `${k * 60}ms` }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-xs font-medium text-muted-foreground tabular-nums">
                    {k + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground">
                      {s.arc_title}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {s.problem_count} problem{s.problem_count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
