import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import dagre from "dagre";
import { genId } from "../genId";
import { edgePath } from "./geometry";
import type { GraphData } from "./types";

interface Props extends NodeViewProps {
  onFocusChange: (focused: boolean) => void;
}

const EMPTY: GraphData = { nodes: [], edges: [], boxes: [], highlights: [], pointers: [] };
const NODE_H = 40;
const nodeWidth = (label: string) => Math.max(NODE_H, label.length * 9 + 18);

type Dir = "up" | "down" | "left" | "right";

export function GraphEditor({ node, updateAttributes, editor, getPos, onFocusChange }: Props) {
  const data = useMemo<GraphData>(() => {
    try {
      return { ...EMPTY, ...(JSON.parse(node.attrs.data || "{}") as GraphData) };
    } catch {
      return EMPTY;
    }
  }, [node.attrs.data]);
  const { nodes, edges, boxes, highlights, pointers } = data;

  const [focused, setFocused] = useState(false);
  const [sel, setSel] = useState<string | null>(nodes[0]?.id ?? null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pointerEdit, setPointerEdit] = useState<string | null>(null);
  const [pointerLabel, setPointerLabel] = useState("");
  const [weightEdit, setWeightEdit] = useState<string | null>(null);
  const [weightValue, setWeightValue] = useState("");
  const [linking, setLinking] = useState<{ from: string; directed: boolean } | null>(null);
  const [hoveredPtr, setHoveredPtr] = useState<string | null>(null);

  const focusRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pointerInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const setData = (next: Partial<GraphData>) =>
    updateAttributes({ data: JSON.stringify({ ...data, ...next }) });

  useEffect(() => {
    if (sel == null || !nodes.some((n) => n.id === sel)) setSel(nodes[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]);
  useEffect(() => {
    if (editing != null) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);
  useEffect(() => {
    if (pointerEdit != null) pointerInputRef.current?.focus();
  }, [pointerEdit]);
  useEffect(() => {
    if (weightEdit != null) {
      weightInputRef.current?.focus();
      weightInputRef.current?.select();
    }
  }, [weightEdit]);

  const layout = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 40, ranksep: 60, marginx: 12, marginy: 12 });
    g.setDefaultEdgeLabel(() => ({}));
    nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth(n.label), height: NODE_H }));
    edges.forEach((e) => g.setEdge(e.from, e.to));
    dagre.layout(g);
    const placed = nodes.map((n) => {
      const p = g.node(n.id);
      return { node: n, x: p?.x ?? 0, y: p?.y ?? 0, w: nodeWidth(n.label) };
    });
    const gg = g.graph();
    return { placed, width: gg.width ?? 0, height: gg.height ?? 0 };
  }, [nodes, edges]);

  const placedById = useMemo(
    () => Object.fromEntries(layout.placed.map((p) => [p.node.id, p])),
    [layout],
  );

  const edgeGeoms = useMemo(() => {
    const pairCount: Record<string, number> = {};
    edges.forEach((e) => {
      const k = [e.from, e.to].sort().join("|");
      pairCount[k] = (pairCount[k] || 0) + 1;
    });
    return edges
      .map((edge) => {
        const f = placedById[edge.from];
        const t = placedById[edge.to];
        if (!f || !t) return null;
        const bow = pairCount[[edge.from, edge.to].sort().join("|")] > 1 ? 22 : 0;
        return { edge, ...edgePath(f, t, NODE_H, bow) };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [edges, placedById]);

  const pointerLayout = useMemo(() => {
    const items = pointers
      .map((p) => ({ p, node: placedById[p.nodeId] }))
      .filter((x) => x.node)
      .sort((a, b) => a.node.y - b.node.y || a.node.x - b.node.x);
    let lastY = -Infinity;
    return items.map(({ p, node }) => {
      const y = Math.max(node.y, lastY + 22);
      lastY = y;
      return { p, node, y };
    });
  }, [pointers, placedById]);

  const gutter = pointerLayout.length ? 176 : 0;
  const canvasW = layout.width + gutter;
  const canvasH = Math.max(layout.height, (pointerLayout.at(-1)?.y ?? 0) + 20);

  function stepOut() {
    const pos = typeof getPos === "function" ? getPos() : null;
    focusRef.current?.blur();
    editor.commands.focus();
    if (pos != null) editor.commands.setNodeSelection(pos);
  }

  function startEdit(id: string) {
    setEditValue(nodes.find((n) => n.id === id)?.label ?? "");
    setEditing(id);
  }
  function commitEdit() {
    if (editing == null) return;
    setData({ nodes: nodes.map((n) => (n.id === editing ? { ...n, label: editValue } : n)) });
    setEditing(null);
    focusRef.current?.focus();
  }

  function addNode() {
    const id = genId();
    setData({ nodes: [...nodes, { id, label: "" }] });
    setSel(id);
    setEditValue("");
    setEditing(id);
  }

  function toggleEdge(from: string, to: string, directed: boolean) {
    const existing = edges.find(
      (e) =>
        (e.from === from && e.to === to) || (!e.directed && e.from === to && e.to === from),
    );
    if (existing) {
      setData({ edges: edges.filter((e) => e.id !== existing.id) });
      return;
    }
    const id = genId();
    setData({ edges: [...edges, { id, from, to, directed, weight: "" }] });
    setWeightValue("");
    setWeightEdit(id);
  }
  function commitWeight() {
    if (weightEdit == null) return;
    setData({ edges: edges.map((e) => (e.id === weightEdit ? { ...e, weight: weightValue.trim() } : e)) });
    setWeightEdit(null);
    focusRef.current?.focus();
  }

  function addPointer(id: string) {
    const pid = genId();
    setData({ pointers: [...pointers, { id: pid, nodeId: id, label: "" }] });
    setPointerLabel("");
    setPointerEdit(pid);
  }
  function commitPointer() {
    if (pointerEdit == null) return;
    const label = pointerLabel.trim();
    setData({
      pointers: label
        ? pointers.map((p) => (p.id === pointerEdit ? { ...p, label } : p))
        : pointers.filter((p) => p.id !== pointerEdit),
    });
    setPointerEdit(null);
    focusRef.current?.focus();
  }

  function toggleSet(key: "boxes" | "highlights", id: string) {
    const set = new Set(data[key]);
    set.has(id) ? set.delete(id) : set.add(id);
    setData({ [key]: [...set] } as Partial<GraphData>);
  }

  function deleteNode(id: string) {
    const remaining = nodes.filter((n) => n.id !== id);
    setData({
      nodes: remaining,
      edges: edges.filter((e) => e.from !== id && e.to !== id),
      boxes: boxes.filter((b) => b !== id),
      highlights: highlights.filter((h) => h !== id),
      pointers: pointers.filter((p) => p.nodeId !== id),
    });
    setSel(remaining[0]?.id ?? null);
  }

  function move(dir: Dir) {
    const cur = sel ? placedById[sel] : null;
    if (!cur) return;
    const cand = layout.placed
      .filter((p) => p.node.id !== sel)
      .map((p) => ({ id: p.node.id, dx: p.x - cur.x, dy: p.y - cur.y }));
    const inDir = cand.filter(({ dx, dy }) => {
      if (dir === "right") return dx > 2 && Math.abs(dy) <= Math.abs(dx);
      if (dir === "left") return dx < -2 && Math.abs(dy) <= Math.abs(dx);
      if (dir === "down") return dy > 2 && Math.abs(dx) <= Math.abs(dy);
      return dy < -2 && Math.abs(dx) <= Math.abs(dy);
    });
    const pool = inDir.length ? inDir : cand;
    let best: string | null = null;
    let bestD = Infinity;
    for (const c of pool) {
      const d = Math.hypot(c.dx, c.dy);
      if (d < bestD) {
        bestD = d;
        best = c.id;
      }
    }
    if (best) setSel(best);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (linking) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (sel && sel !== linking.from) toggleEdge(linking.from, sel, linking.directed);
        setLinking(null);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setLinking(null);
        return;
      }
    }
    switch (e.key) {
      case "ArrowRight":
      case "l":
        e.preventDefault();
        move("right");
        break;
      case "ArrowLeft":
      case "h":
        e.preventDefault();
        move("left");
        break;
      case "ArrowDown":
      case "j":
        e.preventDefault();
        move("down");
        break;
      case "ArrowUp":
      case "k":
        e.preventDefault();
        move("up");
        break;
      case "Enter":
        e.preventDefault();
        if (sel) startEdit(sel);
        break;
      case "n":
        e.preventDefault();
        addNode();
        break;
      case "e":
        e.preventDefault();
        if (sel) setLinking({ from: sel, directed: false });
        break;
      case "E":
        e.preventDefault();
        if (sel) setLinking({ from: sel, directed: true });
        break;
      case "p":
        e.preventDefault();
        if (sel) addPointer(sel);
        break;
      case "m":
        e.preventDefault();
        if (sel) toggleSet("highlights", sel);
        break;
      case "b":
        e.preventDefault();
        if (sel) toggleSet("boxes", sel);
        break;
      case "Backspace":
      case "Delete":
      case "d":
        e.preventDefault();
        if (sel) deleteNode(sel);
        break;
      case "Escape":
        e.preventDefault();
        stepOut();
        break;
    }
  }

  const pointedNodeId = hoveredPtr ? pointers.find((p) => p.id === hoveredPtr)?.nodeId : null;
  const chipClass = (id: string) =>
    "tree-node" +
    (id === sel && focused ? " is-selected" : "") +
    (boxes.includes(id) ? " is-boxed" : "") +
    (highlights.includes(id) ? " is-highlighted" : "") +
    (id === pointedNodeId ? " is-pointed" : "");

  return (
    <div className="graph">
      <div
        ref={focusRef}
        tabIndex={0}
        className="structure-focus"
        onKeyDown={onKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        onFocus={() => {
          setFocused(true);
          onFocusChange(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocused(false);
            onFocusChange(false);
            if (editing != null) commitEdit();
            if (pointerEdit != null) commitPointer();
            if (weightEdit != null) commitWeight();
          }
        }}
      >
        <div className="tree-canvas" style={{ width: canvasW, height: canvasH }}>
          <svg className="tree-edges" width={canvasW} height={canvasH}>
            <defs>
              <marker id="graph-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--foreground) / 0.55)" />
              </marker>
            </defs>
            {edgeGeoms.map(({ edge, d }) => (
              <path
                key={edge.id}
                d={d}
                className="graph-edge"
                markerEnd={edge.directed ? "url(#graph-arrowhead)" : undefined}
                onClick={() => {
                  setWeightValue(edge.weight);
                  setWeightEdit(edge.id);
                }}
              />
            ))}
            {pointerLayout.map(({ p, node, y }) => {
              const active = p.nodeId === sel || hoveredPtr === p.id;
              const dim = hoveredPtr != null && hoveredPtr !== p.id;
              const ax = node.x + node.w / 2;
              return (
                <g key={`c-${p.id}`} className={`tree-pointer-link${active ? " is-active" : ""}${dim ? " is-dim" : ""}`}>
                  <path
                    d={`M${ax},${node.y} C${ax + 34},${node.y} ${layout.width + 6},${y} ${layout.width + 15},${y}`}
                    className="tree-pointer-connector"
                  />
                  <circle cx={ax} cy={node.y} r={2.5} className="tree-pointer-anchor" />
                </g>
              );
            })}
            {linking && sel && sel !== linking.from && placedById[linking.from] && placedById[sel] && (
              <line
                x1={placedById[linking.from].x}
                y1={placedById[linking.from].y}
                x2={placedById[sel].x}
                y2={placedById[sel].y}
                className="tree-link-preview"
              />
            )}
          </svg>

          {/* Edge weights */}
          {edgeGeoms.map(({ edge, mx, my }) => {
            const g = { mx, my };
            if (weightEdit === edge.id) {
              return (
                <input
                  key={`w-${edge.id}`}
                  ref={weightInputRef}
                  className="graph-weight-input"
                  style={{ left: g.mx, top: g.my }}
                  value={weightValue}
                  placeholder="w"
                  onChange={(e) => setWeightValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
                      e.preventDefault();
                      commitWeight();
                    }
                  }}
                  onBlur={commitWeight}
                />
              );
            }
            if (!edge.weight) return null;
            return (
              <span
                key={`w-${edge.id}`}
                className="graph-weight"
                style={{ left: g.mx, top: g.my }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setWeightValue(edge.weight);
                  setWeightEdit(edge.id);
                }}
              >
                {edge.weight}
              </span>
            );
          })}

          {layout.placed.map((p) => (
            <div
              key={p.node.id}
              className={chipClass(p.node.id)}
              style={{ left: p.x - p.w / 2, top: p.y - NODE_H / 2, width: p.w, height: NODE_H }}
              onMouseDown={(e) => {
                e.preventDefault();
                setSel(p.node.id);
                focusRef.current?.focus();
              }}
              onDoubleClick={() => startEdit(p.node.id)}
            >
              {editing === p.node.id ? (
                <input
                  ref={inputRef}
                  className="tree-node-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
                      e.preventDefault();
                      commitEdit();
                    }
                  }}
                  onBlur={commitEdit}
                />
              ) : (
                <span>{p.node.label || "·"}</span>
              )}
            </div>
          ))}

          {pointerLayout.map(({ p: ptr, y }) => (
            <div
              key={ptr.id}
              className={`tree-pointer${ptr.nodeId === sel ? " is-active" : ""}${hoveredPtr != null && hoveredPtr !== ptr.id ? " is-dim" : ""}`}
              style={{ left: layout.width + 18, top: y - 9 }}
              onMouseEnter={() => setHoveredPtr(ptr.id)}
              onMouseLeave={() => setHoveredPtr(null)}
            >
              {pointerEdit === ptr.id ? (
                <input
                  ref={pointerInputRef}
                  className="tree-pointer-input"
                  value={pointerLabel}
                  placeholder="ptr"
                  onChange={(e) => setPointerLabel(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
                      e.preventDefault();
                      commitPointer();
                    }
                  }}
                  onBlur={commitPointer}
                />
              ) : (
                <span
                  className="tree-pointer-tag"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setPointerLabel(ptr.label);
                    setPointerEdit(ptr.id);
                  }}
                >
                  {ptr.label || "·"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {!focused ? (
        <div className="structure-hint label-whisper" contentEditable={false}>
          Graph · ↵ to edit
        </div>
      ) : linking ? (
        <div className="structure-legend is-linking label-whisper" contentEditable={false}>
          {linking.directed ? "directed edge" : "edge"} · move to a node · ↵ connect (again to remove) · esc cancel
        </div>
      ) : (
        <div className="structure-legend label-whisper" contentEditable={false}>
          move hjkl · ↵ edit · n node · e edge · E directed · p point · m mark · b box · d delete · esc
        </div>
      )}
    </div>
  );
}
