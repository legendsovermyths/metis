import { useEffect, useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Lock } from "lucide-react";
import { ArrayEditor } from "./structures/ArrayEditor";
import { GridEditor } from "./structures/GridEditor";
import { TreeEditor } from "./structures/TreeEditor";
import { GraphEditor } from "./structures/GraphEditor";
import { HashEditor } from "./structures/HashEditor";
import type { StructureKind } from "./structures/types";

export function StructureNode(props: NodeViewProps) {
  const kind = props.node.attrs.kind as StructureKind;
  const from = props.node.attrs.from as string | null;
  const [focused, setFocused] = useState(false);
  const [op, setOp] = useState((props.node.attrs.op as string) ?? "");

  useEffect(() => {
    setOp((props.node.attrs.op as string) ?? "");
  }, [props.node.attrs.op]);

  // Frozen while a successor still points back to this node (see structureLock plugin).
  const locked = props.decorations.some((d) => (d as unknown as { spec?: { locked?: boolean } }).spec?.locked);

  function commitOp() {
    props.updateAttributes({ op: op.trim() });
  }

  return (
    <NodeViewWrapper
      as="div"
      className={
        `structure${focused ? " is-focused" : ""}` +
        `${props.selected && !focused ? " is-selected" : ""}` +
        `${locked ? " is-source-locked" : ""}`
      }
      data-kind={kind}
    >
      {from && (
        <div className="structure-flow" contentEditable={false}>
          <span className="structure-flow-arrow" aria-hidden="true" />
          <input
            className="structure-flow-op"
            value={op}
            spellCheck={false}
            onChange={(e) => setOp(e.target.value)}
            onBlur={commitOp}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                commitOp();
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
        </div>
      )}

      {locked && (
        <span
          className="structure-lock"
          contentEditable={false}
          title="Frozen while its transform exists — delete the version below to edit this again"
        >
          <Lock className="h-3 w-3" strokeWidth={1.5} />
        </span>
      )}

      <div className="structure-body">
        {kind === "array" && <ArrayEditor {...props} onFocusChange={setFocused} />}
        {kind === "grid" && <GridEditor {...props} onFocusChange={setFocused} />}
        {kind === "tree" && <TreeEditor {...props} onFocusChange={setFocused} />}
        {kind === "graph" && <GraphEditor {...props} onFocusChange={setFocused} />}
        {kind === "hash" && <HashEditor {...props} onFocusChange={setFocused} />}
      </div>
    </NodeViewWrapper>
  );
}
