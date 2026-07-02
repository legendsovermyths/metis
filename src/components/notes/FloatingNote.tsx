import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Maximize2, X } from "lucide-react";
import { useNotebook } from "@/context/NotebookContext";
import { anchorLabel } from "@/context/NoteAnchorContext";
import { NoteEditor } from "./NoteEditor";
import { Backlinks } from "./Backlinks";

export function FloatingNote() {
  const { slipNoteId, slipFocusBlockId, notes, update, closeSlip, requestOpen } = useNotebook();
  const navigate = useNavigate();
  const note = notes.find((n) => n.id === slipNoteId) ?? null;
  const bodyRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const titleRef = useRef("");
  const contentRef = useRef("");
  const timer = useRef<number>();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      titleRef.current = note.title;
      contentRef.current = note.content;
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slipNoteId]);

  // Jump to and flash a block-level mention target once the editor has mounted.
  useEffect(() => {
    if (!slipFocusBlockId) return;
    const id = window.setTimeout(() => {
      const el = bodyRef.current?.querySelector(`[data-block-id="${slipFocusBlockId}"]`);
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        el.classList.add("rb-flash");
        window.setTimeout(() => el.classList.remove("rb-flash"), 1400);
      }
    }, 120);
    return () => window.clearTimeout(id);
  }, [slipNoteId, slipFocusBlockId]);

  if (!note || slipNoteId == null) return null;

  function schedule() {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (slipNoteId != null) void update(slipNoteId, titleRef.current || "Untitled", contentRef.current);
    }, 500);
  }
  function flush() {
    window.clearTimeout(timer.current);
    if (slipNoteId != null) void update(slipNoteId, titleRef.current || "Untitled", contentRef.current);
  }
  function onClose() {
    flush();
    closeSlip();
  }
  function onExpand() {
    flush();
    if (slipNoteId != null) requestOpen(slipNoteId);
    closeSlip();
    navigate("/notebook");
  }

  // Drag the slip by its head; it floats wherever you leave it (clamped on-screen).
  function onHeadPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, input")) return;
    const slipEl = (e.currentTarget as HTMLElement).closest(".slip") as HTMLElement | null;
    if (!slipEl) return;
    const rect = slipEl.getBoundingClientRect();
    const offX = e.clientX - rect.left;
    const offY = e.clientY - rect.top;
    document.body.style.userSelect = "none";
    const onMove = (ev: PointerEvent) => {
      const x = Math.min(Math.max(ev.clientX - offX, 8), window.innerWidth - rect.width - 8);
      const y = Math.min(Math.max(ev.clientY - offY, 8), window.innerHeight - 48);
      setPos({ x, y });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      className={"slip animate-blur-in" + (pos ? " is-floating" : "")}
      style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
    >
      <div className="slip-head" onPointerDown={onHeadPointerDown}>
        <span className="label-whisper text-text-tertiary">{anchorLabel(note.anchor)}</span>
        <div className="slip-actions">
          <button onClick={onExpand} title="Open in the notebook" aria-label="Open in notebook">
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
          <button onClick={onClose} title="Close" aria-label="Close">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <input
        ref={titleInputRef}
        value={title}
        placeholder="Untitled"
        onChange={(e) => {
          setTitle(e.target.value);
          titleRef.current = e.target.value;
          schedule();
        }}
        className="slip-title"
      />
      <div className="slip-body" ref={bodyRef}>
        <NoteEditor
          noteId={note.id!}
          initialContent={note.content}
          onChange={(c) => {
            contentRef.current = c;
            schedule();
          }}
        />
        <Backlinks noteId={note.id!} />
      </div>
    </div>
  );
}
