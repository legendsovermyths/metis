import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MetisNavbar from "@/components/MetisNavbar";
import MetisDrawer from "@/components/MetisDrawer";
import { BookOpen, Upload, X, FileText, Loader2, AlertCircle } from "lucide-react";
import { getAllBooks, type Book as BackendBook } from "@/lib/service";

interface UploadedBook {
  id: string;
  name: string;
  size: string;
  status: "processing" | "ready";
  addedAt: Date;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

const Library = () => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });
  const [uploadedBooks, setUploadedBooks] = useState<UploadedBook[]>([]);
  const [backendBooks, setBackendBooks] = useState<BackendBook[]>([]);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllBooks()
      .then((books) => {
        setBackendBooks(books);
        setBackendLoading(false);
      })
      .catch((err) => {
        setBackendError(err instanceof Error ? err.message : String(err));
        setBackendLoading(false);
      });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const processFile = useCallback((file: File) => {
    const book: UploadedBook = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      size: formatFileSize(file.size),
      status: "processing",
      addedAt: new Date(),
    };

    setUploadedBooks((prev) => [book, ...prev]);

    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      setUploadedBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, status: "ready" as const } : b))
      );
    }, delay);
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach(processFile);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeBook = useCallback((id: string) => {
    setUploadedBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleNavigation = useCallback(
    (label: string) => {
      setDrawerOpen(false);
      if (label === "Library") return;
      if (label === "About Metis") navigate("/about");
      else navigate("/");
    },
    [navigate]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MetisNavbar
        onMenuClick={() => setDrawerOpen(true)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
      <MetisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNavigation}
        activeItem="Library"
      />

      <div className="flex-1 pt-16 px-6 sm:px-12 md:px-20 pb-12 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl font-serif font-semibold text-foreground mb-1">
              Library
            </h1>
            <p className="text-sm font-sans text-muted-foreground">
              Upload books and documents to learn from
            </p>
          </div>

          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              group relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
              ${
                isDragging
                  ? "border-accent bg-accent/5 scale-[1.01]"
                  : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50"
              }
              p-10 flex flex-col items-center justify-center text-center
            `}
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Upload
                size={18}
                strokeWidth={1.5}
                className="text-muted-foreground group-hover:text-foreground transition-colors"
              />
            </div>
            <p className="text-sm font-sans text-foreground mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-xs font-sans text-muted-foreground">
              PDF, EPUB, TXT — up to 20 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.epub,.txt,.doc,.docx"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Books from backend */}
          {backendLoading && (
            <div className="mt-10 flex items-center gap-2 text-muted-foreground animate-fade-in">
              <Loader2 size={16} className="animate-spin" />
              <p className="text-sm font-sans">Loading your books…</p>
            </div>
          )}

          {backendError && (
            <div className="mt-10 flex items-center gap-2 text-destructive animate-fade-in">
              <AlertCircle size={16} />
              <p className="text-sm font-sans">Failed to load books: {backendError}</p>
            </div>
          )}

          {!backendLoading && !backendError && backendBooks.length > 0 && (
            <div className="mt-10 space-y-2">
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-3">
                {backendBooks.length} {backendBooks.length === 1 ? "book" : "books"} in library
              </p>
              {backendBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border/50 animate-fade-in"
                >
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-foreground truncate">
                      {book.title}
                    </p>
                    <p className="text-xs font-sans text-muted-foreground">
                      {book.table_of_content.length}{" "}
                      {book.table_of_content.length === 1 ? "chapter" : "chapters"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded book list */}
          {uploadedBooks.length > 0 && (
            <div className="mt-10 space-y-2">
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-wider mb-3">
                {uploadedBooks.length} recently uploaded
              </p>
              {uploadedBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border/50 animate-fade-in"
                >
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                    {book.status === "processing" ? (
                      <Loader2 size={14} className="text-muted-foreground animate-spin" />
                    ) : (
                      <FileText size={14} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans text-foreground truncate">
                      {book.name}
                    </p>
                    <p className="text-xs font-sans text-muted-foreground">
                      {book.status === "processing" ? (
                        <span className="text-accent">Processing…</span>
                      ) : (
                        book.size
                      )}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBook(book.id);
                    }}
                    className="p-1 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!backendLoading && backendBooks.length === 0 && uploadedBooks.length === 0 && (
            <div className="mt-20 text-center animate-fade-in">
              <BookOpen size={32} strokeWidth={1} className="mx-auto text-border mb-3" />
              <p className="text-sm font-sans text-muted-foreground">
                Your library is empty
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
