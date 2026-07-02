import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { useNotebook } from "@/context/NotebookContext";
import { excerpt } from "./noteText";
import type { Note } from "@/lib/service";

interface ContentNotesProps {
  /** Which notes belong to the content currently on screen. */
  match: (note: Note) => boolean;
}

/** A corner panel surfacing the notes anchored to the content you're viewing. */
export function ContentNotes({ match }: ContentNotesProps) {
  const { notes, showSlip } = useNotebook();
  const [open, setOpen] = useState(false);
  const here = notes.filter(match);

  if (here.length === 0) return null;

  return (
    <div className="content-notes">
      {open && (
        <div className="content-notes-list animate-blur-in">
          <div className="content-notes-head label-whisper">Notes here</div>
          {here.map((n) => (
            <button
              key={n.id}
              className="content-notes-item"
              onClick={() => {
                if (n.id != null) showSlip(n.id);
              }}
            >
              <span className="content-notes-title">{n.title || "Untitled"}</span>
              {excerpt(n.content) && (
                <span className="content-notes-excerpt">{excerpt(n.content)}</span>
              )}
            </button>
          ))}
        </div>
      )}
      <button
        className="content-notes-tab"
        onClick={() => setOpen((o) => !o)}
        title="Notes anchored here"
      >
        <NotebookPen className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span>{here.length}</span>
      </button>
    </div>
  );
}
