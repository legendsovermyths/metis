import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { REASONING_KIND_MAP, type ReasoningKind } from "./blocks";

export function ReasoningBlockView({ node, updateAttributes, editor }: NodeViewProps) {
  const kind = (node.attrs.kind as ReasoningKind) ?? "r";
  const meta = REASONING_KIND_MAP[kind] ?? REASONING_KIND_MAP.r;
  const state = (node.attrs.state as string) ?? "open";
  const isDoubt = kind === "dt";
  const resolved = isDoubt && state === "resolved";

  return (
    <NodeViewWrapper className="rb" data-kind={kind} data-state={state} data-block-id={node.attrs.blockId ?? undefined}>
      <div className="rb-gutter" contentEditable={false}>
        {kind === "nt" && <span className="rb-star" aria-hidden>★</span>}
        {isDoubt && editor.isEditable ? (
          <button
            type="button"
            className="rb-tag label-whisper rb-tag-button"
            title={resolved ? "Mark as open" : "Mark as resolved"}
            onClick={() =>
              updateAttributes({ state: resolved ? "open" : "resolved" })
            }
          >
            {resolved && <span className="rb-check" aria-hidden>✓</span>}
            {meta.label}
          </button>
        ) : (
          <span className="rb-tag label-whisper">
            {resolved && <span className="rb-check" aria-hidden>✓</span>}
            {meta.label}
          </span>
        )}
      </div>
      <NodeViewContent className="rb-body" />
    </NodeViewWrapper>
  );
}
