import { Node, mergeAttributes } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";
import { ReactNodeViewRenderer, ReactRenderer } from "@tiptap/react";
import { MentionChip } from "../MentionChip";
import { MentionList, type MentionListRef } from "../MentionList";
import { queryMentionTargets, type MentionTarget } from "../mentionRegistry";

type RectFn = (() => DOMRect | null) | null | undefined;

export const Mention = Node.create({
  name: "mention",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      noteId: {
        default: null,
        parseHTML: (el) => Number(el.getAttribute("data-note-id")) || null,
        renderHTML: (attrs) => (attrs.noteId != null ? { "data-note-id": attrs.noteId } : {}),
      },
      label: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-label") || "",
        renderHTML: (attrs) => ({ "data-label": attrs.label }),
      },
      blockId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-block-id") || null,
        renderHTML: (attrs) => (attrs.blockId ? { "data-block-id": attrs.blockId } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-mention]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-mention": "" }), `@${node.attrs.label ?? ""}`];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MentionChip);
  },

  addProseMirrorPlugins() {
    return [
      Suggestion<MentionTarget>({
        editor: this.editor,
        pluginKey: new PluginKey("mention"),
        char: "@",
        allowSpaces: false,
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent([
              {
                type: this.name,
                attrs: { noteId: props.id, blockId: props.blockId ?? null, label: props.chip },
              },
              { type: "text", text: " " },
            ])
            .run();
        },
        items: ({ query }) => queryMentionTargets(query),
        render: () => {
          let renderer: ReactRenderer<MentionListRef> | null = null;
          let popup: HTMLDivElement | null = null;
          const place = (rect: RectFn) => {
            if (!popup || !rect) return;
            const r = rect();
            if (!r) return;
            const h = popup.offsetHeight || 0;
            const w = popup.offsetWidth || 0;
            const below = r.bottom + 8;
            const flip = below + h > window.innerHeight - 12;
            popup.style.left = `${Math.min(r.left, window.innerWidth - w - 12)}px`;
            popup.style.top = flip ? `${Math.max(12, r.top - h - 8)}px` : `${below}px`;
          };
          return {
            onStart: (props) => {
              renderer = new ReactRenderer(MentionList, { props, editor: props.editor });
              popup = document.createElement("div");
              popup.className = "slash-popup";
              document.body.appendChild(popup);
              popup.appendChild(renderer.element);
              place(props.clientRect);
            },
            onUpdate: (props) => {
              renderer?.updateProps(props);
              place(props.clientRect);
            },
            onKeyDown: (props) => {
              if (props.event.key === "Escape") return true;
              return renderer?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              popup?.remove();
              popup = null;
              renderer?.destroy();
              renderer = null;
            },
          };
        },
      }),
    ];
  },
});
