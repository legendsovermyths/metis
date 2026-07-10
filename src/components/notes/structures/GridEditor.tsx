import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { genId } from "../genId";
import type { GridData } from "./types";

interface Props extends NodeViewProps {
  onFocusChange: (focused: boolean) => void;
}

const EMPTY: GridData = { rows: [["", ""], ["", ""]], boxes: [], highlights: [], pointers: [] };

const key = (r: number, c: number) => `${r},${c}`;

export function GridEditor({ node, updateAttributes, editor, getPos, onFocusChange }: Props) {
  const data = useMemo<GridData>(() => {
    try {
      return { ...EMPTY, ...(JSON.parse(node.attrs.data || "{}") as GridData) };
    } catch {
      return EMPTY;
    }
  }, [node.attrs.data]);
  const { rows, boxes, highlights, pointers } = data;
  const R = rows.length;
  const C = rows[0]?.length ?? 0;

  const [focused, setFocused] = useState(false);
  const [sel, setSel] = useState({ r: 0, c: 0 });
  const [editing, setEditing] = useState<{ r: number; c: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [pointerEdit, setPointerEdit] = useState<string | null>(null);
  const [pointerLabel, setPointerLabel] = useState("");

  const focusRef = useRef<HTMLDivElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const pointerInputRef = useRef<HTMLInputElement>(null);

  const setData = (next: Partial<GridData>) =>
    updateAttributes({ data: JSON.stringify({ ...data, ...next }) });

  useEffect(() => {
    if (editing) {
      cellInputRef.current?.focus();
      cellInputRef.current?.select();
    }
  }, [editing]);
  useEffect(() => {
    if (pointerEdit != null) pointerInputRef.current?.focus();
  }, [pointerEdit]);

  function clampSel(r: number, c: number) {
    setSel({
      r: Math.max(0, Math.min(r, rows.length - 1)),
      c: Math.max(0, Math.min(c, (rows[0]?.length ?? 1) - 1)),
    });
  }

  function stepOut() {
    const pos = typeof getPos === "function" ? getPos() : null;
    focusRef.current?.blur();
    editor.commands.focus();
    if (pos != null) editor.commands.setNodeSelection(pos);
  }

  function startEdit(r: number, c: number) {
    setEditValue(rows[r]?.[c] ?? "");
    setEditing({ r, c });
  }

  function writeCell(r: number, c: number, value: string) {
    const next = rows.map((row) => row.slice());
    next[r][c] = value;
    return next;
  }

  function commitEdit() {
    if (!editing) return;
    setData({ rows: writeCell(editing.r, editing.c, editValue) });
    setEditing(null);
    focusRef.current?.focus();
  }

  // Commit and step to the next cell (wrapping row-major, growing a row at the end).
  function commitAndContinue() {
    if (!editing) return;
    const { r, c } = editing;
    let next = writeCell(r, c, editValue);
    let nr = r;
    let nc = c + 1;
    if (nc >= C) {
      nc = 0;
      nr = r + 1;
      if (nr >= next.length) next = [...next, Array(C).fill("")];
    }
    setData({ rows: next });
    setSel({ r: nr, c: nc });
    setEditValue(next[nr][nc] ?? "");
    setEditing({ r: nr, c: nc });
  }

  function addRow(after: number) {
    const next = rows.slice();
    next.splice(after + 1, 0, Array(C).fill(""));
    setData({
      rows: next,
      boxes: shiftCoords(boxes, after, "r", 1),
      highlights: shiftCoords(highlights, after, "r", 1),
      pointers: pointers.map((p) => (p.r > after ? { ...p, r: p.r + 1 } : p)),
    });
    setSel({ r: after + 1, c: sel.c });
  }

  function addCol(after: number) {
    const next = rows.map((row) => {
      const copy = row.slice();
      copy.splice(after + 1, 0, "");
      return copy;
    });
    setData({
      rows: next,
      boxes: shiftCoords(boxes, after, "c", 1),
      highlights: shiftCoords(highlights, after, "c", 1),
      pointers: pointers.map((p) => (p.c > after ? { ...p, c: p.c + 1 } : p)),
    });
    setSel({ r: sel.r, c: after + 1 });
  }

  function deleteRow(r: number) {
    if (R <= 1) return;
    setData({
      rows: rows.slice(0, r).concat(rows.slice(r + 1)),
      boxes: dropAndShift(boxes, r, "r"),
      highlights: dropAndShift(highlights, r, "r"),
      pointers: pointers.filter((p) => p.r !== r).map((p) => (p.r > r ? { ...p, r: p.r - 1 } : p)),
    });
    clampSel(r, sel.c);
  }

  function deleteCol(c: number) {
    if (C <= 1) return;
    setData({
      rows: rows.map((row) => row.slice(0, c).concat(row.slice(c + 1))),
      boxes: dropAndShift(boxes, c, "c"),
      highlights: dropAndShift(highlights, c, "c"),
      pointers: pointers.filter((p) => p.c !== c).map((p) => (p.c > c ? { ...p, c: p.c - 1 } : p)),
    });
    clampSel(sel.r, c);
  }

  function toggleMark(field: "boxes" | "highlights") {
    const k = key(sel.r, sel.c);
    const set = new Set(data[field]);
    if (set.has(k)) set.delete(k);
    else set.add(k);
    setData({ [field]: [...set] } as Partial<GridData>);
  }

  function addPointer() {
    const id = genId();
    setData({ pointers: [...pointers, { id, label: "", r: sel.r, c: sel.c }] });
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

  function move(dr: number, dc: number) {
    clampSel(sel.r + dr, sel.c + dc);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "l") {
      e.preventDefault();
      move(0, 1);
    } else if (e.key === "ArrowLeft" || e.key === "h") {
      e.preventDefault();
      move(0, -1);
    } else if (e.key === "ArrowDown" || e.key === "j") {
      e.preventDefault();
      move(1, 0);
    } else if (e.key === "ArrowUp" || e.key === "k") {
      e.preventDefault();
      move(-1, 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      startEdit(sel.r, sel.c);
    } else if (e.key === "R") {
      e.preventDefault();
      deleteRow(sel.r);
    } else if (e.key === "C") {
      e.preventDefault();
      deleteCol(sel.c);
    } else if (e.key === "r") {
      e.preventDefault();
      addRow(sel.r);
    } else if (e.key === "c") {
      e.preventDefault();
      addCol(sel.c);
    } else if (e.key === "p") {
      e.preventDefault();
      addPointer();
    } else if (e.key === "t") {
      e.preventDefault();
      const pos = typeof getPos === "function" ? getPos() : null;
      if (pos != null) editor.commands.transformStructure(pos);
    } else if (e.key === "m") {
      e.preventDefault();
      toggleMark("highlights");
    } else if (e.key === "b") {
      e.preventDefault();
      toggleMark("boxes");
    } else if (e.key === "Escape") {
      e.preventDefault();
      stepOut();
    }
  }

  const cellClass = (r: number, c: number) => {
    const k = key(r, c);
    return (
      "grid-cell" +
      (pointers.some((p) => p.r === r && p.c === c) ? " is-pointed" : "") +
      (boxes.includes(k) ? " is-boxed" : "") +
      (highlights.includes(k) ? " is-highlighted" : "") +
      (focused && sel.r === r && sel.c === c ? " is-selected" : "")
    );
  };

  return (
    <div className="grid2d">
      <div
        ref={focusRef}
        tabIndex={0}
        className="structure-focus grid2d-focus"
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
            if (editing) commitEdit();
            if (pointerEdit != null) commitPointer();
          }
        }}
      >
        {/* Column-major: each column stacks its cells then its pointer lane, so a
            pointer always sits directly beneath the column it marks (like the array). */}
        <div className="grid2d-cols">
          {Array.from({ length: C }, (_, c) => {
            const colPointers = pointers.filter((p) => p.c === c);
            return (
              <div className="grid2d-col" key={c}>
                {rows.map((_row, r) => (
                  <div
                    key={r}
                    className={cellClass(r, c)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSel({ r, c });
                      focusRef.current?.focus();
                    }}
                    onDoubleClick={() => startEdit(r, c)}
                  >
                    {editing && editing.r === r && editing.c === c ? (
                      <input
                        ref={cellInputRef}
                        className="grid-cell-input"
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
                          }
                        }}
                        onBlur={commitEdit}
                      />
                    ) : (
                      <span>{rows[r][c] || " "}</span>
                    )}
                  </div>
                ))}

                {colPointers.length > 0 && (
                  <div className="grid-ptr-col">
                    {colPointers.map((p) =>
                      pointerEdit === p.id ? (
                        <input
                          key={p.id}
                          ref={pointerInputRef}
                          className="grid-ptr-input"
                          value={pointerLabel}
                          placeholder="i,j"
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
                        <span key={p.id} className="grid-ptr">
                          <span className="grid-ptr-arrow">↑</span>
                          {p.label}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!focused && (
        <div className="structure-hint label-whisper" contentEditable={false}>
          Grid · ↵ to edit · type with commas to fill
        </div>
      )}
      {focused && (
        <div className="structure-legend label-whisper" contentEditable={false}>
          move hjkl/↑↓←→ · ↵ edit · , / tab next · r/c add row/col · R/C delete · p point · m mark · b box · t transform · esc
        </div>
      )}
    </div>
  );
}

/** Shift "r,c" coords whose axis value exceeds `after` by `delta`. */
function shiftCoords(list: string[], after: number, axis: "r" | "c", delta: number): string[] {
  return list.map((k) => {
    const [r, c] = k.split(",").map(Number);
    if (axis === "r") return r > after ? key(r + delta, c) : k;
    return c > after ? key(r, c + delta) : k;
  });
}

/** Drop coords on the removed line and shift those beyond it back by one. */
function dropAndShift(list: string[], at: number, axis: "r" | "c"): string[] {
  return list
    .filter((k) => {
      const [r, c] = k.split(",").map(Number);
      return (axis === "r" ? r : c) !== at;
    })
    .map((k) => {
      const [r, c] = k.split(",").map(Number);
      if (axis === "r") return r > at ? key(r - 1, c) : k;
      return c > at ? key(r, c - 1) : k;
    });
}
