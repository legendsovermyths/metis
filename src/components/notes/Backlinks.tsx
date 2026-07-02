import { useNotebook } from "@/context/NotebookContext";
import { mentionsOf } from "./noteText";

/** Notes that @-mention this one. */
export function Backlinks({ noteId }: { noteId: number }) {
  const { notes, showSlip } = useNotebook();
  const refs = notes.filter((n) => n.id !== noteId && n.id != null && mentionsOf(n.content).includes(noteId));

  if (refs.length === 0) return null;

  return (
    <div className="backlinks">
      <div className="backlinks-head label-whisper">Referenced by</div>
      {refs.map((n) => (
        <button key={n.id} className="backlinks-item" onClick={() => showSlip(n.id!)}>
          {n.title || "Untitled"}
        </button>
      ))}
    </div>
  );
}
