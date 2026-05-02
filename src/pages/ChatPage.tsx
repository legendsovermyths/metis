import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { sendMessage } from "@/lib/service";
import { useJourneyCreation } from "@/context/JourneyCreationContext";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import { Link, useNavigate } from "react-router-dom";

type Mode = "onboarding" | "teaching" | "advising" | "idle";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const modeInfo: Record<Mode, { label: string }> = {
  onboarding: { label: "Getting to know you" },
  teaching: { label: "Teaching" },
  advising: { label: "Advising" },
  idle: { label: "Chat" },
};

function phaseToMode(phase: string | undefined): Mode {
  switch (phase) {
    case "Onboarding": return "onboarding";
    case "Teaching": return "teaching";
    case "Advising": return "advising";
    default: return "idle";
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

export default function ChatPage() {
  const { context } = useAppContext();
  const navigate = useNavigate();
  const phase = context?.chat.phase;
  const mode = phaseToMode(phase);
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

  // Seed messages from backend event history exactly once when context first arrives
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
      handleSend();
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-57px)] flex-col md:h-screen">
      {/* Top bar */}
      <div className="flex items-center border-b border-border/30 bg-card/50 px-4 py-3 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-xs font-medium hidden sm:inline">Back</span>
        </Link>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {messages.length === 0 && (
            <div className="flex h-full min-h-[50vh] flex-col justify-center animate-fade-in">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/40 mb-3">
                {modeInfo[mode].label}
              </p>
              <h2 className="text-xl font-medium text-foreground">
                {mode === "onboarding" && "Tell me about yourself"}
                {mode === "teaching" && "Let's explore an idea together"}
                {mode === "advising" && "What would you like to learn next?"}
                {mode === "idle" && "What's on your mind?"}
              </h2>
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
              {msg.role === "assistant" ? (
                <div className="max-w-[85%] text-sm leading-relaxed text-foreground">
                  <div className="whitespace-pre-wrap chat-latex">
                    <Latex>{msg.content}</Latex>
                  </div>
                  {isStreaming && msg.id === messages[messages.length - 1]?.id && (
                    <span className="inline-block h-4 w-0.5 bg-foreground animate-pulse-soft ml-0.5" />
                  )}
                </div>
              ) : (
                <div className="max-w-[75%] rounded-2xl border border-border/50 px-4 py-2.5 text-sm leading-relaxed text-foreground">
                  <div className="whitespace-pre-wrap chat-latex">
                    <Latex>{msg.content}</Latex>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isWaiting && (
            <div className="flex justify-start animate-slide-up">
              <div className="rounded-2xl bg-surface px-4 py-3.5 flex items-center gap-1.5">
                <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
                <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
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

          {chatDone && messages.length > 0 && !isBusy && phase === "Advising" && (() => {
            const chapter = context?.session.chapter_title?.trim() ?? "";
            const bookId = context?.session.book_id ?? null;
            const notes = context?.chat.notes ?? "";
            const canCreate = chapter.length > 0 && bookId != null;
            return (
              <div className="flex justify-center pt-4 animate-fade-in">
                <Button
                  disabled={!canCreate}
                  onClick={() => {
                    if (!canCreate || bookId == null) return;
                    startJourneyCreation(
                      { chapter_title: chapter, advisor_notes: notes, book_id: bookId },
                      (errMsg) => {
                        const msg: Message = {
                          id: (Date.now() + 1).toString(),
                          role: "assistant",
                          content: `Could not create journey: ${errMsg}`,
                        };
                        setMessages((prev) => [...prev, msg]);
                      },
                    );
                    navigate("/journeys");
                  }}
                  className="rounded-xl px-6 shadow-soft"
                >
                  Create journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          })()}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area — hidden while chat.is_done */}
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
