import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2, Check, PenSquare, Dumbbell, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getArcAssessmentMeta,
  loadQuizResult,
  type ArcAssessmentMeta,
  type QuizResult,
} from "@/lib/mockAssessment";
import { getJourney, type JourneyRow } from "@/lib/service";

export default function ArcCompletePage() {
  const { id, arcIdx } = useParams();
  const navigate = useNavigate();
  const journeyId = Number(id);
  const arcIndex = Number(arcIdx);

  const [row, setRow] = useState<JourneyRow | null>(null);
  const [meta, setMeta] = useState<ArcAssessmentMeta | null>(null);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(journeyId) || !Number.isFinite(arcIndex)) {
      setError("Invalid arc");
      setLoading(false);
      return;
    }
    setLoading(true);
    getJourney(journeyId)
      .then((r) => {
        setRow(r);
        const arc = r.journey.arcs[arcIndex];
        if (!arc) {
          setError("Arc not found");
          return;
        }
        setMeta(getArcAssessmentMeta(arcIndex, arc.arc_title));
        setLastResult(loadQuizResult(journeyId, arcIndex));
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [journeyId, arcIndex]);

  if (loading) {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !row || !meta) {
    return (
      <div className="paper-texture flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground">{error ?? "Arc not found"}</p>
        <Link
          to={`/journeys/${id}`}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to journey
        </Link>
      </div>
    );
  }

  const arc = row.journey.arcs[arcIndex];
  const nextArcExists = arcIndex + 1 < row.journey.arcs.length;
  const scoreText = lastResult
    ? Number.isInteger(lastResult.score)
      ? `${lastResult.score}`
      : lastResult.score.toFixed(1)
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar — mirrors TeachingPage */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2">
          <Link
            to={`/journeys/${id}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium hidden sm:inline">Back</span>
          </Link>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            Arc complete
          </span>
        </div>
        <div className="h-[2px] bg-surface">
          <div className="h-full w-full bg-foreground/30" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-16 md:px-8">
          <header className="mb-10 animate-fade-in">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70 mb-2">
              {arc.arc_title}
            </p>
            <h1 className="text-3xl font-serif font-semibold tracking-tight text-foreground md:text-4xl">
              That's the arc.
            </h1>
          </header>

          <article className="prose prose-neutral dark:prose-invert max-w-none mb-10 animate-fade-in prose-p:font-serif prose-p:text-[1.15rem] prose-p:leading-[1.85] prose-p:text-foreground/90">
            <p>
              Nicely done. We've come all the way from a car video and a nagging
              question about speedometers to a real, precise definition of the
              derivative — and we proved the first theorem that follows from it.
              Take a breath.
            </p>
            {meta.has_quiz ? (
              <p>
                There's a short <em>check-in</em> if you'd like to try it — a handful of
                questions to see how the ideas have settled. If you'd rather play
                with some problems first before committing, there's a small
                practice set too. Or skip it and push on — the choice is yours.
              </p>
            ) : (
              <p>
                There's a small practice set if you'd like to play with the ideas
                before moving on. No pressure — skip ahead whenever you're ready.
              </p>
            )}
          </article>

          <div className="space-y-3 animate-fade-in-up opacity-0" style={{ animationDelay: "120ms" }}>
            {meta.has_practice && (
              <button
                onClick={() => navigate(`/journeys/${id}/arc/${arcIdx}/practice`)}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-left shadow-soft transition-all",
                  "hover:border-foreground/20 hover:shadow-medium"
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface">
                  <Dumbbell className="h-5 w-5 text-foreground/70" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Practice first</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Five problems to play with. Hints available, no record kept.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {meta.has_quiz && (
              <button
                onClick={() => navigate(`/journeys/${id}/arc/${arcIdx}/quiz`)}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5 text-left shadow-soft transition-all",
                  "hover:border-foreground/20 hover:shadow-medium"
                )}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface">
                  <PenSquare className="h-5 w-5 text-foreground/70" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Take the check-in</p>
                    {lastResult && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground tabular-nums">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                        Last: {scoreText}/{lastResult.total}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Seven questions. Submit when ready — I'll walk through each one with you.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            <button
              onClick={() => navigate(nextArcExists ? `/journeys/${id}` : `/journeys/${id}`)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-transparent px-6 py-5 text-left transition-all",
                "hover:bg-card hover:border-border"
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface/60">
                <SkipForward className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground/80">
                  {nextArcExists ? "Skip for now — next arc" : "Skip for now — back to journey"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  You can always come back to these from the journey page.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
