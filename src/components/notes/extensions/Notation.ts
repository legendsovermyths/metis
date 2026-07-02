import { Extension, textInputRule } from "@tiptap/core";

/**
 * Deterministic notation transforms — one correct reading, so they fire on type
 * (undo with ⌘Z to keep the literal). Ambiguous transforms live in the
 * suggestion stream (Phase 2). Longer patterns first so `<->` beats `->`.
 */
export const Notation = Extension.create({
  name: "notation",

  addInputRules() {
    return [
      textInputRule({ find: /<=>$/, replace: "⇔" }),
      textInputRule({ find: /<->$/, replace: "↔" }),
      textInputRule({ find: /=>$/, replace: "⇒" }),
      textInputRule({ find: /->$/, replace: "→" }),
    ];
  },
});
