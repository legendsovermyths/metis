import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { ArrayEditor } from "./structures/ArrayEditor";
import { TreeEditor } from "./structures/TreeEditor";
import { GraphEditor } from "./structures/GraphEditor";
import { HashEditor } from "./structures/HashEditor";
import type { StructureKind } from "./structures/types";

export function StructureNode(props: NodeViewProps) {
  const kind = props.node.attrs.kind as StructureKind;
  const [focused, setFocused] = useState(false);

  return (
    <NodeViewWrapper
      as="div"
      className={`structure${focused ? " is-focused" : ""}${props.selected && !focused ? " is-selected" : ""}`}
      data-kind={kind}
    >
      {kind === "array" && <ArrayEditor {...props} onFocusChange={setFocused} />}
      {kind === "tree" && <TreeEditor {...props} onFocusChange={setFocused} />}
      {kind === "graph" && <GraphEditor {...props} onFocusChange={setFocused} />}
      {kind === "hash" && <HashEditor {...props} onFocusChange={setFocused} />}
    </NodeViewWrapper>
  );
}
