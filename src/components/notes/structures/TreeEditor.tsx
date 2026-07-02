import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import dagre from "dagre";
import { genId } from "../genId";
import { curvedArrow } from "./geometry";
import type { TreeData, TreeNode } from "./types";

interface Props extends NodeViewProps {
  onFocusChange: (focused: boolean) => void;
}

const EMPTY: TreeData = {
  nodes: [],
  root: null,
  boxes: [],
  highlights: [],
  folded: [],
  pointers: [],
  arrows: [],
  weights: {},
};
const NODE_H = 40;
const nodeWidth = (label: string) => Math.max(NODE_H, label.length * 9 + 18);

interface Placed {
  node: TreeNode;
  x: number;
  y: number;
  w: number;
}

export function TreeEditor({ node, updateAttributes, editor, getPos, onFocusChange }: Props) {
  const data = useMemo<TreeData>(() => {
    try {
      return { ...EMPTY, ...(JSON.parse(node.attrs.data || "{}") as TreeData) };
    } catch {
      return EMPTY;
    }
  }, [node.attrs.data]);
  const { nodes, root, boxes, highlights, folded, pointers, arrows, weights } = data;

  const [focused, setFocused] = useState(false);
  const [sel, setSel] = useState<string | null>(root);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pointerEdit, setPointerEdit] = useState<string | null>(null);
  const [pointerLabel, setPointerLabel] = useState("");
  const [linking, setLinking] = useState<string | null>(null);
  const [hoveredPtr, setHoveredPtr] = useState<string | null>(null);
  const [weightEdit, setWeightEdit] = useState<string | null>(null);
  const [weightValue, setWeightValue] = useState("");

  const focusRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pointerInputRef = useRef<HTMLInputElement>(null);
  const weightInputRef = useRef<HTMLInputElement>(null);

  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const childrenOf = (id: string) => nodes.filter((n) => n.parent === id);
  const parentOf = (id: string | null) => (id ? byId[id]?.parent ?? null : null);

  const setData = (next: Partial<TreeData>) =>
    updateAttributes({ data: JSON.stringify({ ...data, ...next }) });

  useEffect(() => {
    if (sel == null || !byId[sel]) setSel(root);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, nodes.length]);

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

  // Visible nodes: skip descendants of folded nodes.
  const layout = useMemo(() => {
    if (!root || !byId[root]) return { placed: [] as Placed[], width: 0, height: 0 };
    const visible: TreeNode[] = [];
    const walk = (id: string) => {
      const n = byId[id];
      if (!n) return;
      visible.push(n);
      if (!folded.includes(id)) childrenOf(id).forEach((c) => walk(c.id));
    };
    walk(root);
    const visibleIds = new Set(visible.map((n) => n.id));

    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: "TB", nodesep: 38, ranksep: 60, marginx: 12, marginy: 12 });
    g.setDefaultEdgeLabel(() => ({}));
    visible.forEach((n) => g.setNode(n.id, { width: nodeWidth(n.label), height: NODE_H }));
    visible.forEach((n) => {
      if (n.parent && visibleIds.has(n.parent)) g.setEdge(n.parent, n.id);
    });
    dagre.layout(g);
    const placed: Placed[] = visible.map((n) => {
      const p = g.node(n.id);
      return { node: n, x: p.x, y: p.y, w: nodeWidth(n.label) };
    });
    const gg = g.graph();
    return { placed, width: gg.width ?? 0, height: gg.height ?? 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, folded, root]);

  const placedById = useMemo(
    () => Object.fromEntries(layout.placed.map((p) => [p.node.id, p])),
    [layout],
  );

  // Pointers live in a gutter to the right of the tree so they never overlap it.
  const pointerLayout = useMemo(() => {
    const items = pointers
      .map((p) => ({ p, node: placedById[p.nodeId] as Placed | undefined }))
      .filter((x): x is { p: (typeof pointers)[number]; node: Placed } => !!x.node)
      .sort((a, b) => a.node.y - b.node.y || a.node.x - b.node.x);
    let lastY = -Infinity;
    return items.map(({ p, node }) => {
      const y = Math.max(node.y, lastY + 22);
      lastY = y;
      return { p, node, y };
    });
  }, [pointers, placedById]);

  const gutter = pointerLayout.length ? 168 : 0;
  const canvasW = layout.width + gutter;
  const canvasH = Math.max(layout.height, (pointerLayout.at(-1)?.y ?? 0) + 20);

  function stepOut() {
    const pos = typeof getPos === "function" ? getPos() : null;
    focusRef.current?.blur();
    editor.commands.focus();
    if (pos != null) editor.commands.setNodeSelection(pos);
  }

  function startEdit(id: string) {
    setEditValue(byId[id]?.label ?? "");
    setEditing(id);
  }
  function commitEdit() {
    if (editing == null) return;
    setData({ nodes: nodes.map((n) => (n.id === editing ? { ...n, label: editValue } : n)) });
    setEditing(null);
    focusRef.current?.focus();
  }

  function addChild(parentId: string) {
    const id = genId();
    setData({ nodes: [...nodes, { id, label: "", parent: parentId }], folded: folded.filter((f) => f !== parentId) });
    setSel(id);
    setEditValue("");
    setEditing(id);
  }
  function addSibling(id: string) {
    const p = parentOf(id);
    if (!p) return;
    addChild(p);
  }

  function reRoot(id: string) {
    const path: string[] = [];
    let cur: string | null = id;
    while (cur) {
      path.push(cur);
      cur = parentOf(cur);
    }
    const next = nodes.map((n) => ({ ...n }));
    const map = Object.fromEntries(next.map((n) => [n.id, n]));
    for (let i = 0; i < path.length - 1; i++) map[path[i + 1]].parent = path[i];
    map[id].parent = null;
    setData({ nodes: next, root: id });
    setSel(id);
  }

  function toggleFold(id: string) {
    if (!childrenOf(id).length) return;
    setData({ folded: folded.includes(id) ? folded.filter((f) => f !== id) : [...folded, id] });
  }

  function toggleSet(key: "boxes" | "highlights", id: string) {
    const set = new Set(data[key]);
    set.has(id) ? set.delete(id) : set.add(id);
    setData({ [key]: [...set] } as Partial<TreeData>);
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

  function createArrow(from: string, to: string) {
    if (from === to || arrows.some((a) => a.from === from && a.to === to)) return;
    setData({ arrows: [...arrows, { id: genId(), from, to }] });
  }

  function startWeight(childId: string) {
    if (!parentOf(childId)) return;
    setWeightValue(weights[childId] ?? "");
    setWeightEdit(childId);
  }
  function commitWeight() {
    if (weightEdit == null) return;
    const next = { ...weights };
    const v = weightValue.trim();
    if (v) next[weightEdit] = v;
    else delete next[weightEdit];
    setData({ weights: next });
    setWeightEdit(null);
    focusRef.current?.focus();
  }

  function deleteSubtree(id: string) {
    const ids = new Set<string>();
    const collect = (x: string) => {
      ids.add(x);
      childrenOf(x).forEach((c) => collect(c.id));
    };
    collect(id);
    const remaining = nodes.filter((n) => !ids.has(n.id));
    const parent = parentOf(id);
    const nextWeights = { ...weights };
    ids.forEach((x) => delete nextWeights[x]);
    setData({
      nodes: remaining,
      root: id === root ? null : root,
      boxes: boxes.filter((b) => !ids.has(b)),
      highlights: highlights.filter((h) => !ids.has(h)),
      folded: folded.filter((f) => !ids.has(f)),
      pointers: pointers.filter((p) => !ids.has(p.nodeId)),
      arrows: arrows.filter((a) => !ids.has(a.from) && !ids.has(a.to)),
      weights: nextWeights,
    });
    setSel(parent ?? remaining[0]?.id ?? null);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!sel) {
      if (e.key === "Escape") stepOut();
      return;
    }
    // Linking mode: navigate to a target, Enter connects, Esc cancels.
    if (linking) {
      if (e.key === "Enter") {
        e.preventDefault();
        createArrow(linking, sel);
        setLinking(null);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setLinking(null);
        return;
      }
    }
    const sibs = childrenOf(parentOf(sel) ?? "");
    const idx = sibs.findIndex((n) => n.id === sel);
    switch (e.key) {
      case "ArrowUp":
      case "k": {
        e.preventDefault();
        const p = parentOf(sel);
        if (p) setSel(p);
        break;
      }
      case "ArrowDown":
      case "j": {
        e.preventDefault();
        if (!folded.includes(sel)) {
          const c = childrenOf(sel)[0];
          if (c) setSel(c.id);
        }
        break;
      }
      case "ArrowLeft":
      case "h":
        e.preventDefault();
        if (idx > 0) setSel(sibs[idx - 1].id);
        break;
      case "ArrowRight":
      case "l":
        e.preventDefault();
        if (idx >= 0 && idx < sibs.length - 1) setSel(sibs[idx + 1].id);
        break;
      case "Enter":
        e.preventDefault();
        if (e.shiftKey) addSibling(sel);
        else startEdit(sel);
        break;
      case "Tab":
        e.preventDefault();
        addChild(sel);
        break;
      case "r":
        e.preventDefault();
        reRoot(sel);
        break;
      case "z":
        e.preventDefault();
        toggleFold(sel);
        break;
      case "b":
        e.preventDefault();
        toggleSet("boxes", sel);
        break;
      case "m":
        e.preventDefault();
        toggleSet("highlights", sel);
        break;
      case "p":
        e.preventDefault();
        addPointer(sel);
        break;
      case "a":
        e.preventDefault();
        setLinking(sel);
        break;
      case "w":
        e.preventDefault();
        startWeight(sel);
        break;
      case "Backspace":
      case "Delete":
      case "d":
        e.preventDefault();
        deleteSubtree(sel);
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
    <div className="tree">
      <div
        ref={focusRef}
        tabIndex={0}
        className="structure-focus tree-focus"
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
          }
        }}
      >
        {layout.placed.length === 0 ? (
          <div className="tree-empty label-whisper">empty tree</div>
        ) : (
          <div className="tree-canvas" style={{ width: canvasW, height: canvasH }}>
            <svg className="tree-edges" width={canvasW} height={canvasH}>
              <defs>
                <marker id="tree-arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="hsl(var(--amber))" />
                </marker>
              </defs>
              {layout.placed.map((p) => {
                const parent = p.node.parent && placedById[p.node.parent];
                if (!parent) return null;
                return (
                  <line
                    key={p.node.id}
                    x1={parent.x}
                    y1={parent.y + NODE_H / 2}
                    x2={p.x}
                    y2={p.y - NODE_H / 2}
                    className="tree-edge"
                    onClick={() => {
                      setWeightValue(weights[p.node.id] ?? "");
                      setWeightEdit(p.node.id);
                    }}
                  />
                );
              })}
              {arrows.map((a) => {
                const f = placedById[a.from];
                const t = placedById[a.to];
                if (!f || !t) return null;
                return (
                  <path
                    key={a.id}
                    d={curvedArrow(f, t, NODE_H)}
                    className="tree-annot-arrow"
                    markerEnd="url(#tree-arrowhead)"
                    onClick={() => setData({ arrows: arrows.filter((x) => x.id !== a.id) })}
                  />
                );
              })}
              {linking && sel && linking !== sel && placedById[linking] && placedById[sel] && (
                <path d={curvedArrow(placedById[linking], placedById[sel], NODE_H)} className="tree-link-preview" />
              )}
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
            </svg>
            {layout.placed.map((p) => {
              const hasHidden = folded.includes(p.node.id) && childrenOf(p.node.id).length > 0;
              return (
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
                  {hasHidden && <span className="tree-fold">+</span>}
                </div>
              );
            })}
            {layout.placed.map((p) => {
              const parent = p.node.parent && placedById[p.node.parent];
              if (!parent) return null;
              const mx = (parent.x + p.x) / 2;
              const my = (parent.y + p.y) / 2;
              if (weightEdit === p.node.id) {
                return (
                  <input
                    key={`w-${p.node.id}`}
                    ref={weightInputRef}
                    className="graph-weight-input"
                    style={{ left: mx, top: my }}
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
              if (!weights[p.node.id]) return null;
              return (
                <span
                  key={`w-${p.node.id}`}
                  className="graph-weight"
                  style={{ left: mx, top: my }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setWeightValue(weights[p.node.id]);
                    setWeightEdit(p.node.id);
                  }}
                >
                  {weights[p.node.id]}
                </span>
              );
            })}
            {pointerLayout.map(({ p: ptr, y }) => {
              return (
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
              );
            })}
          </div>
        )}
      </div>

      {!focused ? (
        <div className="structure-hint label-whisper" contentEditable={false}>
          Tree · ↵ to edit
        </div>
      ) : linking ? (
        <div className="structure-legend is-linking label-whisper" contentEditable={false}>
          drawing arrow · move to a target · ↵ connect · esc cancel
        </div>
      ) : (
        <div className="structure-legend label-whisper" contentEditable={false}>
          move hjkl · ↵ edit · tab child · ⇧↵ sibling · r re-root · z fold · w weight · p point · a arrow · m mark · b box · d delete · esc
        </div>
      )}
    </div>
  );
}
