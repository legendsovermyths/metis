import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { createExplanation, sendMessage, setChat } from "@/lib/service";
import { useJourneyCreation } from "@/context/JourneyCreationContext";
import { toast } from "sonner";
import { useMasthead, mastheadStyle, toRomanLower } from "@/lib/editorial";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import katex from "katex";
import { Link, useNavigate } from "react-router-dom";

const ESC_DOLLAR = " ESCDOLLAR ";

function preprocessMath(md: string): string {
  let result = md.replace(/\\\$/g, ESC_DOLLAR);
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
    try { return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `$$${tex}$$`; }
  });
  result = result.replace(/(?<!\$)\$(?!\$)((?:[^$\n\\]|\\.){1,400}?)\$(?!\$)/g, (_, tex) => {
    try { return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `$${tex}$`; }
  });
  return result.split(ESC_DOLLAR).join("$");
}

type Mode = "onboarding" | "teaching" | "advising" | "idle" | "exploring";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Exchange {
  key: string;
  user?: Message;
  assistant?: Message;
}

const modeGreeting: Record<Mode, {
  label: string;
  heading: string;
  verse: string;
  whisper: string;
  glyph: string;
}> = {
  onboarding: {
    label: "Onboarding",
    heading: "Tell me about yourself",
    verse: "We begin not with answers, but with questions.",
    whisper: "Speak of what you know, and what you do not.",
    glyph: "∂",
  },
  teaching: {
    label: "Teaching",
    heading: "Let us examine an idea",
    verse: "Two minds bent over the same page.",
    whisper: "Think aloud; there are no wrong steps.",
    glyph: "∑",
  },
  advising: {
    label: "Advising",
    heading: "What shall we explore?",
    verse: "Many paths, and you to choose.",
    whisper: "Tell me where your curiosity sits.",
    glyph: "◈",
  },
  idle: {
    label: "A Conversation",
    heading: "What's on your mind?",
    verse: "An hour kept aside for thinking.",
    whisper: "Speak as plainly as you like.",
    glyph: "ψ",
  },
  exploring: {
    label: "The Crossroads",
    heading: "What do you want to make sense of?",
    verse: "Bring the knot; we'll find the thread.",
    whisper: "A problem, a paper, a page. Set it down here.",
    glyph: "∴",
  },
};

function phaseToMode(phase: string | undefined): Mode {
  switch (phase) {
    case "Onboarding": return "onboarding";
    case "Teaching":   return "teaching";
    case "Advising":   return "advising";
    case "Exploring":  return "exploring";
    default:           return "idle";
  }
}

function historyToMessages(events: import("@/lib/service").ChatEvent[]): Message[] {
  return events
    .filter((e) => e.event_type === "UserMessage" || e.event_type === "LlmMessage")
    .map((e, i) => ({
      id: `history-${i}`,
      role: e.event_type === "UserMessage" ? "user" : "assistant",
      content: e.content,
    }));
}

function groupExchanges(msgs: Message[]): Exchange[] {
  const out: Exchange[] = [];
  let current: Exchange | null = null;
  for (const m of msgs) {
    if (m.role === "user") {
      if (current) out.push(current);
      current = { key: `ex-${m.id}`, user: m };
    } else {
      if (!current) {
        current = { key: `ex-${m.id}`, assistant: m };
      } else if (!current.assistant) {
        current.assistant = m;
      } else {
        out.push(current);
        current = { key: `ex-${m.id}`, assistant: m };
      }
    }
  }
  if (current) out.push(current);
  return out;
}

