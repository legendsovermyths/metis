import type { Editor, Range } from "@tiptap/core";
import { REASONING_KINDS, type ReasoningKind } from "../blocks";

export interface SlashItem {
  title: string;
  hint: string;
  section: string;
  keywords: string[];
  run: (editor: Editor, range: Range) => void;
}

function reasoning(kind: ReasoningKind) {
  return (editor: Editor, range: Range) =>
    editor.chain().focus().deleteRange(range).setReasoningBlock(kind).run();
}

export const SLASH_ITEMS: SlashItem[] = [
  ...REASONING_KINDS.map((k) => ({
    title: k.title,
    hint: k.hint,
    section: "Reasoning",
    keywords: k.aliases,
    run: reasoning(k.kind),
  })),
  {
    title: "Heading",
    hint: "Section heading",
    section: "Basics",
    keywords: ["heading", "h1", "title"],
    run: (e, r) => e.chain().focus().deleteRange(r).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Subheading",
    hint: "Smaller heading",
    section: "Basics",
    keywords: ["subheading", "h2", "section"],
    run: (e, r) => e.chain().focus().deleteRange(r).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Sub-subheading",
    hint: "The smallest heading",
    section: "Basics",
    keywords: ["subsubheading", "h3", "minor", "small"],
    run: (e, r) => e.chain().focus().deleteRange(r).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Bullet list",
    hint: "An unordered list",
    section: "Basics",
    keywords: ["bullet", "list", "unordered", "ul"],
    run: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    hint: "An ordered list",
    section: "Basics",
    keywords: ["numbered", "ordered", "list", "ol"],
    run: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run(),
  },
  {
    title: "Quote",
    hint: "A block quote",
    section: "Basics",
    keywords: ["quote", "blockquote", "citation"],
    run: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run(),
  },
  {
    title: "Code",
    hint: "A code block",
    section: "Basics",
    keywords: ["code", "pre", "monospace"],
    run: (e, r) => e.chain().focus().deleteRange(r).toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    hint: "A horizontal rule",
    section: "Basics",
    keywords: ["divider", "hr", "rule", "separator"],
    run: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
  },
  {
    title: "Math",
    hint: "An inline equation, or just type $",
    section: "Insert",
    keywords: ["math", "equation", "latex", "formula", "tex", "inline"],
    run: (e, r) => e.chain().focus().deleteRange(r).setInlineMath().run(),
  },
  {
    title: "Block equation",
    hint: "A centered display equation",
    section: "Insert",
    keywords: ["block", "display", "equation", "math", "align"],
    run: (e, r) => e.chain().focus().deleteRange(r).setBlockMath().run(),
  },
  {
    title: "Link",
    hint: "Add or edit a link — or press ⌘K",
    section: "Insert",
    keywords: ["link", "url", "href", "hyperlink", "web", "anchor"],
    run: (e, r) => {
      e.chain().focus().deleteRange(r).run();
      e.view.dom.dispatchEvent(new CustomEvent("metis:link"));
    },
  },
  {
    title: "Array",
    hint: "A row of indexed cells",
    section: "Structures",
    keywords: ["array", "list", "vector", "cells", "sequence"],
    run: (e, r) => e.chain().focus().deleteRange(r).setStructure("array").run(),
  },
  {
    title: "Tree",
    hint: "A rooted tree",
    section: "Structures",
    keywords: ["tree", "binary", "heap", "hierarchy", "trie"],
    run: (e, r) => e.chain().focus().deleteRange(r).setStructure("tree").run(),
  },
  {
    title: "Graph",
    hint: "Nodes and edges",
    section: "Structures",
    keywords: ["graph", "network", "edges", "vertices", "adjacency", "dag"],
    run: (e, r) => e.chain().focus().deleteRange(r).setStructure("graph").run(),
  },
  {
    title: "Hash table",
    hint: "Buckets of key–value pairs",
    section: "Structures",
    keywords: ["hash", "map", "dictionary", "table", "buckets", "keyvalue"],
    run: (e, r) => e.chain().focus().deleteRange(r).setStructure("hash").run(),
  },
];

export function filterSlashItems(query: string): SlashItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (it) => it.title.toLowerCase().includes(q) || it.keywords.some((k) => k.includes(q)),
  );
}
