import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { analyseBook, getAllBooks, type BackendBook } from "@/lib/service";
import { useTasks } from "@/context/TasksContext";

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

function filenameFromPath(path: string): string {
  return path.split(/[/\\]/).pop() ?? path;
}

export function BookUploadProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BackendBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const { byType, onTaskDone } = useTasks();

  const fetchBooks = useCallback((silent = false) => {
    if (!silent) setBooksLoading(true);
    setBooksError(null);
    return getAllBooks()
      .then(setBooks)
      .catch((e: unknown) => setBooksError(e instanceof Error ? e.message : String(e)))
      .finally(() => setBooksLoading(false));
  }, []);

  useEffect(() => {
    fetchBooks(false);
  }, [fetchBooks]);

  // Refresh book list whenever any task completes — cheap, and the only task
  // that affects books is analyse_book.
  useEffect(() => {
    return onTaskDone(() => {
      fetchBooks(true);
    });
  }, [onTaskDone, fetchBooks]);

  const pickAndUpload = useCallback(async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (!selected) return;
    const path = selected as string;
    try {
      await analyseBook(path);
    } catch (err) {
      console.error("[upload] failed to spawn task:", err);
    }
  }, []);

  const pendingUploads = useMemo<PendingUpload[]>(() => {
    return byType("analyse_book").map((task) => {
      const path = typeof task.params.path === "string" ? task.params.path : "";
      return { tempId: task.id, filename: filenameFromPath(path) };
    });
  }, [byType]);

  return (
    <UploadContext.Provider
      value={{ books, booksLoading, booksError, pendingUploads, pickAndUpload }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useBookUploads() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useBookUploads must be used within BookUploadProvider");
  return ctx;
}
