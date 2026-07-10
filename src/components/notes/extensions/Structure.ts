import { Node, mergeAttributes } from "@tiptap/core";
import { NodeSelection, Plugin, PluginKey, type EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PMNode } from "@tiptap/pm/model";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { StructureNode } from "../StructureNode";
import { genId } from "../genId";
import { defaultData, type StructureKind } from "../structures/types";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    structure: {
      setStructure: (kind: StructureKind) => ReturnType;
      /** Spawn the next version of the structure at `pos` (or the selected one), freezing the source. */
      transformStructure: (pos?: number) => ReturnType;
    };
  }
}

/** ids that some other node points back to via `from` — these are frozen sources. */
function frozenIds(doc: PMNode, typeName: string): Set<string> {
  const set = new Set<string>();
  doc.descendants((n) => {
    if (n.type.name === typeName && n.attrs.from) set.add(n.attrs.from as string);
  });
  return set;
}

/** A structure node is locked while a successor still points to it. */
function isLocked(state: EditorState, typeName: string, node: PMNode): boolean {
  return !!node.attrs.id && frozenIds(state.doc, typeName).has(node.attrs.id as string);
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
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-id"),
        renderHTML: (attrs) => (attrs.id ? { "data-id": attrs.id } : {}),
      },
      from: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-from"),
        renderHTML: (attrs) => (attrs.from ? { "data-from": attrs.from } : {}),
      },
      op: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-op") || "",
        renderHTML: (attrs) => (attrs.op ? { "data-op": attrs.op } : {}),
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

  addProseMirrorPlugins() {
    const typeName = this.name;
    return [
      new Plugin({
        key: new PluginKey("structureLock"),
        props: {
          decorations(state) {
            const frozen = frozenIds(state.doc, typeName);
            if (!frozen.size) return null;
            const decos: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name === typeName && node.attrs.id && frozen.has(node.attrs.id as string)) {
                decos.push(
                  Decoration.node(pos, pos + node.nodeSize, { class: "is-source-locked" }, { locked: true }),
                );
              }
            });
            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setStructure:
        (kind) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: { kind, data: JSON.stringify(defaultData(kind)), id: genId() },
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

      transformStructure:
        (pos) =>
        ({ state, chain }) => {
          let at = pos;
          if (at == null) {
            const { selection } = state;
            if (selection instanceof NodeSelection && selection.node.type === this.type) at = selection.from;
          }
          if (at == null) return false;
          const node = state.doc.nodeAt(at);
          if (!node || node.type !== this.type) return false;
          // Only the tip of a chain may transform; a frozen source already has a successor.
          if (isLocked(state, this.name, node)) return false;

          const sourceId = (node.attrs.id as string) ?? genId();
          const after = at + node.nodeSize;
          return chain()
            .command(({ tr }) => {
              if (!node.attrs.id) tr.setNodeMarkup(at!, undefined, { ...node.attrs, id: sourceId });
              return true;
            })
            .insertContentAt(after, {
              type: this.name,
              attrs: { ...node.attrs, id: genId(), from: sourceId, op: "" },
            })
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                try {
                  tr.setSelection(NodeSelection.create(tr.doc, after));
                } catch {
                  /* leave selection as-is */
                }
              }
              return true;
            })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    const selectedStructure = (editor: { state: EditorState }): PMNode | null => {
      const { selection } = editor.state;
      if (selection instanceof NodeSelection && selection.node.type === this.type) return selection.node;
      return null;
    };

    return {
      // Enter steps into the selected structure — unless it's a frozen source.
      Enter: ({ editor }) => {
        const node = selectedStructure(editor);
        if (!node) return false;
        if (isLocked(editor.state, this.name, node)) return true;
        requestAnimationFrame(() => {
          const el = document.querySelector<HTMLElement>(
            ".ProseMirror-selectednode .structure-focus",
          );
          el?.focus();
        });
        return true;
      },
      // "t" spawns the next version — only when a structure node itself is selected.
      t: ({ editor }) => {
        const node = selectedStructure(editor);
        if (!node) return false;
        return editor.commands.transformStructure();
      },
      // A frozen source can't be deleted while its successor lives — unwind from the tip.
      Backspace: ({ editor }) => {
        const node = selectedStructure(editor);
        return !!node && isLocked(editor.state, this.name, node);
      },
      Delete: ({ editor }) => {
        const node = selectedStructure(editor);
        return !!node && isLocked(editor.state, this.name, node);
      },
    };
  },
});
