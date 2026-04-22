import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Sun, Moon, Loader2, BookOpen, Hand, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAppContext } from "@/context/AppContext";
import { sendMessage, type Dialogue } from "@/lib/service";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import katex from "katex";
import "katex/dist/katex.min.css";

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
  result = result.replace(/(?<!\$)\$(?!\$)((?:[^$\n\\]|\\.){1,200}?)\$(?!\$)/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${tex}$`;
    }
  });

  result = result.split(ESC_DOLLAR).join("$");
  return result;
}

export default function TeachingPage() {
  const { theme, toggle } = useTheme();
  const { context } = useAppContext();
  const navigate = useNavigate();
  const ts = context?.teaching;

  const [pageIndex, setPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type Exchange = { question: string; answer: string };
  const [isAsking, setIsAsking] = useState(false);
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const exchangesEndRef = useRef<HTMLDivElement>(null);

  const mockAnswers = useMemo(
    () => [
      "Good question — and actually a subtle one. When we shrink the interval toward zero, we're not dividing by zero; we're asking what the ratio *approaches*. That distinction is the whole point of the limit. 'At zero' is undefined, but 'arbitrarily close to zero' has a perfectly well-defined answer. Hold onto that feeling — it's the same move we'll use over and over.",
      "Right, so the wobble matters because within any finite interval the speed can genuinely vary. The trick isn't to eliminate the wobble — it's to make the interval small enough that the wobble becomes *irrelevant*. That's why we take the limit rather than just 'pick a small number.'",
      "Yes, exactly — you're putting your finger on why calculus was controversial for two centuries. Newton and Leibniz were a bit hand-wavy about this. It took Cauchy and Weierstrass to make it rigorous. But the intuition you have now is the same one they had; you're just catching up to the formalism.",
    ],
    []
  );

  const openAside = useCallback(() => {
    setIsAsking(true);
  }, []);

  const dismissAside = useCallback(() => {
    if (isThinking) return;
    setIsAsking(false);
    setTimeout(() => {
      setQuestion("");
      setExchanges([]);
      setPendingQuestion(null);
    }, 200);
  }, [isThinking]);

  const handleAsk = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q || isThinking) return;
    setPendingQuestion(q);
    setQuestion("");
    setIsThinking(true);
    await new Promise((r) => setTimeout(r, 1400));
    setExchanges((prev) => {
      const answer = mockAnswers[prev.length % mockAnswers.length];
      return [...prev, { question: q, answer }];
    });
    setPendingQuestion(null);
    setIsThinking(false);
  }, [question, isThinking, mockAnswers]);

  useEffect(() => {
    if (isAsking) {
      exchangesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [exchanges.length, pendingQuestion, isAsking]);

  useEffect(() => {
    if (!isAsking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismissAside();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAsking, dismissAside]);

  const artifacts = ts?.artifacts?.data;
  const journeyId = artifacts?.id;
  const progress = artifacts?.progress;
  const journey = artifacts?.journey;

  const allDialogues = useMemo<Dialogue[]>(() => {
    if (!progress?.dialogues?.data) return [];
    const d = progress.dialogues.data;
    return [...(d.data ?? []), ...(d.dirty ?? [])];
  }, [progress?.dialogues]);

  const currentArcIdx = progress?.arc_idx ?? 0;
  const currentTopicIdx = progress?.topic_idx ?? 0;
  const currentArc = journey?.arcs[currentArcIdx];
  const isJourneyComplete = progress?.is_journey_complete ?? false;

  const totalTopics = useMemo(() => {
    if (!journey) return 0;
    return journey.arcs.reduce((sum, arc) => sum + arc.topics.length, 0);
  }, [journey]);

  const completedTopics = useMemo(() => {
    if (!journey) return 0;
    let count = 0;
    for (let a = 0; a < currentArcIdx; a++) {
      count += journey.arcs[a]?.topics.length ?? 0;
    }
    count += currentTopicIdx;
    return count;
  }, [journey, currentArcIdx, currentTopicIdx]);

  const progressPct = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

  useEffect(() => {
    if (allDialogues.length > 0) {
      setPageIndex(allDialogues.length - 1);
    }
  }, [allDialogues.length]);

  const handleNext = useCallback(async () => {
    if (isLoading) return;

    if (pageIndex < allDialogues.length - 1) {
      setPageIndex((p) => p + 1);
      return;
    }

    if (isJourneyComplete) return;
    setIsLoading(true);
    setError(null);

    try {
      await sendMessage();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pageIndex, allDialogues.length, isJourneyComplete]);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) setPageIndex((p) => p - 1);
  }, [pageIndex]);

  if (!ts || !artifacts || !journey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 paper-texture px-6">
        <p className="text-muted-foreground">No active teaching session.</p>
        <Link
          to="/journeys"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Go to journeys
        </Link>
      </div>
    );
  }

  const totalPages = allDialogues.length;
  const isOnLastPage = pageIndex >= totalPages - 1;
  const hasNoPages = totalPages === 0;
  const currentDialogue: Dialogue | undefined = allDialogues[pageIndex];
  const displayHeading = currentDialogue?.heading || currentArc?.topics[0]?.name || "Starting...";
  const displayArc = currentDialogue
    ? journey.arcs[currentDialogue.arc_idx]?.arc_title
    : currentArc?.arc_title;

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col transition-[margin] duration-300 ease-out",
        isAsking && "md:mr-[420px]"
      )}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="relative flex items-center justify-between px-4 py-2">
          <Link
            to={journeyId ? `/journeys/${journeyId}` : "/journeys"}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium hidden sm:inline">Back</span>
          </Link>

          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            Teaching
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={openAside}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Raise hand to ask a question"
            >
              <Hand className="h-4 w-4" />
              <span className="hidden sm:inline">Raise hand</span>
            </button>
            <button
              onClick={toggle}
              className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-surface">
          <div
            className="h-full bg-foreground/30 transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
          {/* Arc + topic heading */}
          <header className="mb-10 animate-fade-in">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70 mb-2">
              {displayArc}
            </p>
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground md:text-3xl">
              {displayHeading}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1 flex-1 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/40 transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                {completedTopics}/{totalTopics}
              </span>
            </div>
          </header>

          {hasNoPages && !isLoading && (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-sm text-muted-foreground mb-6">
                Ready to begin. Press <span className="font-medium text-foreground">Begin</span> to
                start the lecture.
              </p>
            </div>
          )}

          {!hasNoPages && (
            <div key={pageIndex} className="animate-fade-in">
              {(() => {
                const raw = currentDialogue?.content ?? "";
                const imageUrl = currentDialogue?.blackboard?.image_url;
                const proseClasses = cn(
                  "prose prose-neutral dark:prose-invert max-w-none",
                  "prose-headings:font-serif prose-headings:tracking-tight",
                  "prose-p:leading-[1.8] prose-p:text-foreground/90",
                  "prose-blockquote:border-foreground/20 prose-blockquote:text-foreground/70",
                  "prose-strong:text-foreground prose-strong:font-semibold",
                  "prose-code:text-foreground/80 prose-code:bg-surface prose-code:rounded prose-code:px-1",
                  "[&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto",
                  "[&_.katex]:text-foreground"
                );

                if (!imageUrl) {
                  return (
                    <article className={proseClasses}>
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {preprocessMath(raw)}
                      </ReactMarkdown>
                    </article>
                  );
                }

                const paragraphs = raw.split(/\n{2,}/);
                const mid = Math.ceil(paragraphs.length / 2);
                const before = paragraphs.slice(0, mid).join("\n\n");
                const after = paragraphs.slice(mid).join("\n\n");

                return (
                  <>
                    <article className={proseClasses}>
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {preprocessMath(before)}
                      </ReactMarkdown>
                    </article>
                    <div className="my-8 flex justify-center">
                      <img
                        src={convertFileSrc(imageUrl)}
                        alt="Blackboard figure"
                        className={cn("max-w-full h-auto rounded-lg", "dark:invert")}
                      />
                    </div>
                    {after && (
                      <article className={proseClasses}>
                        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                          {preprocessMath(after)}
                        </ReactMarkdown>
                      </article>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {isLoading && (
            <div className="mt-8 flex items-center gap-2 animate-fade-in">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Composing next section...</span>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {isJourneyComplete && isOnLastPage && (
            <div className="mt-12 text-center animate-fade-in">
              <div className="inline-block rounded-xl border border-border bg-card p-8 shadow-soft">
                <p className="text-base font-medium text-foreground mb-2">Journey complete</p>
                <p className="text-sm text-muted-foreground mb-6">
                  You've finished all topics. Well done.
                </p>
                <Button
                  onClick={() => navigate(journeyId ? `/journeys/${journeyId}` : "/journeys")}
                  className="rounded-xl px-6 shadow-soft"
                >
                  Back to journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={pageIndex <= 0}
            className="rounded-xl"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prev
          </Button>

          {totalPages > 0 && (
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {pageIndex + 1} of {totalPages}
            </span>
          )}

          {isJourneyComplete && isOnLastPage ? (
            <Button
              size="sm"
              onClick={() => navigate(journeyId ? `/journeys/${journeyId}` : "/journeys")}
              className="rounded-xl shadow-soft"
            >
              Finish
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : isOnLastPage || hasNoPages ? (
            <Button
              size="sm"
              onClick={handleNext}
              disabled={isLoading}
              className="rounded-xl shadow-soft"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : hasNoPages ? (
                <>
                  Begin
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
              disabled={pageIndex >= totalPages - 1}
              className="rounded-xl"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isAsking && (
        <aside
          className="fixed right-0 top-0 bottom-0 z-[60] flex w-full max-w-[420px] flex-col border-l border-border bg-card shadow-soft animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
              Professor Metis pauses
            </p>
            <button
              onClick={dismissAside}
              disabled={isThinking}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {exchanges.length === 0 && !pendingQuestion && (
              <div className="pt-2">
                <p className="mb-3 font-serif text-lg font-medium tracking-tight text-foreground">
                  What would you like to ask?
                </p>
                <p className="text-xs italic leading-relaxed text-muted-foreground">
                  The lecture stays beside you — refer to it as needed.
                </p>
              </div>
            )}

            <div className="space-y-8">
              {exchanges.map((ex, i) => (
                <div key={i}>
                  <div className="mb-3 border-l-2 border-foreground/15 pl-3">
                    <p className="text-sm italic text-muted-foreground">"{ex.question}"</p>
                  </div>
                  <article className="font-serif text-[15px] italic leading-[1.8] text-foreground/90">
                    {ex.answer}
                  </article>
                  {i < exchanges.length - 1 && (
                    <div className="mt-8 flex justify-center">
                      <span className="text-muted-foreground/30 text-xs tracking-[0.4em]">···</span>
                    </div>
                  )}
                </div>
              ))}

              {pendingQuestion && (
                <div>
                  <div className="mb-3 border-l-2 border-foreground/15 pl-3">
                    <p className="text-sm italic text-muted-foreground">"{pendingQuestion}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs italic text-muted-foreground">
                      Professor Metis is thinking...
                    </span>
                  </div>
                </div>
              )}
              <div ref={exchangesEndRef} />
            </div>
          </div>

          <div className="border-t border-border/60 px-6 py-4">
            <form onSubmit={handleAsk}>
              <textarea
                autoFocus
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleAsk(e as unknown as React.FormEvent);
                  }
                }}
                rows={exchanges.length === 0 ? 3 : 2}
                disabled={isThinking}
                className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:outline-none disabled:opacity-50"
                placeholder={
                  exchanges.length === 0
                    ? "Anything about what we just covered..."
                    : "A follow-up..."
                }
              />
              <div className="mt-3 flex items-center justify-between">
                {exchanges.length > 0 ? (
                  <button
                    type="button"
                    onClick={dismissAside}
                    disabled={isThinking}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    Back to lecture
                  </button>
                ) : (
                  <span className="text-[10px] text-muted-foreground/60">⌘↵ to ask</span>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={!question.trim() || isThinking}
                  className="rounded-xl shadow-soft"
                >
                  Ask
                </Button>
              </div>
            </form>
          </div>
        </aside>
      )}
    </div>
  );
}
