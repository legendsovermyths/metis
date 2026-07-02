import { Node, mergeAttributes } from "@tiptap/core";
import { liftTarget } from "@tiptap/pm/transform";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ReasoningBlockView } from "../ReasoningBlockView";
import { genId } from "../genId";
import type { ReasoningKind } from "../blocks";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    reasoningBlock: {
      /** Wrap the selection in a reasoning block of the given kind. */
      setReasoningBlock: (kind: ReasoningKind) => ReturnType;
      /** Change the kind of the reasoning block at the selection. */
      setReasoningKind: (kind: ReasoningKind) => ReturnType;
      /** Toggle a doubt block between open and resolved. */
      toggleDoubtResolved: () => ReturnType;
    };
  }
}

export const ReasoningBlock = Node.create({
  name: "reasoningBlock",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: "r",
        parseHTML: (el) => el.getAttribute("data-kind") || "r",
        renderHTML: (attrs) => ({ "data-kind": attrs.kind }),
      },
      state: {
        default: "open",
        parseHTML: (el) => el.getAttribute("data-state") || "open",
        renderHTML: (attrs) => ({ "data-state": attrs.state }),
      },
      blockId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-block-id"),
        renderHTML: (attrs) => (attrs.blockId ? { "data-block-id": attrs.blockId } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-reasoning-block]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-reasoning-block": "" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ReasoningBlockView);
  },

  addCommands() {
    return {
      setReasoningBlock:
        (kind) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { kind, blockId: genId() }),
      setReasoningKind:
        (kind) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { kind }),
      toggleDoubtResolved:
        () =>
        ({ editor, commands }) => {
          const current = editor.getAttributes(this.name).state;
          return commands.updateAttributes(this.name, {
            state: current === "resolved" ? "open" : "resolved",
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Backspace at the very start of a block's first line unwraps it to plain
      // paragraphs. Anywhere else inside the block, fall through to the default.
      Backspace: ({ editor }) => {
        const { empty, $from } = editor.state.selection;
        if (!empty || $from.parentOffset !== 0) return false;
        const bd = $from.depth - 1;
        if (bd < 0) return false;
        const block = $from.node(bd);
        if (block.type.name !== this.name) return false;
        if ($from.index(bd) !== 0) return false;
        return editor.commands.command(({ state, tr, dispatch }) => {
          const range = state.doc
            .resolve($from.start(bd))
            .blockRange(state.doc.resolve($from.end(bd)));
          if (!range) return false;
          const target = liftTarget(range);
          if (target == null) return false;
          if (dispatch) dispatch(tr.lift(range, target).scrollIntoView());
          return true;
        });
      },
    };
  },
});
