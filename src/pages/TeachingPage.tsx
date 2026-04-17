import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Sun, Moon, Loader2, BookOpen } from "lucide-react";
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
  const ts = context?.teaching_state;

  const [pageIndex, setPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-2">
          <Link
            to={journeyId ? `/journeys/${journeyId}` : "/journeys"}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-medium hidden sm:inline">Back</span>
          </Link>

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
    </div>
  );
}
