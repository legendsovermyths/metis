import type { Chapter, DocumentType, Resource, ResourceType, Section } from "@/lib/service";

export interface Palette {
  card: string;
  spine: string;
  glyphColor: string;
}

export const PALETTES: Record<"amber" | "green" | "rose" | "blue", Palette> = {
  amber: {
    card: "bg-[hsl(35,70%,94%)] dark:bg-[hsl(35,28%,16%)]",
    spine: "hsl(30,55%,40%)",
    glyphColor: "hsl(30,55%,40%)",
  },
  green: {
    card: "bg-[hsl(155,22%,92%)] dark:bg-[hsl(155,18%,14%)]",
    spine: "hsl(155,30%,35%)",
    glyphColor: "hsl(155,30%,35%)",
  },
  rose: {
    card: "bg-[hsl(350,18%,93%)] dark:bg-[hsl(350,15%,15%)]",
    spine: "hsl(350,32%,42%)",
    glyphColor: "hsl(350,32%,42%)",
  },
  blue: {
    card: "bg-[hsl(215,22%,93%)] dark:bg-[hsl(215,18%,14%)]",
    spine: "hsl(215,30%,42%)",
    glyphColor: "hsl(215,30%,42%)",
  },
};

export type ResourceKind = "textbook" | "document" | "question" | "solution";

export function resourceKind(t: ResourceType): ResourceKind {
  if (typeof t === "string") return t === "Question" ? "question" : "solution";
  return "TextBook" in t ? "textbook" : "document";
}

const DOC_GLYPH: Record<DocumentType, string> = {
  ResearchPaper: "∫",
  BlogPost: "◇",
  TechnicalDocument: "∇",
  Documentation: "Θ",
  Infographic: "◈",
  Tutorial: "λ",
  FAQ: "ψ",
};

const DOC_PALETTE: Record<DocumentType, keyof typeof PALETTES> = {
  ResearchPaper: "blue",
  BlogPost: "green",
  TechnicalDocument: "blue",
  Documentation: "blue",
  Infographic: "blue",
  Tutorial: "green",
  FAQ: "rose",
};

const DOC_LABEL: Record<DocumentType, string> = {
  ResearchPaper: "Paper",
  BlogPost: "Article",
  TechnicalDocument: "Technical",
  Documentation: "Docs",
  Infographic: "Infographic",
  Tutorial: "Tutorial",
  FAQ: "FAQ",
};

export interface ResourceCover {
  glyph: string;
  palette: Palette;
  kindLabel: string;
  /** Short structural note, e.g. "12 chapters" / "6 sections" (may be empty). */
  detail: string;
}

function countLabel(n: number, singular: string): string {
  return `${n} ${n === 1 ? singular : `${singular}s`}`;
}

export function resourceCover(t: ResourceType): ResourceCover {
  if (typeof t === "string") {
    return t === "Question"
      ? { glyph: "?", palette: PALETTES.rose, kindLabel: "Problem", detail: "" }
      : { glyph: "∴", palette: PALETTES.green, kindLabel: "Solution", detail: "" };
  }
  if ("TextBook" in t) {
    return {
      glyph: "∑",
      palette: PALETTES.amber,
      kindLabel: "Textbook",
      detail: countLabel(t.TextBook.table_of_content.length, "chapter"),
    };
  }
  const dt = t.Document.document_type;
  return {
    glyph: DOC_GLYPH[dt] ?? "◇",
    palette: PALETTES[DOC_PALETTE[dt] ?? "blue"],
    kindLabel: DOC_LABEL[dt] ?? "Document",
    detail: countLabel(t.Document.table_of_content.length, "section"),
  };
}

/** The library shows only materials you'd build a journey from. */
export function isLibraryVisible(r: Resource): boolean {
  const kind = resourceKind(r.resource_type);
  return kind === "textbook" || kind === "document";
}

export function canBuildJourney(r: Resource): boolean {
  return isLibraryVisible(r);
}

export type ResourceStructure =
  | { type: "chapters"; chapters: Chapter[] }
  | { type: "sections"; sections: Section[] }
  | { type: "none" };

export function resourceStructure(t: ResourceType): ResourceStructure {
  if (typeof t === "string") return { type: "none" };
  if ("TextBook" in t) return { type: "chapters", chapters: t.TextBook.table_of_content };
  return { type: "sections", sections: t.Document.table_of_content };
}
