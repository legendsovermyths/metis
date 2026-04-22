import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
  X as XIcon,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  getQuiz,
  submitQuiz,
  type Quiz,
  type QuizResult,
  type Verdict,
} from "@/lib/mockAssessment";

const ESC_DOLLAR = "\u0000ESCDOLLAR\u0000";

function preprocessMath(md: string): string {
  let result = md.replace(/\\\$/g, ESC_DOLLAR);
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `$$${tex}$$`;
    }
  });
  result = result.replace(/(?<!\$)\$(?!\$)((?:[^$\n\\]|\\.){1,400}?)\$(?!\$)/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${tex}$`;
    }
  });
  result = result.split(ESC_DOLLAR).join("$");
  return result;
}

function VerdictIcon({ verdict }: { verdict: Verdict }) {
  if (verdict === "correct") return <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />;
  if (verdict === "partial") return <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={2} />;
  return <XIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />;
}

function verdictLabel(v: Verdict): string {
  return v === "correct" ? "Correct" : v === "partial" ? "Partial" : "Not yet";
}

function verdictRing(v: Verdict): string {
  return v === "correct"
    ? "ring-emerald-500/20 bg-emerald-500/[0.04]"
    : v === "partial"
    ? "ring-amber-500/20 bg-amber-500/[0.04]"
    : "ring-rose-500/20 bg-rose-500/[0.04]";
}

export default function QuizPage() {
  const { id, arcIdx } = useParams();
  const navigate = useNavigate();
  const journeyId = Number(id);
  const arcIndex = Number(arcIdx);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<string[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!Number.isFinite(journeyId) || !Number.isFinite(arcIndex)) {
      setError("Invalid quiz");
      setLoading(false);
      return;
    }
    setLoading(true);
    getQuiz(journeyId, arcIndex)
      .then((q) => {
        setQuiz(q);
        setAnswers(new Array(q.questions.length).fill(""));
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [journeyId, arcIndex]);

  const total = quiz?.questions.length ?? 0;
  const answeredCount = useMemo(
    () => answers.filter((a) => a.trim().length > 0).length,
    [answers]
  );
  const allAnswered = total > 0 && answeredCount === total;
  const isLast = qIdx >= total - 1;
  const isFirst = qIdx === 0;
  const currentAnswer = answers[qIdx] ?? "";

  const setCurrentAnswer = useCallback(
    (v: string) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[qIdx] = v;
        return next;
      });
    },
    [qIdx]
  );

  const goNext = useCallback(() => {
    if (!isLast) setQIdx((i) => i + 1);
  }, [isLast]);

  const goPrev = useCallback(() => {
    if (!isFirst) setQIdx((i) => i - 1);
  }, [isFirst]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const r = await submitQuiz(journeyId, arcIndex, answers);
      setResult(r);
      setTimeout(() => reviewRef.current?.scrollTo({ top: 0, behavior: "auto" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }, [quiz, submitting, journeyId, arcIndex, answers]);

  const handleRetake = useCallback(() => {
    if (!quiz) return;
    setAnswers(new Array(quiz.questions.length).fill(""));
    setQIdx(0);
    setResult(null);
  }, [quiz]);

  if (loading) {
    return (
      <div className="paper-texture flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="paper-texture flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <p className="text-muted-foreground">{error ?? "Quiz not found"}</p>
        <Link
          to={`/journeys/${id}`}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to journey
        </Link>
      </div>
    );
  }

  // --- REVIEW (post-submission) ---
  if (result) {
    const scoreText = Number.isInteger(result.score) ? `${result.score}` : result.score.toFixed(1);
    const correctCount = result.evaluations.filter((e) => e.verdict === "correct").length;
    const partialCount = result.evaluations.filter((e) => e.verdict === "partial").length;
    const verbal =
      result.score / result.total >= 0.85
        ? "A strong pass. You've internalized the moves."
        : result.score / result.total >= 0.6
        ? "Solid showing. A few spots to firm up — have a look below."
        : "The mechanics are within reach, but the intuition needs another pass. Take another run whenever you're ready.";

    return (
      <div ref={reviewRef} className="paper-texture min-h-screen">
        {/* Top bar */}
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
              Check-in · Review
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-12 pb-24">
          {/* Score header */}
          <div className="mb-10 animate-fade-in">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Your result
            </p>
            <div className="mt-3 flex items-baseline gap-3">
              <h1 className="font-serif text-6xl font-semibold tracking-tight text-foreground tabular-nums">
                {scoreText}
              </h1>
              <span className="font-serif text-2xl text-muted-foreground tabular-nums">
                / {result.total}
              </span>
            </div>
            <p className="mt-5 max-w-xl font-serif text-lg italic leading-relaxed text-foreground/80">
              {verbal}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                {correctCount} correct
              </span>
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                {partialCount} partial
              </span>
              <span className="flex items-center gap-1.5">
                <XIcon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
                {result.total - correctCount - partialCount} to revisit
              </span>
            </div>
          </div>

          <div className="mb-4 h-px bg-border/60" />

          {/* Per-question review */}
          <div className="space-y-5">
            {quiz.questions.map((q, i) => {
              const ev = result.evaluations[i];
              const ans = result.answers[i];
              return (
                <div
                  key={q.id}
                  className={cn(
                    "rounded-2xl border border-border bg-card p-6 shadow-soft ring-1 animate-fade-in-up opacity-0",
                    verdictRing(ev.verdict)
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                      Question {i + 1}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                      <VerdictIcon verdict={ev.verdict} />
                      {verdictLabel(ev.verdict)}
                    </span>
                  </div>

                  <article className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-foreground/90">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {preprocessMath(q.prompt)}
                    </ReactMarkdown>
                  </article>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                        Your answer
                      </p>
                      <div className="rounded-xl border border-border/60 bg-surface/60 p-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-sans">
                        {ans.trim() ? (
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {preprocessMath(ans)}
                          </ReactMarkdown>
                        ) : (
                          <span className="italic text-muted-foreground">No answer given</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                        Ideal answer
                      </p>
                      <article className="prose prose-sm prose-neutral dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-foreground/90">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {preprocessMath(q.ideal_answer)}
                        </ReactMarkdown>
                      </article>
                    </div>

                    <div className="rounded-xl border-l-2 border-foreground/20 bg-surface/40 py-2 pl-3 pr-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70 mb-1">
                        Professor Metis
                      </p>
                      <article className="prose prose-sm prose-neutral dark:prose-invert max-w-none font-serif italic prose-p:leading-relaxed prose-p:text-foreground/90">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {preprocessMath(ev.feedback)}
                        </ReactMarkdown>
                      </article>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fade-in">
            <Button
              variant="ghost"
              onClick={handleRetake}
              className="rounded-xl"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button
              onClick={() => navigate(`/journeys/${id}`)}
              className="rounded-xl shadow-soft"
            >
              Back to journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAKING (pre-submission) ---
  const q = quiz.questions[qIdx];

  return (
    <div className="paper-texture flex min-h-screen flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <Link
            to={`/journeys/${id}`}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Leave check-in</span>
          </Link>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
            Check-in
          </span>
        </div>
        {/* Dot row — answered status */}
        <div className="mx-auto flex max-w-3xl items-center gap-1.5 px-6 pb-3">
          {quiz.questions.map((_, i) => {
            const answered = (answers[i] ?? "").trim().length > 0;
            const current = i === qIdx;
            return (
              <button
                key={i}
                onClick={() => setQIdx(i)}
                aria-label={`Go to question ${i + 1}`}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-300",
                  current
                    ? "bg-foreground"
                    : answered
                    ? "bg-foreground/40"
                    : "bg-surface"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
          <header className="mb-8 animate-fade-in">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
              {quiz.arc_title} · Question {qIdx + 1} of {total}
            </p>
          </header>

          <div key={qIdx} className="animate-fade-in">
            <article className="prose prose-neutral dark:prose-invert max-w-none mb-8 prose-headings:font-serif prose-p:font-serif prose-p:text-[1.25rem] prose-p:leading-[1.7] prose-p:text-foreground prose-p:mt-0 first:prose-p:mt-0">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {preprocessMath(q.prompt)}
              </ReactMarkdown>
            </article>

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                Your answer
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Write freely — use $...$ for math if it helps. You can revise before submitting."
                rows={8}
                className="w-full resize-none rounded-2xl border border-border bg-card p-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 shadow-soft focus:border-foreground/30 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 z-40 border-t border-border bg-card/80 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            disabled={isFirst}
            className="rounded-xl"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>

          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {answeredCount}/{total} answered
          </span>

          {isLast ? (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || answeredCount === 0}
              className="rounded-xl shadow-soft"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  Submit{!allAnswered && ` (${answeredCount}/${total})`}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={goNext}
              className="rounded-xl"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
