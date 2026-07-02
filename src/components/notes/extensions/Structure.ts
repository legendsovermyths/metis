import { Node, mergeAttributes } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { StructureNode } from "../StructureNode";
import { defaultData, type StructureKind } from "../structures/types";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    structure: {
      setStructure: (kind: StructureKind) => ReturnType;
    };
  }
}

export const Structure = Node.create({
  name: "structure",
  group: "block",
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      kind: {
        default: "array",
        parseHTML: (el) => el.getAttribute("data-kind") || "array",
        renderHTML: (attrs) => ({ "data-kind": attrs.kind }),
      },
      data: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-structure") || "",
        renderHTML: (attrs) => ({ "data-structure": attrs.data }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-structure-node]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-structure-node": "" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StructureNode);
  },

  addCommands() {
    return {
      setStructure:
        (kind) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: { kind, data: JSON.stringify(defaultData(kind)) },
            })
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                const pos = tr.selection.from - 1;
                if (pos >= 0) {
                  try {
                    tr.setSelection(NodeSelection.create(tr.doc, pos));
                  } catch {
                    /* leave selection as-is */
                  }
                }
              }
              return true;
            })
            .run(),
    };
  },

  addKeyboardShortcuts() {
    return {
      // Enter steps into the selected structure's sub-editor.
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        if (selection instanceof NodeSelection && selection.node.type === this.type) {
          requestAnimationFrame(() => {
            const el = document.querySelector<HTMLElement>(
              ".ProseMirror-selectednode .structure-focus",
            );
            el?.focus();
          });
          return true;
        }
        return false;
      },
    };
  },
});
