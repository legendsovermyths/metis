import { useEffect, useMemo, useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import katex from "katex";
import { applyDeterministic } from "./mathTransforms";
import { filterMathSymbols, type MathSymbol } from "./mathSymbols";

function render(src: string, display: boolean): string {
  const latex = applyDeterministic(src);
  if (!latex.trim()) return "";
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: display });
  } catch {
    return "";
  }
}

export function MathNode({ node, updateAttributes, editor, getPos, selected }: NodeViewProps) {
  const display = node.type.name === "mathBlock";
  const src = (node.attrs.src as string) ?? "";

  const [editing, setEditing] = useState(src === "");
  const [value, setValue] = useState(src);
  const [caret, setCaret] = useState(src.length);
  const [sel, setSel] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const done = useRef(false);

  const rendered = useMemo(() => render(src, display), [src, display]);
  const preview = useMemo(() => render(value, display), [value, display]);

  const suggestions = useMemo<MathSymbol[]>(() => {
    if (dismissed) return [];
    const before = value.slice(0, caret);
    const m = before.match(/[A-Za-z]+$/);
    if (!m || m[0].length < 2 || before[before.length - m[0].length - 1] === "\\") return [];
    return filterMathSymbols(m[0]);
  }, [value, caret, dismissed]);

  useEffect(() => setSel(0), [suggestions]);

  useEffect(() => {
    if (!editing) return;
    done.current = false;
    // Defer past ProseMirror's own focus handling for the insert transaction,
    // otherwise the editor grabs focus back and the field never gets the cursor.
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [editing]);

  useEffect(() => {
    if (pendingCaret.current != null && inputRef.current) {
      const c = pendingCaret.current;
      inputRef.current.setSelectionRange(c, c);
      setCaret(c);
      pendingCaret.current = null;
    }
  }, [value]);

  function startEdit() {
    if (!editor.isEditable) return;
    setValue(src);
    setCaret(src.length);
    setDismissed(false);
    setEditing(true);
  }

  function commit() {
    if (done.current) return;
    done.current = true;
    const pos = typeof getPos === "function" ? getPos() : null;
    const trimmed = value.trim();
    setEditing(false);
    if (!trimmed) {
      if (pos != null) editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      else editor.commands.focus();
      return;
    }
    updateAttributes({ src: value });
    if (pos != null) editor.chain().focus().setTextSelection(pos + node.nodeSize).run();
    else editor.commands.focus();
  }

  // `$$` — a second `$` on an empty inline field turns it into a block equation.
  function promoteToBlock() {
    const pos = typeof getPos === "function" ? getPos() : null;
    if (pos == null) return;
    done.current = true; // this node unmounts; keep blur's commit from deleting it
    editor
      .chain()
      .focus()
      .command(({ tr, state, dispatch }) => {
        if (!dispatch) return true;
        const block = state.schema.nodes.mathBlock;
        const $pos = state.doc.resolve(pos);
        // If the math sits alone on its line, replace the whole line; else drop a
        // fresh block just after it.
        if ($pos.parent.type.name === "paragraph" && $pos.parent.childCount === 1) {
          tr.replaceRangeWith($pos.before(), $pos.after(), block.create({ src: "" }));
        } else {
          tr.delete(pos, pos + node.nodeSize);
          tr.insert(tr.mapping.map($pos.after()), block.create({ src: "" }));
        }
        return true;
      })
      .run();
  }

  function accept(item: MathSymbol) {
    const before = value.slice(0, caret);
    const m = before.match(/[A-Za-z]+$/);
    if (!m) return;
    const from = caret - m[0].length;
    const next = value.slice(0, from) + item.insert + value.slice(caret);
    pendingCaret.current = from + (item.caret ?? item.insert.length);
    setValue(next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (suggestions.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => (s + 1) % suggestions.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => (s + suggestions.length - 1) % suggestions.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); accept(suggestions[sel]); return; }
      if (e.key === "Escape") { e.preventDefault(); setDismissed(true); return; }
    }
    if (e.key === "$") {
      e.preventDefault();
      if (value === "" && !display) promoteToBlock();
      else commit();
      return;
    }
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      commit();
    }
  }

  if (!editing) {
    return (
      <NodeViewWrapper
        as={display ? "div" : "span"}
        className={`math-node ${display ? "math-block" : "math-inline"}${selected ? " is-selected" : ""}`}
      >
        <span
          className="math-render"
          onClick={startEdit}
          dangerouslySetInnerHTML={rendered ? { __html: rendered } : undefined}
        >
          {rendered ? undefined : <span className="math-empty">math</span>}
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as={display ? "div" : "span"}
      className={`math-node math-edit ${display ? "math-block" : "math-inline"}`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="math-edit-preview" contentEditable={false}>
        {preview ? (
          <span dangerouslySetInnerHTML={{ __html: preview }} />
        ) : (
          <span className="math-edit-hint font-display italic">preview</span>
        )}
      </span>
      <span className="math-edit-field">
        <span className="math-edit-delim">$</span>
        <input
          ref={inputRef}
          value={value}
          size={display ? undefined : Math.max(value.length + 1, 4)}
          onChange={(e) => {
            setValue(e.target.value);
            setCaret(e.target.selectionStart ?? e.target.value.length);
            setDismissed(false);
          }}
          onKeyUp={(e) => setCaret((e.target as HTMLInputElement).selectionStart ?? value.length)}
          onClick={(e) => setCaret((e.target as HTMLInputElement).selectionStart ?? value.length)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          placeholder={display ? "sum_{i=1}^{n} a_i" : "a_i^2"}
          spellCheck={false}
          className="math-edit-input"
        />
        <span className="math-edit-delim">$</span>
      </span>
      {suggestions.length > 0 && (
        <span className="math-palette" contentEditable={false}>
          {suggestions.map((item, i) => (
            <button
              key={item.name}
              type="button"
              className={`math-palette-item${i === sel ? " is-active" : ""}`}
              onMouseEnter={() => setSel(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                accept(item);
              }}
            >
              <span
                className="math-palette-glyph"
                dangerouslySetInnerHTML={{ __html: render(item.preview, false) }}
              />
              <span className="math-palette-name">{item.name}</span>
            </button>
          ))}
        </span>
      )}
    </NodeViewWrapper>
  );
}
