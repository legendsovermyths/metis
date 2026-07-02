export interface Anchorable {
  x: number;
  y: number;
  w: number;
}

/** Distance from a node's centre to its elliptical (circular) boundary along a unit direction. */
export function boundaryDist(w: number, h: number, ux: number, uy: number): number {
  return 1 / Math.hypot(ux / (w / 2), uy / (h / 2));
}

/** A curved (quadratic) arrow between two node boundaries. */
export function curvedArrow(from: Anchorable, to: Anchorable, h: number): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const sx = from.x + ux * (boundaryDist(from.w, h, ux, uy) + 2);
  const sy = from.y + uy * (boundaryDist(from.w, h, ux, uy) + 2);
  const ex = to.x - ux * (boundaryDist(to.w, h, ux, uy) + 3);
  const ey = to.y - uy * (boundaryDist(to.w, h, ux, uy) + 3);
  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const nx = -(ey - sy);
  const ny = ex - sx;
  const nlen = Math.hypot(nx, ny) || 1;
  const off = Math.min(26, len * 0.16);
  return `M${sx},${sy} Q${mx + (nx / nlen) * off},${my + (ny / nlen) * off} ${ex},${ey}`;
}

/**
 * Edge clipped to both node boundaries, optionally bowed sideways by `bow` px so
 * coincident edges (e.g. A→B and B→A) don't overlap. Returns the path and the
 * on-curve midpoint (for a weight label).
 */
export function edgePath(from: Anchorable, to: Anchorable, h: number, bow = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const x1 = from.x + ux * (boundaryDist(from.w, h, ux, uy) + 1);
  const y1 = from.y + uy * (boundaryDist(from.w, h, ux, uy) + 1);
  const x2 = to.x - ux * (boundaryDist(to.w, h, ux, uy) + 2);
  const y2 = to.y - uy * (boundaryDist(to.w, h, ux, uy) + 2);
  if (!bow) {
    return { d: `M${x1},${y1} L${x2},${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
  }
  // Control point offset perpendicular to the edge (own direction, so reversed
  // edges bow to opposite sides automatically).
  const cx = (x1 + x2) / 2 + -uy * bow;
  const cy = (y1 + y2) / 2 + ux * bow;
  return {
    d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`,
    mx: 0.25 * x1 + 0.5 * cx + 0.25 * x2,
    my: 0.25 * y1 + 0.5 * cy + 0.25 * y2,
  };
}
