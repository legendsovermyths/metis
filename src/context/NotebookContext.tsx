import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createNote,
  deleteNote,
  getAllNotes,
  moveNote,
  updateNote,
  type Note,
  type NoteAnchor,
} from "@/lib/service";

interface NotebookContextValue {
  notes: Note[];
  notesLoading: boolean;
  notesError: string | null;
  refresh: (silent?: boolean) => Promise<void>;
  create: (
    title: string,
    content: string,
    anchor?: NoteAnchor | null,
    folderId?: number | null,
  ) => Promise<number>;
  update: (id: number, title: string, content: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  move: (id: number, folderId: number | null) => Promise<void>;
  /** The floating slip currently open, if any. */
  slipNoteId: number | null;
  slipFocusBlockId: string | null;
  openSlip: (anchor: NoteAnchor | null) => Promise<void>;
  showSlip: (id: number, blockId?: string) => void;
  closeSlip: () => void;
  /** A note the Notebook page should open when it mounts/next renders. */
  focusNoteId: number | null;
  requestOpen: (id: number) => void;
  clearFocus: () => void;
}

const NotebookContext = createContext<NotebookContextValue | null>(null);

export function NotebookProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [slipNoteId, setSlipNoteId] = useState<number | null>(null);
  const [slipFocusBlockId, setSlipFocusBlockId] = useState<string | null>(null);
  const [focusNoteId, setFocusNoteId] = useState<number | null>(null);

  const refresh = useCallback((silent = false) => {
    if (!silent) setNotesLoading(true);
    setNotesError(null);
    return getAllNotes()
      .then(setNotes)
      .catch((e: unknown) => setNotesError(e instanceof Error ? e.message : String(e)))
      .finally(() => setNotesLoading(false));
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const create = useCallback(
    async (
      title: string,
      content: string,
      anchor: NoteAnchor | null = null,
      folderId: number | null = null,
    ) => {
      const id = await createNote(title, content, anchor, folderId);
      await refresh(true);
      return id;
    },
    [refresh],
  );

  const move = useCallback(
    async (id: number, folderId: number | null) => {
      await moveNote(id, folderId);
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, folder_id: folderId } : n)));
    },
    [],
  );

  const update = useCallback(async (id: number, title: string, content: string) => {
    await updateNote(id, title, content);
    const now = Math.floor(Date.now() / 1000);
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, content, updated_at: now } : n)),
    );
  }, []);

  const remove = useCallback(
    async (id: number) => {
      await deleteNote(id);
      await refresh(true);
    },
    [refresh],
  );

  const openSlip = useCallback(
    async (anchor: NoteAnchor | null) => {
      const id = await create("", "", anchor);
      setSlipNoteId(id);
    },
    [create],
  );
  const showSlip = useCallback((id: number, blockId?: string) => {
    setSlipNoteId(id);
    setSlipFocusBlockId(blockId ?? null);
  }, []);
  const closeSlip = useCallback(() => {
    setSlipNoteId(null);
    setSlipFocusBlockId(null);
  }, []);

  const requestOpen = useCallback((id: number) => setFocusNoteId(id), []);
  const clearFocus = useCallback(() => setFocusNoteId(null), []);

  return (
    <NotebookContext.Provider
      value={{
        notes,
        notesLoading,
        notesError,
        refresh,
        create,
        update,
        remove,
        move,
        slipNoteId,
        slipFocusBlockId,
        openSlip,
        showSlip,
        closeSlip,
        focusNoteId,
        requestOpen,
        clearFocus,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebook() {
  const ctx = useContext(NotebookContext);
  if (!ctx) throw new Error("useNotebook must be used within NotebookProvider");
  return ctx;
}
