import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { SlashMenuList, type SlashMenuRef } from "../SlashMenuList";
import { filterSlashItems, type SlashItem } from "./slashItems";

type RectFn = (() => DOMRect | null) | null | undefined;

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        pluginKey: new PluginKey("slashCommand"),
        char: "/",
        allowSpaces: false,
        startOfLine: false,
        command: ({ editor, range, props }) => props.run(editor, range),
        items: ({ query }) => filterSlashItems(query),
        render: () => {
          let renderer: ReactRenderer<SlashMenuRef> | null = null;
          let popup: HTMLDivElement | null = null;

          const place = (rect: RectFn) => {
            if (!popup || !rect) return;
            const r = rect();
            if (!r) return;
            const menuH = popup.offsetHeight || 0;
            const menuW = popup.offsetWidth || 0;
            const below = r.bottom + 8;
            const flipUp = below + menuH > window.innerHeight - 12;
            popup.style.left = `${Math.min(r.left, window.innerWidth - menuW - 12)}px`;
            popup.style.top = flipUp ? `${Math.max(12, r.top - menuH - 8)}px` : `${below}px`;
          };

          return {
            onStart: (props) => {
              renderer = new ReactRenderer(SlashMenuList, { props, editor: props.editor });
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
