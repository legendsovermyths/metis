import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MathNode } from "../MathNode";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathNodes: {
      setInlineMath: () => ReturnType;
      setBlockMath: () => ReturnType;
    };
  }
}

function mathInputPlugin(type: import("@tiptap/pm/model").NodeType) {
  return new Plugin({
    props: {
      handleTextInput(view, from, to, text) {
        if (text !== "$") return false;
        const { $from } = view.state.selection;
        if ($from.parent.type.spec.code) return false;
        if (!$from.parent.canReplaceWith($from.index(), $from.index(), type)) return false;
        view.dispatch(view.state.tr.replaceRangeWith(from, to, type.create({ src: "" })));
        return true;
      },
    },
  });
}

const srcAttr = {
  src: {
    default: "",
    parseHTML: (el: HTMLElement) => el.getAttribute("data-src") || "",
    renderHTML: (attrs: { src: string }) => ({ "data-src": attrs.src }),
  },
};

export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes: () => srcAttr,
  parseHTML() {
    return [{ tag: "span[data-math-inline]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-math-inline": "" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MathNode);
  },
  addCommands() {
    return {
      setInlineMath:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src: "" } }),
    };
  },
  addProseMirrorPlugins() {
    return [mathInputPlugin(this.type)];
  },
});

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes: () => srcAttr,
  parseHTML() {
    return [{ tag: "div[data-math-block]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-math-block": "" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MathNode);
  },
  addCommands() {
    return {
      setBlockMath:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { src: "" } }),
    };
  },
});
