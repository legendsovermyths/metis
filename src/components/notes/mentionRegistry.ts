export interface MentionTarget {
  id: number;
  /** Set when the mention targets a specific reasoning block within the note. */
  blockId?: string;
  /** Menu display (may include note title + block snippet). */
  label: string;
  /** Concise text stored on the inserted chip. */
  chip: string;
}

let getter: ((query: string) => MentionTarget[]) | null = null;

/** NoteEditor registers the current mentionable notes (excluding itself). */
export function registerMentionTargets(fn: ((query: string) => MentionTarget[]) | null) {
  getter = fn;
}

export function queryMentionTargets(query: string): MentionTarget[] {
  return getter ? getter(query) : [];
}
