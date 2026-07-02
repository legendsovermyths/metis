import { Extension, type Editor } from "@tiptap/core";

const MAX_DEPTH = 5;

interface ParaInfo {
  node: import("@tiptap/pm/model").Node;
  pos: number;
  parentName: string | null;
}

function inMath(editor: Editor): boolean {
  return editor.isActive("mathInline") || editor.isActive("mathBlock");
}

function paragraphInfo(editor: Editor): ParaInfo | null {
  const { $from } = editor.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "paragraph") {
      return {
        node: $from.node(d),
        pos: $from.before(d),
        parentName: $from.node(d - 1)?.type.name ?? null,
      };
    }
  }
  return null;
}

function setSpine(editor: Editor, info: ParaInfo, value: number): boolean {
  const v = Math.max(0, Math.min(MAX_DEPTH, value));
  if (v === (info.node.attrs.spine || 0)) return false;
  return editor
    .chain()
    .command(({ tr }) => {
      tr.setNodeMarkup(info.pos, undefined, { ...info.node.attrs, spine: v });
      return true;
    })
    .run();
}

export const Spine = Extension.create({
  name: "spine",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          spine: {
            default: 0,
            keepOnSplit: true,
            parseHTML: (el) => Number(el.getAttribute("data-spine")) || 0,
            renderHTML: (attrs) => (attrs.spine ? { "data-spine": String(attrs.spine) } : {}),
          },
        },
      },
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (document.querySelector(".slash-popup") || document.querySelector(".math-suggest-popup")) return false;
        if (inMath(editor)) return false;
        const info = paragraphInfo(editor);
        if (!info || info.parentName === "listItem") return false;
        const cur = info.node.attrs.spine || 0;
        if (cur >= MAX_DEPTH) return true;
        setSpine(editor, info, cur + 1);
        return true;
      },
      "Shift-Tab": ({ editor }) => {
        if (inMath(editor)) return false;
        const info = paragraphInfo(editor);
        if (!info || info.parentName === "listItem") return false;
        const cur = info.node.attrs.spine || 0;
        if (cur <= 0) return false;
        setSpine(editor, info, cur - 1);
        return true;
      },
      // Enter on an empty indented line steps back out of the derivation.
      Enter: ({ editor }) => {
        if (inMath(editor) || document.querySelector(".math-suggest-popup")) return false;
        if (!editor.state.selection.empty) return false;
        const info = paragraphInfo(editor);
        if (!info) return false;
        const cur = info.node.attrs.spine || 0;
        if (cur > 0 && info.node.content.size === 0) {
          setSpine(editor, info, cur - 1);
          return true;
        }
        return false;
      },
    };
  },
});
