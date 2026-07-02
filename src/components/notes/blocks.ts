export type ReasoningKind = "pr" | "r" | "ob" | "sol" | "dt" | "nt" | "tx";

export interface ReasoningKindMeta {
  kind: ReasoningKind;
  /** Gutter tag (uppercased by .label-whisper). */
  label: string;
  /** Slash-menu title. */
  title: string;
  /** Slash-menu one-line description. */
  hint: string;
  /** Search terms for the slash menu. */
  aliases: string[];
}

export const REASONING_KINDS: ReasoningKindMeta[] = [
  { kind: "pr", label: "Problem", title: "Problem", hint: "A question to yourself", aliases: ["problem", "pr", "question", "ask"] },
  { kind: "r", label: "Rough", title: "Rough work", hint: "Trying something out", aliases: ["rough", "work", "scratch", "try", "attempt"] },
  { kind: "ob", label: "Obs", title: "Observation", hint: "A key insight or invariant", aliases: ["observation", "ob", "insight", "invariant", "notice"] },
  { kind: "sol", label: "Sol", title: "Solution", hint: "The crystallized approach", aliases: ["solution", "sol", "answer", "approach"] },
  { kind: "dt", label: "Doubt", title: "Doubt", hint: "An open, unresolved question", aliases: ["doubt", "dt", "open", "stuck", "unsure"] },
  { kind: "nt", label: "Note", title: "Note to self", hint: "Worth remembering later", aliases: ["note", "nt", "remember", "highlight", "gotcha"] },
  { kind: "tx", label: "Text", title: "Textbook", hint: "Quoted reference material", aliases: ["textbook", "tx", "reference", "quote", "source"] },
];

export const REASONING_KIND_MAP: Record<ReasoningKind, ReasoningKindMeta> = Object.fromEntries(
  REASONING_KINDS.map((k) => [k.kind, k]),
) as Record<ReasoningKind, ReasoningKindMeta>;
