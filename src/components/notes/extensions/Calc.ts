import { InputRule, Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalcNode } from "../CalcNode";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    calc: {
      /** Insert an empty compute cell and drop the cursor into it. */
      setCalc: () => ReturnType;
    };
  }
}

export const Calc = Node.create({
  name: "calc",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      expr: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-expr") || "",
        renderHTML: (attrs) => ({ "data-expr": attrs.expr }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-calc]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-calc": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalcNode);
  },

  addCommands() {
    return {
      setCalc:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { expr: "" } }),
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: />>>$/,
        handler: ({ range, chain }) => {
          chain()
            .deleteRange(range)
            .insertContent({ type: this.name, attrs: { expr: "" } })
            .run();
        },
      }),
    ];
  },
});
