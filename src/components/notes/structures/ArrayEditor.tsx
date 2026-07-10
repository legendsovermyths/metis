import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { genId } from "../genId";
import type { ArrayData } from "./types";

interface Props extends NodeViewProps {
  onFocusChange: (focused: boolean) => void;
}

const EMPTY: ArrayData = { cells: [], pointers: [], boxes: [], highlights: [] };

export function ArrayEditor({ node, updateAttributes, editor, getPos, onFocusChange }: Props) {
  const data = useMemo<ArrayData>(() => {
    try {
      return { ...EMPTY, ...(JSON.parse(node.attrs.data || "{}") as ArrayData) };
    } catch {
      return EMPTY;
    }
  }, [node.attrs.data]);
  const { cells, pointers, boxes, highlights } = data;

  const [focused, setFocused] = useState(false);
  const [anchor, setAnchor] = useState(0);
  const [head, setHead] = useState(0);
  const [editing, setEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pointerEdit, setPointerEdit] = useState<string | null>(null);
  const [pointerLabel, setPointerLabel] = useState("");

  const focusRef = useRef<HTMLDivElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const pointerInputRef = useRef<HTMLInputElement>(null);

  const lo = Math.min(anchor, head);
  const hi = Math.max(anchor, head);

  const setData = (next: Partial<ArrayData>) =>
    updateAttributes({ data: JSON.stringify({ ...data, ...next }) });

  useEffect(() => {
    if (editing != null) {
      cellInputRef.current?.focus();
      cellInputRef.current?.select();
    }
  }, [editing]);
  useEffect(() => {
    if (pointerEdit != null) pointerInputRef.current?.focus();
  }, [pointerEdit]);

  function clampSel(i: number) {
    const c = Math.max(0, Math.min(i, Math.max(0, cells.length - 1)));
    setAnchor(c);
    setHead(c);
  }

  function stepOut() {
    const pos = typeof getPos === "function" ? getPos() : null;
    focusRef.current?.blur();
    editor.commands.focus();
    if (pos != null) editor.commands.setNodeSelection(pos);
  }

  function startEdit(i: number) {
    setEditValue(cells[i] ?? "");
    setEditing(i);
  }
  function commitEdit() {
    if (editing == null) return;
    const next = cells.slice();
    next[editing] = editValue;
    setData({ cells: next });
    setEditing(null);
    focusRef.current?.focus();
  }

  // Commit the current cell and open a fresh one right after it (comma / tab flow).
  function commitAndContinue() {
    if (editing == null) return;
    const at = editing + 1;
    const withValue = cells.slice();
    withValue[editing] = editValue;
    const shift = (i: number) => (i >= at ? i + 1 : i);
    setData({
      cells: withValue.slice(0, at).concat([""], withValue.slice(at)),
      pointers: pointers.map((p) => ({ ...p, index: shift(p.index) })),
      boxes: boxes.map(shift),
      highlights: highlights.map(shift),
    });
    setAnchor(at);
    setHead(at);
    setEditValue("");
    setEditing(at);
  }

  // Backspace on an empty cell removes it and steps back — kills trailing empties.
  function deleteEditingCell() {
    if (editing == null) return;
    const idx = editing;
    const shift = (i: number) => (i > idx ? i - 1 : i);
    setData({
      cells: cells.slice(0, idx).concat(cells.slice(idx + 1)),
      pointers: pointers.filter((p) => p.index !== idx).map((p) => ({ ...p, index: shift(p.index) })),
      boxes: boxes.filter((i) => i !== idx).map(shift),
      highlights: highlights.filter((i) => i !== idx).map(shift),
    });
    const sel = Math.max(0, idx - 1);
    setAnchor(sel);
    setHead(sel);
    setEditing(null);
    focusRef.current?.focus();
  }

  // Insert one empty cell at `index`, shifting decorations, and edit it.
  function insertAt(index: number) {
    const at = Math.max(0, Math.min(index, cells.length));
    const shift = (i: number) => (i >= at ? i + 1 : i);
    setData({
      cells: cells.slice(0, at).concat([""], cells.slice(at)),
      pointers: pointers.map((p) => ({ ...p, index: shift(p.index) })),
      boxes: boxes.map(shift),
      highlights: highlights.map(shift),
    });
    setAnchor(at);
    setHead(at);
    setEditValue("");
    setEditing(at);
  }

  // Split pasted "1, 2, 3" into cells at the caret. Returns false if not multi-value.
  function pasteCells(text: string): boolean {
    if (editing == null) return false;
    const parts = text.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length < 2) return false;
    const idx = editing;
    const delta = parts.length - 1;
    const shift = (i: number) => (i > idx ? i + delta : i);
    setData({
      cells: cells.slice(0, idx).concat(parts, cells.slice(idx + 1)),
      pointers: pointers.map((p) => ({ ...p, index: shift(p.index) })),
      boxes: boxes.map(shift),
      highlights: highlights.map(shift),
    });
    const last = idx + parts.length - 1;
    setAnchor(last);
    setHead(last);
    setEditing(null);
    focusRef.current?.focus();
    return true;
  }

  function deleteSelection() {
    if (!cells.length) return;
    const count = hi - lo + 1;
    const next = cells.slice(0, lo).concat(cells.slice(hi + 1));
    const shift = (i: number) => (i > hi ? i - count : i);
    setData({
      cells: next,
      pointers: pointers.filter((p) => p.index < lo || p.index > hi).map((p) => ({ ...p, index: shift(p.index) })),
      boxes: boxes.filter((i) => i < lo || i > hi).map(shift),
      highlights: highlights.filter((i) => i < lo || i > hi).map(shift),
    });
    clampSel(lo);
  }

  function toggleSet(key: "boxes" | "highlights") {
    const set = new Set(data[key]);
    const all = [];
    for (let i = lo; i <= hi; i++) all.push(i);
    const allOn = all.every((i) => set.has(i));
    all.forEach((i) => (allOn ? set.delete(i) : set.add(i)));
    setData({ [key]: [...set].sort((a, b) => a - b) } as Partial<ArrayData>);
  }

  function addPointer() {
    if (!cells.length) return;
    const id = genId();
    setData({ pointers: [...pointers, { id, label: "", index: head }] });
    setPointerLabel("");
    setPointerEdit(id);
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

  function moveHead(delta: number, shift: boolean) {
    const h = Math.max(0, Math.min(head + delta, cells.length - 1));
    setHead(h);
    if (!shift) setAnchor(h);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "l" || e.key === "j") {
      e.preventDefault();
      moveHead(1, e.shiftKey);
    } else if (e.key === "ArrowLeft" || e.key === "h" || e.key === "k") {
      e.preventDefault();
      moveHead(-1, e.shiftKey);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cells.length) startEdit(head);
      else insertAt(0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      insertAt(cells.length ? head + 1 : 0);
    } else if (e.key === "i") {
      e.preventDefault();
      insertAt(head);
    } else if (e.key === "a") {
      e.preventDefault();
      insertAt(cells.length);
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "d" || e.key === "x") {
      e.preventDefault();
      deleteSelection();
    } else if (e.key === "b") {
      e.preventDefault();
      toggleSet("boxes");
    } else if (e.key === "m") {
      e.preventDefault();
      toggleSet("highlights");
    } else if (e.key === "p") {
      e.preventDefault();
      addPointer();
    } else if (e.key === "t") {
      e.preventDefault();
      const pos = typeof getPos === "function" ? getPos() : null;
      if (pos != null) editor.commands.transformStructure(pos);
    } else if (e.key === "Escape") {
      e.preventDefault();
      stepOut();
    }
  }

  function selectCell(i: number) {
    setAnchor(i);
    setHead(i);
    focusRef.current?.focus();
  }

  const cellClass = (i: number) =>
    "arr-cell" +
    (i >= lo && i <= hi && focused ? " is-selected" : "") +
    (boxes.includes(i) ? " is-boxed" : "") +
    (highlights.includes(i) ? " is-highlighted" : "");

  return (
    <div className="arr">
      <div
        ref={focusRef}
        tabIndex={0}
        className="structure-focus arr-focus"
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
          }
        }}
      >
        <div className="arr-cells">
          {cells.map((c, i) => (
            <div className="arr-cellwrap" key={i}>
              <div
                className={cellClass(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectCell(i);
                }}
                onDoubleClick={() => startEdit(i)}
              >
                {editing === i ? (
                  <input
                    ref={cellInputRef}
                    className="arr-cell-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter" || e.key === "Escape") {
                        e.preventDefault();
                        commitEdit();
                      } else if (e.key === "Tab" || e.key === ",") {
                        e.preventDefault();
                        commitAndContinue();
                      } else if (e.key === "Backspace" && editValue === "") {
                        e.preventDefault();
                        deleteEditingCell();
                      }
                    }}
                    onPaste={(e) => {
                      if (pasteCells(e.clipboardData.getData("text"))) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onBlur={commitEdit}
                  />
                ) : (
                  <span>{c || " "}</span>
                )}
              </div>
              <div className="arr-index">{i}</div>
              <div className="arr-pointers">
                {pointers
                  .filter((p) => p.index === i)
                  .map((p) =>
                    pointerEdit === p.id ? (
                      <input
                        key={p.id}
                        ref={pointerInputRef}
                        className="arr-pointer-input"
                        value={pointerLabel}
                        placeholder="i"
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
                      <span key={p.id} className="arr-pointer">
                        <span className="arr-pointer-arrow">↑</span>
                        {p.label}
                      </span>
                    ),
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!focused && (
        <div className="structure-hint label-whisper" contentEditable={false}>
          Array · ↵ to edit · type numbers, commas for next
        </div>
      )}
      {focused && (
        <div className="structure-legend label-whisper" contentEditable={false}>
          move ←→ · ↵ edit · , / tab next · i insert · a push · x delete · p point · m mark · b box · t transform · esc
        </div>
      )}
    </div>
  );
}
