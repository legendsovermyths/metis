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

  function appendCell() {
    const next = [...cells, ""];
    setData({ cells: next });
    setAnchor(next.length - 1);
    setHead(next.length - 1);
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
    } else if (e.key === "Tab") {
      e.preventDefault();
      appendCell();
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "d") {
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
                      if (e.key === "Enter" || e.key === "Escape" || e.key === "Tab") {
                        e.preventDefault();
                        commitEdit();
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
          Array · ↵ to edit
        </div>
      )}
      {focused && (
        <div className="structure-legend label-whisper" contentEditable={false}>
          move hjkl←→ · ↵ edit · tab add · p point · m mark · b box · d delete · esc
        </div>
      )}
    </div>
  );
}
