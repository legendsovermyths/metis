import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Route, Sun, Moon, ArrowLeft, ArrowRight, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAppContext } from "@/context/AppContext";
import { generateCourse, sendMessage } from "@/lib/service";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import { Link, useNavigate } from "react-router-dom";

type Mode = "onboarding" | "teaching" | "advising" | "idle";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const modeInfo: Record<Mode, { label: string; icon: React.ElementType }> = {
  onboarding: { label: "Getting to know you", icon: User },
  teaching: { label: "Teaching", icon: Sparkles },
  advising: { label: "Advising", icon: Route },
  idle: { label: "Chat", icon: MessageCircle },
};

function phaseToMode(phase: string | undefined): Mode {
  switch (phase) {
    case "Onboarding": return "onboarding";
    case "Teaching": return "teaching";
    case "Advising": return "advising";
    default: return "idle";
  }
}

export default function ChatPage() {
  const { theme, toggle } = useTheme();
  const { context } = useAppContext();
  const navigate = useNavigate();
  const phase = context?.chat_state?.phase;
  const mode = phaseToMode(phase);
  const chatDone = context?.chat_state?.is_done ?? false;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [creatingJourney, setCreatingJourney] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBusy = isWaiting || isStreaming;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting, isStreaming]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!creatingJourney) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [creatingJourney]);

  const streamText = (fullText: string) => {
    const msgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: msgId, role: "assistant", content: "" }]);
    setIsStreaming(true);

    let i = 0;
    streamIntervalRef.current = setInterval(() => {
      const chunkSize = Math.floor(Math.random() * 3) + 1;
      i += chunkSize;

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, content: fullText.slice(0, i) } : m))
      );

      if (i >= fullText.length) {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
        setIsStreaming(false);
      }
    }, 15);
  };

  const handleSend = async () => {
    if (!input.trim() || isBusy) return;

    const text = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsWaiting(true);

    try {
      await new Promise((r) => setTimeout(r, 0));
      const response = await sendMessage(text);
      setIsWaiting(false);
      streamText(response.message);
    } catch (err) {
      setIsWaiting(false);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const ModeIcon = modeInfo[mode].icon;

  return (
    <div className="relative flex h-[calc(100vh-57px)] flex-col md:h-screen">
      {creatingJourney && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center paper-texture bg-background/92 backdrop-blur-md px-6 animate-fade-in"
          role="alertdialog"
          aria-modal="true"
          aria-busy="true"
          aria-labelledby="journey-loader-title"
          aria-describedby="journey-loader-desc"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/4 left-1/2 h-[min(70vw,28rem)] w-[min(70vw,28rem)] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.12]" />
            <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-foreground/[0.04] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-md text-center">
            <div className="relative mx-auto mb-8 flex h-[5.5rem] w-[5.5rem] items-center justify-center">
              <span className="absolute inset-0 rounded-2xl border border-border/60 bg-card/80 shadow-medium animate-pulse-soft" />
              <span className="absolute inset-2 rounded-xl border border-border/40 opacity-60" />
              <Route className="relative h-10 w-10 text-foreground/90" strokeWidth={1.35} aria-hidden />
            </div>

            <h2
              id="journey-loader-title"
              className="text-4xl font-serif font-semibold tracking-tighter text-foreground md:text-5xl"
            >
              Metis
            </h2>
            <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Crafting your journey
            </p>

            <p id="journey-loader-desc" className="mt-8 text-sm leading-relaxed text-muted-foreground">
              Extracting your chapter, drafting arcs and topics, and saving your path. This usually takes a little while.
            </p>

            {context?.chapter_title?.trim() ? (
              <p className="mt-5 rounded-xl border border-border/80 bg-card/60 px-4 py-3 text-xs font-medium text-foreground/90 shadow-soft">
                {context.chapter_title.trim()}
              </p>
            ) : null}

            <div className="mx-auto mt-10 flex max-w-[220px] flex-col items-center gap-4">
              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[35%] rounded-full bg-foreground/45 animate-shimmer bg-gradient-to-r from-transparent via-foreground/50 to-transparent bg-[length:200%_100%]" />
              </div>
              <Loader2
                className="h-8 w-8 animate-spin text-muted-foreground/70 [animation-duration:1.65s]"
                aria-hidden
              />
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card/50 px-4 py-2 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Back</span>
        </Link>
        <div className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <ModeIcon className="h-3.5 w-3.5" />
          {modeInfo[mode].label}
        </div>
        <button
          onClick={toggle}
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center text-center animate-fade-in">
              <div className="mb-4 text-4xl font-serif font-semibold tracking-tighter text-foreground">Metis</div>
              <h2 className="text-lg font-medium text-foreground">
                {mode === "onboarding" && "Tell me about yourself"}
                {mode === "teaching" && "Let's explore an idea together"}
                {mode === "advising" && "What would you like to learn next?"}
                {mode === "idle" && "What's on your mind?"}
              </h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                {mode === "onboarding" && "I'll adapt my teaching approach based on your background and preferences."}
                {mode === "teaching" && "I'll guide you to the answer through questions, not direct explanations."}
                {mode === "advising" && "Let's figure out the best path for your learning journey."}
                {mode === "idle" && "Ask me anything or head to your library to get started."}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "animate-slide-up",
                msg.role === "user" ? "flex justify-end" : "flex justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-surface text-foreground"
                )}
              >
                <div className="whitespace-pre-wrap chat-latex">
                  <Latex>{msg.content}</Latex>
                </div>
                {msg.role === "assistant" && isStreaming && msg.id === messages[messages.length - 1]?.id && (
                  <span className="inline-block h-4 w-0.5 bg-foreground animate-pulse-soft ml-0.5" />
                )}
              </div>
            </div>
          ))}

          {isWaiting && (
            <div className="flex justify-start animate-slide-up">
              <div className="rounded-2xl bg-surface px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Thinking…</span>
              </div>
            </div>
          )}

          {chatDone && messages.length > 0 && !isBusy && phase !== "Advising" && (
            <div className="flex justify-center pt-4 animate-fade-in">
              <Button onClick={() => navigate("/")} className="rounded-xl px-6 shadow-soft">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {chatDone && messages.length > 0 && !isBusy && phase === "Advising" && (
            <div className="flex justify-center pt-4 animate-fade-in">
              <Button
                disabled={creatingJourney || !context?.chapter_title?.trim()}
                onClick={() => {
                  if (!context) return;
                  setCreatingJourney(true);
                  void generateCourse(context.chapter_title || undefined)
                    .then((artifacts) => {
                      const id = artifacts.id;
                      if (id != null && Number.isFinite(id)) {
                        navigate(`/journeys/${id}`);
                      } else {
                        navigate("/journeys");
                      }
                    })
                    .catch((err) => {
                      const msg: Message = {
                        id: (Date.now() + 1).toString(),
                        role: "assistant",
                        content: `Could not create journey: ${err instanceof Error ? err.message : String(err)}`,
                      };
                      setMessages((prev) => [...prev, msg]);
                    })
                    .finally(() => setCreatingJourney(false));
                }}
                className="rounded-xl px-6 shadow-soft"
              >
                Create journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area — hidden while chat_state.is_done */}
      {context && !chatDone && (
        <div className="border-t border-border bg-card/50 px-4 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <div className="min-w-0 flex-1 rounded-xl border border-border bg-background shadow-soft transition-shadow focus-within:border-ring/30 focus-within:shadow-medium">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something..."
                rows={1}
                className="w-full min-h-11 resize-none bg-transparent px-4 py-3 text-sm leading-5 text-foreground placeholder:text-muted-foreground focus:outline-none"
                style={{ maxHeight: "120px" }}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isBusy}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl shadow-soft"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
