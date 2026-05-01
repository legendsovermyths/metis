import { useState, useMemo } from "react";
import { Upload, Search, Loader2 } from "lucide-react";
import type { Book } from "@/data/mockData";
import { useBookUploads } from "@/context/UploadContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COVER_GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈"] as const;

function backendBookToDisplay(b: { id: number; title: string; table_of_content: { title: string }[] }): Book {
  const chapters = b.table_of_content.length;
  return {
    id: String(b.id),
    title: b.title,
    author: "Your library",
    cover: COVER_GLYPHS[Math.abs(b.id) % COVER_GLYPHS.length],
    subject: `${chapters} ${chapters === 1 ? "chapter" : "chapters"}`,
  };
}

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const { books: rawBooks, booksLoading, booksError, pendingUploads, pickAndUpload } = useBookUploads();

  const books = useMemo(() => rawBooks.map(backendBookToDisplay), [rawBooks]);

  const filtered = useMemo(
    () =>
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          b.subject.toLowerCase().includes(search.toLowerCase())
      ),
    [books, search]
  );

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl italic tracking-tight text-foreground">Library</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Your collection of books and references</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in [animation-delay:100ms] opacity-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground shadow-soft placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/20 transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border bg-background p-0.5">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Grid
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                List
              </button>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl shadow-soft" onClick={pickAndUpload}>
              <Upload className="mr-2 h-3.5 w-3.5" />
              Upload
            </Button>
          </div>
        </div>

        {booksError && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Could not load books: {booksError}
          </div>
        )}

        {booksLoading && pendingUploads.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin opacity-40" />
            <span className="text-sm">Loading your library…</span>
          </div>
        )}

        {/* Books grid/list */}
        {(!booksLoading || pendingUploads.length > 0 || books.length > 0) && (
          <div
            className={cn(
              "animate-fade-in-up opacity-0 [animation-delay:200ms]",
              view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "flex flex-col gap-2"
            )}
          >
            {/* Pending upload skeletons */}
            {pendingUploads.map((u) =>
              view === "grid" ? (
                <div key={u.tempId} className="rounded-xl bg-card p-5 border border-border/60">
                  <div className="mb-4 flex h-24 items-center justify-center rounded-lg bg-surface">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                  <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-surface" />
                  <div className="mt-2 h-2.5 w-1/2 animate-pulse rounded-full bg-surface" />
                  <div className="mt-3 h-5 w-16 animate-pulse rounded-full bg-surface" />
                </div>
              ) : (
                <div key={u.tempId} className="flex items-center gap-4 rounded-xl bg-card p-4 border border-border/60">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-surface" />
                    <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-surface" />
                  </div>
                </div>
              )
            )}

            {filtered.map((book) =>
              view === "grid" ? (
                <div
                  key={book.id}
                  className="group cursor-pointer rounded-xl bg-card p-5 transition-all duration-200 hover:bg-surface border border-border/60 hover:border-border"
                >
                  <div
                    className="mb-4 flex h-24 items-center justify-center rounded-lg font-display text-4xl italic"
                    style={{ backgroundColor: "hsl(var(--amber-soft))", color: "hsl(var(--amber))" }}
                  >
                    {book.cover}
                  </div>
                  <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">{book.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{book.author}</p>
                  <span className="mt-2 inline-block rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                    {book.subject}
                  </span>
                </div>
              ) : (
                <div
                  key={book.id}
                  className="group flex cursor-pointer items-center gap-4 rounded-xl bg-card p-4 transition-all duration-200 hover:bg-surface border border-border/60 hover:border-border"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-display text-2xl italic"
                    style={{ backgroundColor: "hsl(var(--amber-soft))", color: "hsl(var(--amber))" }}
                  >
                    {book.cover}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-foreground truncate">{book.title}</h3>
                    <p className="text-xs text-muted-foreground">{book.author}</p>
                  </div>
                  <span className="hidden rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium text-text-secondary sm:inline-block">
                    {book.subject}
                  </span>
                </div>
              )
            )}
          </div>
        )}

        {!booksLoading && !booksError && filtered.length === 0 && pendingUploads.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center animate-fade-in">
            <span className="font-display text-8xl italic text-muted-foreground/20 select-none leading-none mb-6">∑</span>
            <p className="text-sm text-muted-foreground">
              {books.length === 0
                ? "Your library is empty — upload a PDF to get started"
                : "No books match your search"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
