import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { analyseBook, getAllBooks, type BackendBook } from "@/lib/service";

export interface PendingUpload {
  tempId: string;
  filename: string;
}

interface UploadContextValue {
  books: BackendBook[];
  booksLoading: boolean;
  booksError: string | null;
  pendingUploads: PendingUpload[];
  pickAndUpload: () => Promise<void>;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function BookUploadProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BackendBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const nextId = useRef(0);

  const fetchBooks = useCallback((silent = false) => {
    if (!silent) setBooksLoading(true);
    setBooksError(null);
    return getAllBooks()
      .then(setBooks)
      .catch((e: unknown) => setBooksError(e instanceof Error ? e.message : String(e)))
      .finally(() => setBooksLoading(false));
  }, []);

  // Fetch once on mount
  useEffect(() => { fetchBooks(false); }, [fetchBooks]);

  const pickAndUpload = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (!selected) return;

    const path = selected as string;
    const filename = path.split(/[/\\]/).pop() ?? path;
    const tempId = `upload-${nextId.current++}`;

    setPendingUploads((prev) => [...prev, { tempId, filename }]);

    analyseBook(path)
      .then(() => fetchBooks(true))
      .catch((err: unknown) => console.error("[upload] failed:", err))
      .finally(() => setPendingUploads((prev) => prev.filter((u) => u.tempId !== tempId)));
  }, [fetchBooks]);

  return (
    <UploadContext.Provider value={{ books, booksLoading, booksError, pendingUploads, pickAndUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useBookUploads() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useBookUploads must be used within BookUploadProvider");
  return ctx;
}
