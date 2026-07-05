import { useEffect, useMemo, useRef, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { evaluate } from "./calc/evaluate";

export function CalcNode({ node, updateAttributes, editor, getPos, selected }: NodeViewProps) {
  const expr = (node.attrs.expr as string) ?? "";

  const [editing, setEditing] = useState(expr === "");
  const [value, setValue] = useState(expr);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = useRef(false);

  const committed = useMemo(() => evaluate(expr), [expr]);
  const live = useMemo(() => evaluate(value), [value]);

  useEffect(() => {
    if (!editing) return;
    done.current = false;
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(id);
  }, [editing]);

  function startEdit() {
    if (!editor.isEditable) return;
    setValue(expr);
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
    updateAttributes({ expr: value });
    if (pos != null) editor.chain().focus().setTextSelection(pos + node.nodeSize).run();
    else editor.commands.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      const pos = typeof getPos === "function" ? getPos() : null;
      done.current = true;
      if (expr === "" && pos != null) {
        editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      } else {
        setValue(expr);
        setEditing(false);
        editor.commands.focus();
      }
    }
  }

  if (!editing) {
    return (
      <NodeViewWrapper as="span" className={`calc-node${selected ? " is-selected" : ""}`}>
        <span className="calc-chip" onClick={startEdit} role="button" tabIndex={0}>
          <span className="calc-expr">{expr}</span>
          <span className="calc-eq">=</span>
          <span className={committed.ok ? "calc-result" : "calc-result is-error"}>
            {committed.ok ? committed.display : "?"}
          </span>
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      as="span"
      className="calc-node calc-edit"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <span className="calc-prompt" contentEditable={false}>
        &gt;&gt;&gt;
      </span>
      <input
        ref={inputRef}
        value={value}
        size={Math.max(value.length, "nCr(8,2)".length) + 1}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder="nCr(8,2)"
        spellCheck={false}
        className="calc-input"
      />
      <span className="calc-live" contentEditable={false}>
        {live.ok ? (
          <>
            <span className="calc-eq">=</span>
            <span className="calc-result">{live.display}</span>
            <span className="calc-hint">↵</span>
          </>
        ) : live.error && value.trim() ? (
          <span className="calc-hint calc-hint-error">{live.error}</span>
        ) : null}
      </span>
    </NodeViewWrapper>
  );
}
