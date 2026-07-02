import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getExplanation, teachingInit, type ExplanationRow } from "@/lib/service";
import { journeyGlyph } from "@/lib/editorial";

export default function ExplanationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = id !== undefined ? Number(id) : NaN;
  const [row, setRow] = useState<ExplanationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(numericId)) {
      setLoading(false);
      setError("Invalid explanation");
      return;
    }
    setLoading(true);
    setError(null);
    getExplanation(numericId)
      .then(setRow)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [numericId]);

  const steps = row?.explanation.steps ?? [];
  const completedSteps = row?.completed_steps ?? 0;
  const totalSteps = row?.total_steps ?? 0;
  const allDone = totalSteps > 0 && completedSteps >= totalSteps;
  const progressRatio = totalSteps > 0 ? completedSteps / totalSteps : 0;

  const glyph = useMemo(() => (row ? journeyGlyph(row.id) : ""), [row]);

  const handleContinue = async () => {
    if (starting) return;
    setStarting(true);
    try {
      await teachingInit("Explanation", numericId);
      navigate("/teach");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStarting(false);
    }
  };

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
        <p className="text-text-secondary">{error || "Explanation not found"}</p>
        <Link to="/studies" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
          Return to the study
        </Link>
      </div>
    );
  }

  const title = row.title || "Untitled explanation";

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

        {/* Header — explanation glyph watermark behind */}
        <header className="relative mb-12 animate-blur-in">
          <span
            className="pointer-events-none absolute -top-10 -right-4 select-none font-display italic leading-none"
            style={{ fontSize: "clamp(10rem, 22vw, 18rem)", color: "hsl(var(--foreground) / 0.035)" }}
            aria-hidden
          >
            {glyph}
          </span>

          <p className="label-whisper text-text-tertiary mb-4 relative z-10">A worked problem</p>
          <h1 className="display-hero text-4xl md:text-5xl text-foreground leading-tight mb-0 relative z-10">
            {title}
          </h1>
          <div
            className="h-px w-12 mt-5 mb-5 animate-reveal-line relative z-10"
            style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
          />
          <p className="font-display italic text-base text-text-secondary leading-relaxed relative z-10 max-w-md">
            The route from first grasp to the applied result, worked one step at a time.
          </p>
          <p className="label-whisper text-text-tertiary tabular-nums relative z-10 mt-3">
            {totalSteps > 0 ? `${totalSteps} ${totalSteps === 1 ? "step" : "steps"}` : "no steps yet"}
          </p>
        </header>

        {steps.length === 0 ? (
          <p className="mt-4 font-display italic text-sm text-text-secondary animate-blur-in">
            This explanation has no steps yet.
          </p>
        ) : (
          <>
            {/* Section header for the route */}
            <div className="mb-2 flex items-baseline gap-4">
              <span className="label-whisper text-text-tertiary">The Route</span>
              <div className="h-px flex-1 bg-border/30" />
              <span className="label-whisper text-text-tertiary tabular-nums">
                {completedSteps}/{totalSteps} steps
              </span>
            </div>

            {/* Step list with vertical timeline line */}
            <div className="relative mt-4">
              <div className="absolute left-[4px] top-3 bottom-3 w-px bg-border/25" />

              {steps.map((step, i) => {
                const done = i < completedSteps;
                const current = i === completedSteps && !allDone;
                return (
                  <div
                    key={i}
                    className="relative flex gap-6 pb-9 last:pb-0 animate-blur-in opacity-0"
                    style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}
                  >
                    {/* Node marker on the timeline */}
                    <span className="relative z-10 mt-[7px] shrink-0" aria-hidden>
                      {done ? (
                        <span
                          className="block h-[9px] w-[9px] rounded-full"
                          style={{ backgroundColor: "hsl(var(--amber))", opacity: 0.7 }}
                        />
                      ) : current ? (
                        <span
                          className="block h-[9px] w-[9px] rounded-full border-2 bg-background"
                          style={{ borderColor: "hsl(var(--amber))" }}
                        />
                      ) : (
                        <span className="block h-[9px] w-[9px] rounded-full border border-border/50 bg-background" />
                      )}
                    </span>

                    {/* Label · name · brief */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span
                          className="label-whisper"
                          style={{
                            color: current ? "hsl(var(--amber))" : undefined,
                            opacity: done ? 0.6 : 1,
                          }}
                        >
                          <span className={cn(!current && "text-text-tertiary")}>{step.label}</span>
                        </span>
                        {done && (
                          <span className="flex shrink-0 items-center gap-1 font-display text-[11px] italic text-text-tertiary">
                            <Check className="h-3 w-3" style={{ color: "hsl(var(--amber))", opacity: 0.7 }} />
                            done
                          </span>
                        )}
                      </div>

                      <h3
                        className={cn(
                          "mt-1.5 font-display text-lg italic leading-snug transition-colors",
                          done ? "text-text-secondary" : "text-foreground",
                        )}
                      >
                        {step.name}
                      </h3>

                      {step.brief && (
                        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                          {step.brief}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Fixed action bar — top edge gilds with amber as progress advances */}
      {steps.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl">
          <div className="relative h-px w-full overflow-hidden bg-border/30">
            {totalSteps > 0 && (
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
              step {completedSteps} of {totalSteps}
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
              ) : completedSteps > 0 ? (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Begin the walk
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
