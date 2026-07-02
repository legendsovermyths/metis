/** All note ids @-mentioned inside a document. */
export function mentionsOf(content: string): number[] {
  if (!content) return [];
  try {
    const ids: number[] = [];
    const walk = (node: { type?: string; attrs?: { noteId?: number }; content?: unknown[] }) => {
      if (!node) return;
      if (node.type === "mention" && node.attrs?.noteId != null) ids.push(node.attrs.noteId);
      if (Array.isArray(node.content)) node.content.forEach((c) => walk(c as typeof node));
    };
    walk(JSON.parse(content));
    return ids;
  } catch {
    return [];
  }
}

interface JsonNode {
  type?: string;
  text?: string;
  attrs?: { blockId?: string; kind?: string; state?: string; noteId?: number };
  content?: unknown[];
}

function flattenText(node: JsonNode): string {
  const parts: string[] = [];
  const walk = (n: JsonNode) => {
    if (!n) return;
    if (typeof n.text === "string") parts.push(n.text);
    if (Array.isArray(n.content)) n.content.forEach((c) => walk(c as JsonNode));
  };
  walk(node);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

/** Reasoning blocks (with stable ids) inside a document, for block-level mentions. */
export interface ReasoningBlockInfo {
  blockId: string;
  kind: string;
  state: string;
  text: string;
}

export function reasoningBlocks(content: string): ReasoningBlockInfo[] {
  if (!content) return [];
  try {
    const out: ReasoningBlockInfo[] = [];
    const walk = (n: JsonNode) => {
      if (!n) return;
      if (n.type === "reasoningBlock" && n.attrs?.blockId) {
        out.push({
          blockId: n.attrs.blockId,
          kind: n.attrs.kind || "r",
          state: n.attrs.state || "open",
          text: flattenText(n),
        });
      }
      if (Array.isArray(n.content)) n.content.forEach((c) => walk(c as JsonNode));
    };
    walk(JSON.parse(content));
    return out;
  } catch {
    return [];
  }
}

/** Flatten a TipTap document JSON to a plain-text preview line. */
export function excerpt(content: string): string {
  if (!content) return "";
  try {
    const parts: string[] = [];
    const walk = (node: { text?: string; content?: unknown[] }) => {
      if (!node) return;
      if (typeof node.text === "string") parts.push(node.text);
      if (Array.isArray(node.content)) node.content.forEach((c) => walk(c as typeof node));
    };
    walk(JSON.parse(content));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}
