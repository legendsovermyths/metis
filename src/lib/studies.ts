import {
  explanationCounts,
  journeyCounts,
  type ExplanationRow,
  type JourneyRow,
} from "@/lib/service";

export type StudyKind = "Journey" | "Explanation";

/**
 * A teachable thing, projected to one shape the library can render and file.
 * Journeys and explanations are kinds of Study; new kinds add an adapter here,
 * never a new page.
 */
export interface StudyItem {
  key: string;
  kind: StudyKind;
  id: number;
  title: string;
  kindLabel: string;
  subtitle: string | null;
  folderId: number | null;
  createdAt: number;
  completed: number;
  total: number;
  /** Rail fills, one per cell (0..1). Rendered as equal-width tracks. */
  segments: number[];
}

/** Arc-by-arc fill of a journey's topic progress. */
function arcFillRatios(row: JourneyRow): number[] {
  let remaining = journeyCounts(row).completed;
  return row.journey.arcs.map((arc) => {
    const size = arc.topics.length;
    if (size === 0) return 0;
    if (remaining >= size) {
      remaining -= size;
      return 1;
    }
    const pct = remaining / size;
    remaining = 0;
    return pct;
  });
}

export function journeyToStudy(row: JourneyRow): StudyItem {
  const { completed, total } = journeyCounts(row);
  return {
    key: `journey-${row.id}`,
    kind: "Journey",
    id: row.id,
    title: row.journey.journey_title || row.chapter_title || "Untitled journey",
    kindLabel: "Journey",
    subtitle: row.chapter_title ? `from ${row.chapter_title}` : null,
    folderId: row.folder_id ?? null,
    createdAt: row.created_at,
    completed,
    total,
    segments: arcFillRatios(row),
  };
}

export function explanationToStudy(row: ExplanationRow): StudyItem {
  const { completed, total } = explanationCounts(row);
  return {
    key: `explanation-${row.id}`,
    kind: "Explanation",
    id: row.id,
    title: row.title || "Untitled explanation",
    kindLabel: "Explainer",
    subtitle: `a route of ${total} ${total === 1 ? "step" : "steps"}`,
    folderId: row.folder_id ?? null,
    createdAt: row.created_at,
    completed,
    total,
    segments: Array.from({ length: Math.max(total, 0) }, (_, idx) =>
      idx < completed ? 1 : 0,
    ),
  };
}
