import type { Dialogue } from "./service";

export interface QuaestioOption {
  letter: string;
  text: string;
}

export interface QuaestioAttempt {
  chosen: string;
  reasoning: string;
}

export interface Quaestio {
  problem: string;
  options: QuaestioOption[];
  answer: string;
  solution: string;
  difficulty: string;
  attempt: QuaestioAttempt | null;
}

export type QuaestioState = "pose" | "dispute" | "resolved";

const SECTION_RE = /^###\s+(Problem|Options|Answer|Solution|Difficulty|Attempt)\s*$/i;

/** Splits the questioner's markdown `content` into its labelled sections. */
function sections(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = content.split("\n");
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current) out[current] = buf.join("\n").trim();
    buf = [];
  };
  for (const line of lines) {
    const m = line.match(SECTION_RE);
    if (m) {
      flush();
      current = m[1].toLowerCase();
    } else if (current) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

function parseOptions(block: string): QuaestioOption[] {
  const options: QuaestioOption[] = [];
  for (const raw of block.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([A-D])[.)]\s*(.*)$/);
    if (m) {
      options.push({ letter: m[1].toUpperCase(), text: m[2] });
    } else if (options.length > 0) {
      options[options.length - 1].text += `\n${line}`;
    }
  }
  return options;
}

function parseAttempt(block: string): QuaestioAttempt | null {
  if (!block) return null;
  const chosen = block.match(/Chosen:\s*([A-D])/i)?.[1]?.toUpperCase() ?? "";
  const reasoning = block.match(/Reasoning:\s*([\s\S]*)$/i)?.[1]?.trim() ?? "";
  if (!chosen && !reasoning) return null;
  return { chosen, reasoning };
}

export function parseQuaestio(content: string): Quaestio {
  const s = sections(content);
  return {
    problem: s.problem ?? "",
    options: parseOptions(s.options ?? ""),
    answer: (s.answer ?? "").trim().charAt(0).toUpperCase(),
    solution: s.solution ?? "",
    difficulty: (s.difficulty ?? "").trim().toLowerCase(),
    attempt: parseAttempt(s.attempt ?? ""),
  };
}

export function quaestioState(dialogue: Dialogue): QuaestioState {
  if (dialogue.concluded) return "resolved";
  if (parseQuaestio(dialogue.content).attempt) return "dispute";
  return "pose";
}
