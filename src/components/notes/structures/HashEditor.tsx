import { useEffect, useMemo, useRef, useState } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { genId } from "../genId";
import type { HashData, HashEntry } from "./types";

interface Props extends NodeViewProps {
  onFocusChange: (focused: boolean) => void;
}

const EMPTY: HashData = { entries: [], size: 8, highlights: [], pointers: [] };

export function HashEditor({ node, updateAttributes, editor, getPos, onFocusChange }: Props) {
  const data = useMemo<HashData>(() => {
    try {
      return { ...EMPTY, ...(JSON.parse(node.attrs.data || "{}") as HashData) };
    } catch {
      return EMPTY;
    }
  }, [node.attrs.data]);
  const { entries, size, highlights, pointers } = data;

  const [focused, setFocused] = useState(false);
  const [sel, setSel] = useState<string | null>(entries[0]?.id ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [field, setField] = useState<"key" | "value">("key");
  const [draftKey, setDraftKey] = useState("");
  const [draftValue, setDraftValue] = useState("");
  const [pointerEdit, setPointerEdit] = useState<string | null>(null);
  const [pointerLabel, setPointerLabel] = useState("");

  const focusRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);
  const pointerInputRef = useRef<HTMLInputElement>(null);

  const setData = (next: Partial<HashData>) =>
    updateAttributes({ data: JSON.stringify({ ...data, ...next }) });

  // Bucket space grows with the data (load factor ~1/16) so distinct keys almost
  // never collide — like a real table rehashing as it fills.
  const modulus = useMemo(() => {
    let m = 16;
    while (m < entries.length * 16) m <<= 1;
    return m;
  }, [entries.length]);

  const hashOf = (key: string) => {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return h % modulus;
  };

  // Only occupied buckets, sorted by index — no empty clutter, real hash slots.
  const occupied = useMemo(() => {
    const map = new Map<number, HashEntry[]>();
    entries.forEach((e) => {
      const b = hashOf(e.key);
      const arr = map.get(b) ?? [];
      arr.push(e);
      map.set(b, arr);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, modulus]);
  const flat = useMemo(() => occupied.flatMap(([, items]) => items), [occupied]);

  useEffect(() => {
    if (editingId != null) {
      const r = field === "key" ? keyRef : valueRef;
      r.current?.focus();
      r.current?.select();
    }
  }, [editingId, field]);
  useEffect(() => {
    if (pointerEdit != null) pointerInputRef.current?.focus();
  }, [pointerEdit]);

  function stepOut() {
    const pos = typeof getPos === "function" ? getPos() : null;
    focusRef.current?.blur();
    editor.commands.focus();
    if (pos != null) editor.commands.setNodeSelection(pos);
  }

  function beginEdit(id: string, f: "key" | "value") {
    const e = entries.find((x) => x.id === id);
    if (!e) return;
    setDraftKey(e.key);
    setDraftValue(e.value);
    setField(f);
    setEditingId(id);
  }

  function commitDraft() {
    if (editingId == null) return;
    setData({
      entries: entries.map((e) =>
        e.id === editingId ? { ...e, key: draftKey, value: draftValue } : e,
      ),
    });
  }

  function stopEdit() {
    commitDraft();
    setEditingId(null);
    focusRef.current?.focus();
  }

  function addEntry() {
    const id = genId();
    setData({ entries: [...entries, { id, key: "", value: "" }] });
    setSel(id);
    setDraftKey("");
    setDraftValue("");
    setField("key");
    setEditingId(id);
  }

  function deleteEntry(id: string) {
    const idx = flat.findIndex((e) => e.id === id);
    setData({
      entries: entries.filter((e) => e.id !== id),
      highlights: highlights.filter((h) => h !== id),
      pointers: pointers.filter((p) => p.entryId !== id),
    });
    const nextFlat = flat.filter((e) => e.id !== id);
    setSel(nextFlat[Math.min(idx, nextFlat.length - 1)]?.id ?? null);
  }

  function addPointer(entryId: string) {
    const pid = genId();
    setData({ pointers: [...pointers, { id: pid, entryId, label: "" }] });
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

  function toggleHighlight(id: string) {
    setData({
      highlights: highlights.includes(id)
        ? highlights.filter((h) => h !== id)
        : [...highlights, id],
    });
  }

  function moveSel(delta: number) {
    if (!flat.length) return;
    const idx = flat.findIndex((e) => e.id === sel);
    const next = Math.max(0, Math.min((idx < 0 ? 0 : idx) + delta, flat.length - 1));
    setSel(flat[next].id);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
      case "j":
        e.preventDefault();
        moveSel(1);
        break;
      case "ArrowUp":
      case "k":
        e.preventDefault();
        moveSel(-1);
        break;
      case "Enter":
        e.preventDefault();
        if (sel) beginEdit(sel, "key");
        break;
      case "Tab":
      case "n":
        e.preventDefault();
        addEntry();
        break;
      case "m":
        e.preventDefault();
        if (sel) toggleHighlight(sel);
        break;
      case "p":
        e.preventDefault();
        if (sel) addPointer(sel);
        break;
      case "Backspace":
      case "Delete":
      case "d":
        e.preventDefault();
        if (sel) deleteEntry(sel);
        break;
      case "Escape":
        e.preventDefault();
        stepOut();
        break;
    }
  }

  function onFieldKeyDown(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      e.preventDefault();
      stopEdit();
    } else if (e.key === "Enter") {
      e.preventDefault();
      stopEdit();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (field === "key") {
        commitDraft();
        setField("value");
      } else {
        commitDraft();
        addEntry();
      }
    } else if (e.key === "Tab" && e.shiftKey && field === "value") {
      e.preventDefault();
      commitDraft();
      setField("key");
    }
  }

  function entryChip(entry: HashEntry) {
    const editing = editingId === entry.id;
    return (
      <span
        key={entry.id}
        className={
          "hash-entry" +
          (entry.id === sel && focused ? " is-selected" : "") +
          (highlights.includes(entry.id) ? " is-highlighted" : "")
        }
        onMouseDown={(e) => {
          e.preventDefault();
          setSel(entry.id);
          focusRef.current?.focus();
        }}
        onDoubleClick={() => beginEdit(entry.id, "key")}
      >
        {editing ? (
          <>
            <input
              ref={keyRef}
              className="hash-input"
              value={draftKey}
              placeholder="key"
              onChange={(ev) => setDraftKey(ev.target.value)}
              onKeyDown={onFieldKeyDown}
              onBlur={stopEdit}
            />
            <span className="hash-colon">:</span>
            <input
              ref={valueRef}
              className="hash-input"
              value={draftValue}
              placeholder="val"
              onChange={(ev) => setDraftValue(ev.target.value)}
              onKeyDown={onFieldKeyDown}
              onBlur={stopEdit}
            />
          </>
        ) : (
          <>
            <span className="hash-key">{entry.key || "·"}</span>
            <span className="hash-colon">:</span>
            <span className="hash-val">{entry.value || "·"}</span>
          </>
        )}
      </span>
    );
  }

  return (
    <div className="hash">
      <div
        ref={focusRef}
        tabIndex={0}
        className="structure-focus hash-focus"
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
            if (editingId != null) stopEdit();
          }
        }}
      >
        <div className="hash-buckets">
          {occupied.length === 0 && (
            <div className="hash-placeholder label-whisper">empty · press n to add an entry</div>
          )}
          {occupied.map(([b, items]) => (
            <div className={"hash-bucket" + (items.length > 1 ? " is-collision" : "")} key={b}>
              <span className="hash-bucket-idx">{b}</span>
              <div className="hash-chain">
                {
                  items.map((entry, j) => (
                    <span className="hash-slot" key={entry.id}>
                      {j > 0 && <span className="hash-arrow">→</span>}
                      {entryChip(entry)}
                      {pointers
                        .filter((p) => p.entryId === entry.id)
                        .map((p) =>
                          pointerEdit === p.id ? (
                            <input
                              key={p.id}
                              ref={pointerInputRef}
                              className="hash-pointer-input"
                              value={pointerLabel}
                              placeholder="ptr"
                              onChange={(ev) => setPointerLabel(ev.target.value)}
                              onKeyDown={(ev) => {
                                ev.stopPropagation();
                                if (ev.key === "Enter" || ev.key === "Escape" || ev.key === "Tab") {
                                  ev.preventDefault();
                                  commitPointer();
                                }
                              }}
                              onBlur={commitPointer}
                            />
                          ) : (
                            <span
                              key={p.id}
                              className="hash-pointer"
                              onMouseDown={(ev) => {
                                ev.preventDefault();
                                setPointerLabel(p.label);
                                setPointerEdit(p.id);
                              }}
                            >
                              <span className="hash-pointer-caret">‹</span>
                              {p.label || "·"}
                            </span>
                          ),
                        )}
                    </span>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {!focused ? (
        <div className="structure-hint label-whisper" contentEditable={false}>
          Hash table · ↵ to edit
        </div>
      ) : (
        <div className="structure-legend label-whisper" contentEditable={false}>
          move jk · ↵ edit · n / tab add · tab key→val→next · p point · m mark · d delete · esc
        </div>
      )}
    </div>
  );
}
