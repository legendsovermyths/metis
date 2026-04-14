import { useState, useEffect, useCallback } from "react";
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
  // Protect escaped dollars (\$) so they aren't treated as math delimiters
  let result = md.replace(/\\\$/g, ESC_DOLLAR);

  // Display math $$...$$ (may span lines)
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
    } catch {
      return `$$${tex}$$`;
    }
  });
  // Inline math $...$
  result = result.replace(/(?<!\$)\$(?!\$)((?:[^$\n\\]|\\.){1,200}?)\$(?!\$)/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${tex}$`;
    }
  });

  // Restore escaped dollars as literal $
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

  const journey = ts?.journey;
  const journeyId = journey?.id;
  const arcIndex = ts?.progress.arc_idx ?? 0;
  const arc = journey?.journey.arcs[arcIndex];
  const arcProgress = ts?.progress.arcs[arcIndex];
  const dialogues = arcProgress?.dialogues ?? [];
  const currentTopicIndex = arcProgress?.topic_idx ?? 0;
  const arcDone = arcProgress?.completed ?? false;
  const topicsTotal = arc?.topics.length ?? 0;
  const currentTopic = arc?.topics[currentTopicIndex]?.name ?? "";
  const progressPct = topicsTotal > 0 ? (currentTopicIndex / topicsTotal) * 100 : 0;

  useEffect(() => {
    if (dialogues.length > 0) {
      setPageIndex(dialogues.length - 1);
    }
  }, [dialogues.length]);

  const handleNext = useCallback(async () => {
    if (isLoading) return;

    if (pageIndex < dialogues.length - 1) {
      setPageIndex((p) => p + 1);
      return;
    }

    if (arcDone) return;
    setIsLoading(true);
    setError(null);

    try {
      await sendMessage();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pageIndex, dialogues.length, arcDone]);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) setPageIndex((p) => p - 1);
  }, [pageIndex]);

  if (!ts || !arc) {
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

  const totalPages = dialogues.length;
  const isOnLastPage = pageIndex >= totalPages - 1;
  const hasNoPages = totalPages === 0;
  const currentDialogue: Dialogue | undefined = dialogues[pageIndex];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-card/80 px-4 py-2 backdrop-blur-xl">
        <Link
          to={journeyId ? `/journeys/${journeyId}` : "/journeys"}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Teaching
        </div>
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

      {/* Subtle progress bar */}
      <div className="h-[2px] bg-surface">
        <div
          className="h-full bg-foreground/30 transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-8">
          {/* Arc + topic heading */}
          <header className="mb-10 animate-fade-in">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70 mb-2">
              {arc.arc_title}
            </p>
            <h1 className="text-2xl font-serif font-semibold tracking-tight text-foreground md:text-3xl">
              {currentTopic || arc.topics[0]?.name || "Starting..."}
            </h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1 flex-1 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/40 transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                {currentTopicIndex}/{topicsTotal}
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
              {currentDialogue?.image_url && (
                <div className="mb-8 flex justify-center">
                  <img
                    src={convertFileSrc(currentDialogue.image_url)}
                    alt="Blackboard figure"
                    className={cn(
                      "max-w-full h-auto rounded-lg",
                      "dark:invert"
                    )}
                  />
                </div>
              )}
              <article
                className={cn(
                  "prose prose-neutral dark:prose-invert max-w-none",
                  "prose-headings:font-serif prose-headings:tracking-tight",
                  "prose-p:leading-[1.8] prose-p:text-foreground/90",
                  "prose-blockquote:border-foreground/20 prose-blockquote:text-foreground/70",
                  "prose-strong:text-foreground prose-strong:font-semibold",
                  "prose-code:text-foreground/80 prose-code:bg-surface prose-code:rounded prose-code:px-1",
                  "[&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto",
                  "[&_.katex]:text-foreground"
                )}
              >
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {preprocessMath(currentDialogue?.content ?? "")}
                </ReactMarkdown>
              </article>
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

          {arcDone && isOnLastPage && (
            <div className="mt-12 text-center animate-fade-in">
              <div className="inline-block rounded-xl border border-border bg-card p-8 shadow-soft">
                <p className="text-base font-medium text-foreground mb-2">Arc complete</p>
                <p className="text-sm text-muted-foreground mb-6">
                  You've finished all topics in {arc.arc_title}.
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

      {/* Bottom bar: page navigation */}
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

          {arcDone && isOnLastPage ? (
            <Button
              size="sm"
              onClick={() => navigate(journeyId ? `/journeys/${journeyId}` : "/journeys")}
              className="rounded-xl shadow-soft"
            >
              Finish
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
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
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
