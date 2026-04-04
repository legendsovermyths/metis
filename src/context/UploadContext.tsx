import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { analyseBook, type BackendBook } from "@/lib/service";

export interface PendingUpload {
  tempId: string;
  filename: string;
}

interface UploadContextValue {
  pendingUploads: PendingUpload[];
  /** Increments each time a book finishes uploading — LibraryPage watches this to re-fetch. */
  booksVersion: number;
  /** Opens the file picker and starts the upload in the background. */
  pickAndUpload: () => Promise<void>;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function BookUploadProvider({ children }: { children: React.ReactNode }) {
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [booksVersion, setBooksVersion] = useState(0);
  const nextId = useRef(0);

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
      .then((_book: BackendBook) => {
        setBooksVersion((v) => v + 1);
      })
      .catch((err: unknown) => {
        console.error("[upload] failed:", err);
      })
      .finally(() => {
        setPendingUploads((prev) => prev.filter((u) => u.tempId !== tempId));
      });
  }, []);

  return (
    <UploadContext.Provider value={{ pendingUploads, booksVersion, pickAndUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useBookUploads() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useBookUploads must be used within BookUploadProvider");
  return ctx;
}
