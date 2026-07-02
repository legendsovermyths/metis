import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useNotebook } from "@/context/NotebookContext";

export function MentionChip({ node }: NodeViewProps) {
  const { showSlip, notes } = useNotebook();
  const noteId = node.attrs.noteId as number | null;
  const blockId = (node.attrs.blockId as string | null) ?? null;
  const stored = (node.attrs.label as string) ?? "";
  // For note-level mentions, prefer the live title so renames propagate.
  const live = notes.find((n) => n.id === noteId)?.title;
  const label = blockId ? stored || "block" : (live && live.trim()) || stored || "note";

  return (
    <NodeViewWrapper
      as="span"
      className={"mention" + (blockId ? " is-block" : "")}
      onClick={() => {
        if (noteId != null) showSlip(noteId, blockId ?? undefined);
      }}
    >
      @{label}
    </NodeViewWrapper>
  );
}
