/** Stable id for a block, used later for cross-note block references. */
export function genId(): string {
  return "b" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
