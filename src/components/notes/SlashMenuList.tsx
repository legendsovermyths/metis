import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { SlashItem } from "./extensions/slashItems";

interface SlashMenuListProps {
  items: SlashItem[];
  command: (item: SlashItem) => void;
}

export interface SlashMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashMenuList = forwardRef<SlashMenuRef, SlashMenuListProps>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);
    const activeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => setSelected(0), [items]);
    useEffect(() => {
      activeRef.current?.scrollIntoView({ block: "nearest" });
    }, [selected]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (!items.length) return false;
        if (event.key === "ArrowUp") {
          setSelected((s) => (s + items.length - 1) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelected((s) => (s + 1) % items.length);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          if (items[selected]) command(items[selected]);
          return true;
        }
        return false;
      },
    }));

    if (!items.length) {
      return (
        <div className="slash-menu">
          <div className="slash-empty font-display italic">Nothing matches</div>
        </div>
      );
    }

    const sections: { name: string; entries: { item: SlashItem; index: number }[] }[] = [];
    items.forEach((item, index) => {
      let sec = sections.find((s) => s.name === item.section);
      if (!sec) {
        sec = { name: item.section, entries: [] };
        sections.push(sec);
      }
      sec.entries.push({ item, index });
    });

    return (
      <div className="slash-menu">
        {sections.map((sec) => (
          <div key={sec.name} className="slash-section">
            <div className="slash-section-label label-whisper">{sec.name}</div>
            {sec.entries.map(({ item, index }) => (
              <button
                key={item.title}
                ref={index === selected ? activeRef : undefined}
                type="button"
                className={"slash-item" + (index === selected ? " is-active" : "")}
                onMouseEnter={() => setSelected(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  command(item);
                }}
              >
                <span className="slash-item-title">{item.title}</span>
                <span className="slash-item-hint">{item.hint}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  },
);

SlashMenuList.displayName = "SlashMenuList";