export default function ChatPage() {
  const { context } = useAppContext();
  const navigate = useNavigate();
  const masthead = useMasthead();
  const phase = context?.chat.phase;
  const mode = phaseToMode(phase);
  const greeting = modeGreeting[mode];
  const chatDone = context?.chat.is_done ?? false;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const { startJourneyCreation } = useJourneyCreation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seededRef = useRef(false);

  const isBusy = isWaiting || isStreaming;
  const exchanges = useMemo(() => groupExchanges(messages), [messages]);
  const turnCount = exchanges.length;

  useEffect(() => {
    if (seededRef.current || !context) return;
    const events = context.chat.event_history?.events ?? [];
    if (events.length > 0) {
      setMessages(historyToMessages(events));
    }
    seededRef.current = true;
  }, [context]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isWaiting, isStreaming]);

  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

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
      const text_out =
        response.message_type === "Chat"
          ? (response.content as { message: string }).message
          : "";
      streamText(text_out);
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
      void handleSend();
    }
  };

  // ── End-of-chat action button ─────────────────────────────────────────────
  const endAction = (() => {
    if (!chatDone || messages.length === 0 || isBusy) return null;
    if (phase === "Advising") {
      const chapter = context?.session.chapter_title?.trim() ?? "";
      const bookId = context?.session.book_id ?? null;
      const notes = context?.chat.notes ?? "";
      const canCreate = chapter.length > 0 && bookId != null;
      return {
        label: "Create a journey",
        disabled: !canCreate,
        onClick: () => {
          if (!canCreate || bookId == null) return;
          startJourneyCreation(
            { chapter_title: chapter, advisor_notes: notes, book_id: bookId },
            (errMsg) => {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: `Could not create journey: ${errMsg}`,
                },
              ]);
            },
          );
          navigate("/studies");
        },
      };
    }
    if (phase === "Exploring") {
      const pending = context?.chat.pending_action ?? null;
      if (pending?.kind === "explainer") {
        return {
          label: "Compose the explanation",
          disabled: false,
          onClick: async () => {
            try {
              await createExplanation(pending.problem_resource_id, pending.solution_resource_id);
              if (context) {
                await setChat({ ...context.chat, is_done: false, pending_action: null });
              }
              toast.success("Composing your explanation", {
                description: "Metis is charting the route. It will appear in your study.",
              });
              navigate("/studies");
            } catch {
              // Error already surfaced via toast by callBackend.
            }
          },
        };
      }
      return null;
    }
    return {
      label: "Get started",
      disabled: false,
      onClick: () => navigate("/"),
    };
  })();

  return (
    <div className="paper-texture relative flex h-[calc(100vh-57px)] flex-col overflow-hidden md:h-screen">
      {/* Mode glyph watermark */}
      <span
        className="pointer-events-none absolute -bottom-16 -right-8 select-none font-display font-light italic leading-none"
        style={{
          fontSize: "44vh",
          color: "hsl(var(--foreground) / 0.022)",
          lineHeight: 0.8,
        }}
        aria-hidden
      >
        {greeting.glyph}
      </span>

      {/* Header — back nav + masthead */}
      <header className="relative z-10 px-6 pt-16 md:px-10 md:pt-20">
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-text-tertiary transition-colors hover:text-foreground mb-7"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span className="label-whisper">Return</span>
        </Link>
        <div
          className="flex items-baseline justify-between gap-4 text-text-tertiary"
          style={mastheadStyle}
        >
          <span>Metis · A Dialogue</span>
          <span className="hidden sm:inline">
            {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
          </span>
        </div>
        <div className="mt-3 h-px w-full bg-border/40" />
      </header>

      {/* Messages area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pt-10 pb-10 md:px-10">
        <div className="mx-auto max-w-3xl">
          {/* Hero greeting — empty state */}
          {messages.length === 0 && (
            <div className="flex min-h-[55vh] flex-col items-start justify-end pb-10 animate-blur-in">
              <span className="label-whisper text-text-tertiary mb-5">
                — {greeting.label.toLowerCase()} —
              </span>
              <h1 className="display-hero text-[clamp(3rem,7vw,5.5rem)] text-foreground leading-[0.95] mb-0">
                {greeting.heading}
              </h1>
              <div
                className="h-px w-16 mt-7 mb-7 animate-reveal-line"
                style={{
                  backgroundColor: "hsl(var(--amber))",
                  transformOrigin: "left",
                }}
              />
              <p className="font-display italic text-xl text-foreground leading-snug mb-3 max-w-xl">
                {greeting.verse}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed max-w-md">
                {greeting.whisper}
              </p>
            </div>
          )}

          {/* Exchanges */}
          <div>
            {exchanges.map((ex, i) => {
              const numeral = toRomanLower(i + 1);
              const isFirstExchange = i === 0;
              const lastAssistantId = messages[messages.length - 1]?.role === "assistant"
                ? messages[messages.length - 1].id
                : null;

              return (
                <div
                  key={ex.key}
                  className="grid grid-cols-1 gap-x-5 md:grid-cols-[3rem_1fr] mb-12 animate-blur-in"
                >
                  {/* Marginalia gutter — desktop */}
                  <div
                    className="hidden md:block pt-1 text-right select-none font-display italic text-text-tertiary"
                    style={{ fontSize: "0.95rem" }}
                    aria-hidden
                  >
                    {numeral}.
                  </div>

                  {/* Mobile turn marker */}
                  <div className="md:hidden mb-2">
                    <span className="label-whisper text-text-tertiary">
                      turn {numeral}
                    </span>
                  </div>

                  {/* Exchange content */}
                  <div className="min-w-0 chat-latex">
                    {ex.user && (
                      <div className="mb-5">
                        <span className="label-whisper text-text-tertiary block mb-1.5">
                          you
                        </span>
                        <p className="font-display italic text-[1.02rem] leading-relaxed text-foreground/85">
                          <Latex>{ex.user.content}</Latex>
                        </p>
                      </div>
                    )}

                    {ex.assistant && (
                      <div>
                        <span
                          className="label-whisper block mb-1.5"
                          style={{ color: "hsl(var(--amber) / 0.85)" }}
                        >
                          metis
                        </span>
                        <article
                          className={cn(
                            "prose prose-neutral dark:prose-invert max-w-none",
                            "prose-p:font-display prose-p:italic prose-p:text-[1.05rem] prose-p:leading-[1.85] prose-p:text-foreground prose-p:my-3",
                            "prose-strong:font-display prose-strong:font-bold prose-strong:not-italic",
                            "prose-em:font-display prose-em:not-italic prose-em:font-semibold",
                            "prose-headings:font-display prose-headings:italic",
                            isFirstExchange && "metis-dropcap",
                          )}
                        >
                          <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                            {preprocessMath(ex.assistant.content)}
                          </ReactMarkdown>
                        </article>
                        {isStreaming && ex.assistant.id === lastAssistantId && (
                          <span className="inline-block h-4 w-0.5 bg-foreground/60 animate-pulse-soft ml-0.5 align-middle" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking dots */}
            {isWaiting && (
              <div className="grid grid-cols-1 md:grid-cols-[3rem_1fr] gap-x-5 mb-12 animate-blur-in">
                <div className="hidden md:block" />
                <div className="flex items-center gap-1.5 py-1">
                  <span
                    className="thinking-dot h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "hsl(var(--amber))" }}
                  />
                  <span
                    className="thinking-dot h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "hsl(var(--amber))" }}
                  />
                  <span
                    className="thinking-dot h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: "hsl(var(--amber))" }}
                  />
                </div>
              </div>
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Gilded end-of-chat action bar */}
      {endAction && (
        <div className="relative z-20 bg-background/90 backdrop-blur-xl animate-blur-in">
          <div className="h-px w-full bg-border/30 relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 w-full"
              style={{ backgroundColor: "hsl(var(--amber))", opacity: 0.7 }}
            />
          </div>
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 md:px-10">
            <span className="label-whisper text-text-tertiary">
              {phase === "Advising"
                ? "the path is clear"
                : phase === "Exploring"
                  ? "the thread is found"
                  : "the conversation is at rest"}
            </span>
            <Button
              onClick={endAction.onClick}
              disabled={endAction.disabled}
              variant="outline"
              className="rounded-xl px-7 py-5 text-sm font-medium"
              style={{
                color: "hsl(var(--amber))",
                borderColor: "hsl(var(--amber) / 0.35)",
              }}
            >
              {endAction.label}
            </Button>
          </div>
        </div>
      )}

      {/* Input area — framed as the bottom of a page */}
      {context && !chatDone && (
        <div className="relative z-10 px-6 pb-5 pt-3 md:px-10 md:pb-6 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="label-whisper text-text-tertiary">your reply</span>
              <span className="label-whisper text-text-tertiary tabular-nums">
                {turnCount > 0 && `turn ${toRomanLower(turnCount + (isWaiting || isStreaming ? 0 : 1))}`}
              </span>
            </div>
            <div className="h-px w-full bg-border/40 mb-3 transition-colors" />
            <div className="flex items-end gap-4">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="speak as plainly as you like…"
                rows={1}
                className="min-w-0 flex-1 resize-none bg-transparent px-0 py-1 font-display italic text-[1.02rem] leading-relaxed text-foreground placeholder:text-text-tertiary placeholder:font-display placeholder:italic focus:outline-none"
                style={{ maxHeight: "120px" }}
              />
              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() || isBusy}
                aria-label="Send message"
                className="group shrink-0 self-end font-display italic text-sm py-1 transition-colors text-text-tertiary hover:text-amber disabled:opacity-30 disabled:hover:text-text-tertiary"
              >
                reply
                <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Colophon */}
      <footer className="relative z-10 px-6 pb-4 md:px-10 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <div className="h-px w-full bg-border/30 mb-3" />
          <div
            className="flex items-baseline justify-between text-text-tertiary"
            style={mastheadStyle}
          >
            <span>μῆτις · gr. mêtis — cunning intelligence</span>
            <span>— {greeting.label.toLowerCase()} —</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
