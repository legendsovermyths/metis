import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { MentionTarget } from "./mentionRegistry";

interface MentionListProps {
  items: MentionTarget[];
  command: (item: MentionTarget) => void;
}

export interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const MentionList = forwardRef<MentionListRef, MentionListProps>(({ items, command }, ref) => {
  const [selected, setSelected] = useState(0);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setSelected(0), [items]);
  useEffect(() => activeRef.current?.scrollIntoView({ block: "nearest" }), [selected]);

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

  return (
    <div className="slash-menu">
      {items.length === 0 ? (
        <div className="slash-empty font-display italic">No notes to link</div>
      ) : (
        items.map((item, index) => (
          <button
            key={item.id}
            ref={index === selected ? activeRef : undefined}
            type="button"
            className={"mention-item" + (index === selected ? " is-active" : "")}
            onMouseEnter={() => setSelected(index)}
            onMouseDown={(e) => {
              e.preventDefault();
              command(item);
            }}
          >
            <span className="mention-item-at">@</span>
            {item.label || "Untitled"}
          </button>
        ))
      )}
    </div>
  );
});

MentionList.displayName = "MentionList";
