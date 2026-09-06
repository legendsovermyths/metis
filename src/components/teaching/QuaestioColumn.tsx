import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathMarkdown } from "@/lib/markdown";
import { parseQuaestio, quaestioState, type QuaestioOption } from "@/lib/quaestio";
import type { Dialogue } from "@/lib/service";

type Exchange = { question: string; answer: string };

interface QuaestioColumnProps {
  dialogue: Dialogue;
  arcLabel: string;
  folio: string;
  exchanges: Exchange[];
  pendingQuestion: string | null;
  isThinking: boolean;
  committing: boolean;
  freshlyResolved: boolean;
  onCommit: (chosen: string, reasoning: string) => void;
  onAsk: (question: string) => void;
}

const PROSE = cn(
  "prose prose-neutral dark:prose-invert max-w-none",
  "prose-p:leading-[1.85] prose-p:text-[1.05rem] prose-p:text-foreground/90",
  "prose-strong:text-foreground prose-strong:font-semibold",
  "prose-code:text-foreground/80 prose-code:bg-surface prose-code:rounded prose-code:px-1",
  "[&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto",
  "[&_.katex]:text-foreground",
);

const DIFFICULTY_LEVEL: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

function DifficultyPips({ difficulty }: { difficulty: string }) {
  const level = DIFFICULTY_LEVEL[difficulty] ?? 0;
  if (!level) return null;
  return (
    <span className="flex items-center gap-1" aria-label={`difficulty: ${difficulty}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: i < level ? "hsl(var(--amber))" : "hsl(var(--border))",
            opacity: i < level ? 0.75 : 1,
          }}
        />
      ))}
    </span>
  );
}

/** A read-only option row, optionally marked as the correct answer and/or the student's choice. */
function OptionMark({
  option,
  isCorrect,
  isChosen,
}: {
  option: QuaestioOption;
  isCorrect: boolean;
  isChosen: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        isCorrect
          ? "border-amber/45 bg-amber-soft"
          : isChosen
            ? "border-border/50 bg-surface-hover"
            : "border-border/30 bg-surface",
      )}
    >
      <span className="font-display italic text-sm text-amber">{option.letter}</span>
      <span className={cn(PROSE, "flex-1 [&_p]:my-0 text-[0.98rem]")}>
        <MathMarkdown>{option.text}</MathMarkdown>
      </span>
      {isCorrect && <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={2} />}
      {isChosen && !isCorrect && (
        <span className="mt-0.5 label-whisper text-text-tertiary shrink-0">yours</span>
      )}
    </div>
  );
}

/** The disputation thread — Metis's turns in serif, the student's in the amber-ruled margin.
 *  The first exchange's question is the committed attempt (shown in the plate), so it's hidden here. */
function Thread({
  exchanges,
  pendingQuestion,
  isThinking,
}: {
  exchanges: Exchange[];
  pendingQuestion: string | null;
  isThinking: boolean;
}) {
  return (
    <div className="space-y-10">
      {exchanges.map((ex, i) => (
        <div key={i} className="animate-blur-in">
          {i > 0 && (
            <p
              className="mb-5 pl-3 text-sm italic text-text-tertiary/70 border-l-2"
              style={{ borderColor: "hsl(var(--amber) / 0.45)" }}
            >
              {ex.question}
            </p>
          )}
          <article
            className={cn(
              PROSE,
              "prose-p:font-display prose-p:italic prose-p:text-[17px]",
              i === 0 && "metis-dropcap",
            )}
          >
            <MathMarkdown>{ex.answer}</MathMarkdown>
          </article>
        </div>
      ))}
      {(pendingQuestion || isThinking) && (
        <div className="animate-blur-in">
          {pendingQuestion && (
            <p
              className="mb-5 pl-3 text-sm italic text-text-tertiary/70 border-l-2"
              style={{ borderColor: "hsl(var(--amber) / 0.45)" }}
            >
              {pendingQuestion}
            </p>
          )}
          <div className="flex items-center gap-1.5">
            <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--amber))" }} />
          </div>
        </div>
      )}
    </div>
  );
}

function Composer({ onAsk, disabled }: { onAsk: (q: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");
  const submit = () => {
    const q = text.trim();
    if (!q || disabled) return;
    onAsk(q);
    setText("");
  };
  return (
    <div className="mt-10 border-t border-border/30 pt-5">
      <div className="border-b border-border/40 transition-colors focus-within:border-foreground/40">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-1 py-2 text-sm leading-relaxed text-foreground placeholder:text-text-tertiary placeholder:font-display placeholder:italic focus:outline-none disabled:opacity-50"
          placeholder="reason it through with Metis…"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="label-whisper text-text-tertiary">⌘↵ to send</span>
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          className="group font-display italic text-sm text-text-tertiary hover:text-amber transition-colors disabled:opacity-30 disabled:hover:text-text-tertiary"
        >
          send
          <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </button>
      </div>
    </div>
  );
}

function Header({
  title,
  arcLabel,
  difficulty,
  folio,
}: {
  title: string;
  arcLabel: string;
  difficulty: string;
  folio: string;
}) {
  return (
    <header className="relative mb-8">
      <div className="flex items-center gap-3">
        <p className="label-whisper text-text-tertiary">Quaestio</p>
        <DifficultyPips difficulty={difficulty} />
      </div>
      {title && (
        <h1 className="display-hero text-2xl text-foreground md:text-3xl mt-3 mb-0">{title}</h1>
      )}
      {arcLabel && (
        <p className="mt-2 font-display italic text-sm text-text-tertiary/80">{arcLabel}</p>
      )}
      <div
        className="h-px w-12 mt-5 animate-reveal-line"
        style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
      />
      <span className="label-whisper text-text-tertiary absolute top-0 right-0 tabular-nums">
        {folio}
      </span>
    </header>
  );
}

export default function QuaestioColumn(props: QuaestioColumnProps) {
  const { dialogue, arcLabel, folio, exchanges, pendingQuestion, isThinking, committing, freshlyResolved, onCommit, onAsk } = props;
  const q = useMemo(() => parseQuaestio(dialogue.content), [dialogue.content]);
  const state = quaestioState(dialogue);

  const [selected, setSelected] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState("");

  const correct = q.attempt != null && q.attempt.chosen === q.answer;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-8">
      <Header title={dialogue.heading} arcLabel={arcLabel} difficulty={q.difficulty} folio={folio} />

      {/* The problem — drop-capped, always shown */}
      <article className={cn(PROSE, "metis-dropcap")}>
        <MathMarkdown>{q.problem}</MathMarkdown>
      </article>

      {/* POSE — choose an option, stake your reasoning */}
      {state === "pose" && (
        <div className="mt-8 space-y-6">
          <div className="space-y-2.5">
            {q.options.map((opt) => {
              const isSel = selected === opt.letter;
              return (
                <button
                  key={opt.letter}
                  onClick={() => setSelected(opt.letter)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    isSel
                      ? "border-amber/50 bg-amber-soft"
                      : "border-border/30 bg-surface hover:bg-surface-hover",
                  )}
                >
                  <span className={cn("font-display italic text-sm", isSel ? "text-amber" : "text-text-tertiary")}>
                    {opt.letter}
                  </span>
                  <span className={cn(PROSE, "flex-1 [&_p]:my-0 text-[0.98rem]")}>
                    <MathMarkdown>{opt.text}</MathMarkdown>
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <p className="label-whisper text-text-tertiary mb-2">Your reasoning</p>
            <div className="border-b border-border/40 transition-colors focus-within:border-foreground/40">
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                rows={3}
                className="w-full resize-none bg-transparent px-1 py-2 text-sm leading-relaxed text-foreground placeholder:text-text-tertiary placeholder:font-display placeholder:italic focus:outline-none"
                placeholder="why this answer…"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => selected && onCommit(selected, reasoning)}
              disabled={!selected || committing}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-background shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-medium disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-soft"
            >
              <span className="font-display text-sm italic">{committing ? "Committing…" : "Commit"}</span>
              {!committing && (
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* DISPUTE — verdict, then the disputation */}
      {state === "dispute" && (
        <div className="mt-8">
          <div className="mb-8 flex items-center gap-2.5">
            {correct ? (
              <>
                <Check className="h-4 w-4 text-amber" strokeWidth={2} />
                <span className="font-display italic text-sm text-foreground">
                  {q.attempt?.chosen} — right.
                </span>
              </>
            ) : (
              <span className="font-display italic text-sm text-text-tertiary">
                {q.attempt?.chosen} — not quite. Let's talk it through.
              </span>
            )}
          </div>
          <Thread exchanges={exchanges} pendingQuestion={pendingQuestion} isThinking={isThinking} />
          <Composer onAsk={onAsk} disabled={isThinking} />
        </div>
      )}

      {/* RESOLVED — the keepsake: options marked, the Solutio, disputation folded away */}
      {state === "resolved" && (
        <ResolvedView
          options={q.options}
          answer={q.answer}
          chosen={q.attempt?.chosen ?? ""}
          reasoning={q.attempt?.reasoning ?? ""}
          solution={q.solution}
          exchanges={exchanges}
          defaultOpen={freshlyResolved}
        />
      )}
    </div>
  );
}

function ResolvedView({
  options,
  answer,
  chosen,
  reasoning,
  solution,
  exchanges,
  defaultOpen,
}: {
  options: QuaestioOption[];
  answer: string;
  chosen: string;
  reasoning: string;
  solution: string;
  exchanges: Exchange[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-8">
      <div className="space-y-2.5">
        {options.map((opt) => (
          <OptionMark
            key={opt.letter}
            option={opt}
            isCorrect={opt.letter === answer}
            isChosen={opt.letter === chosen}
          />
        ))}
      </div>

      <section className="mt-10">
        <p className="label-whisper text-text-tertiary mb-3">Solutio</p>
        <div
          className="h-px w-12 mb-5 animate-reveal-line"
          style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
        />
        <article className={PROSE}>
          <MathMarkdown>{solution}</MathMarkdown>
        </article>
      </section>

      <div className="mt-10">
        <button
          onClick={() => setOpen((v) => !v)}
          className="group font-display italic text-sm text-text-tertiary transition-colors hover:text-foreground"
        >
          <span style={{ letterSpacing: "0.3em", paddingLeft: "0.3em" }}>⁂</span>
          <span className="ml-2">{open ? "hide the disputation" : "show the disputation"}</span>
        </button>

        {open && (
          <div className="mt-8 animate-blur-in">
            {reasoning && (
              <div className="mb-8">
                <p className="label-whisper text-text-tertiary mb-2">Your reasoning</p>
                <p className="text-sm italic text-text-secondary leading-relaxed">{reasoning}</p>
              </div>
            )}
            <Thread exchanges={exchanges} pendingQuestion={null} isThinking={false} />
          </div>
        )}
      </div>
    </div>
  );
}
