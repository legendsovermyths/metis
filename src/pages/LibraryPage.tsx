import { useState, useMemo } from "react";
import { Upload, Search } from "lucide-react";
import type { Book } from "@/data/mockData";
import { useBookUploads } from "@/context/UploadContext";
import { cn } from "@/lib/utils";

const COVER_GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈"] as const;

// Four warm tonal palettes — light/dark variants, cycling per book
const PALETTES = [
  {
    card: "bg-[hsl(35,70%,94%)] dark:bg-[hsl(35,28%,16%)]",
    spine: "hsl(30,55%,40%)",
    glyphColor: "hsl(30,55%,40%)",
  },
  {
    card: "bg-[hsl(155,22%,92%)] dark:bg-[hsl(155,18%,14%)]",
    spine: "hsl(155,30%,35%)",
    glyphColor: "hsl(155,30%,35%)",
  },
  {
    card: "bg-[hsl(350,18%,93%)] dark:bg-[hsl(350,15%,15%)]",
    spine: "hsl(350,32%,42%)",
    glyphColor: "hsl(350,32%,42%)",
  },
  {
    card: "bg-[hsl(215,22%,93%)] dark:bg-[hsl(215,18%,14%)]",
    spine: "hsl(215,30%,42%)",
    glyphColor: "hsl(215,30%,42%)",
  },
] as const;

function backendBookToDisplay(b: {
  id: number;
  title: string;
  table_of_content: { title: string }[];
}): Book {
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
  const { books: rawBooks, booksLoading, booksError, pendingUploads, pickAndUpload } =
    useBookUploads();

  const books = useMemo(() => rawBooks.map(backendBookToDisplay), [rawBooks]);

  const filtered = useMemo(
    () =>
      books.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.subject.toLowerCase().includes(search.toLowerCase())
      ),
    [books, search]
  );

  const totalCount = books.length + pendingUploads.length;
  const isEmpty =
    !booksLoading && !booksError && filtered.length === 0 && pendingUploads.length === 0;

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-10 pb-24 md:pb-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-6 animate-fade-in">
          <div>
            <h1 className="font-display text-4xl italic tracking-tight text-foreground">
              Library
            </h1>
            {totalCount > 0 && (
              <p className="mt-1 font-display text-xs italic text-muted-foreground/50">
                {totalCount} {totalCount === 1 ? "volume" : "volumes"}
              </p>
            )}
          </div>

          {/* Search — underline style, feels editorial not SaaS */}
          <div className="relative flex items-center">
            <Search className="absolute left-0 h-3.5 w-3.5 text-muted-foreground/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search titles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-40 border-b border-border/30 bg-transparent pb-1 pl-5 pr-1",
                "font-display text-sm italic text-foreground placeholder:text-muted-foreground/35",
                "focus:outline-none focus:border-foreground/25 transition-colors"
              )}
            />
          </div>
        </div>

        {booksError && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {booksError}
          </div>
        )}

        {/* Loading */}
        {booksLoading && books.length === 0 && pendingUploads.length === 0 && (
          <div className="flex items-center justify-center gap-1.5 py-24">
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center py-24 text-center animate-fade-in">
            <span className="font-display text-[8rem] italic leading-none text-muted-foreground/[0.07] select-none mb-8">
              ∑
            </span>
            <p className="text-sm text-muted-foreground/50 max-w-xs leading-relaxed">
              {books.length === 0
                ? "Your library is empty — upload a PDF to begin"
                : "No titles match your search"}
            </p>
            {books.length === 0 && (
              <button
                onClick={pickAndUpload}
                className="mt-5 text-xs text-muted-foreground/40 hover:text-foreground/60 underline underline-offset-4 transition-colors"
              >
                Upload your first book
              </button>
            )}
          </div>
        )}

        {/* Book grid */}
        {(filtered.length > 0 || pendingUploads.length > 0) && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

            {/* Pending upload skeletons */}
            {pendingUploads.map((u) => (
              <div
                key={u.tempId}
                className="relative flex flex-col overflow-hidden rounded-lg border border-border/20 bg-surface"
              >
                <div className="aspect-[3/4] w-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex items-center gap-0.5">
                      <span className="thinking-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-muted-foreground/30" />
                    </span>
                  </div>
                  <div className="h-full w-full animate-pulse bg-surface" />
                </div>
                <div className="px-3.5 pb-3.5 pt-2.5">
                  <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-surface" />
                  <div className="mt-1.5 h-2 w-1/2 animate-pulse rounded-full bg-surface" />
                </div>
                <div className="absolute inset-y-0 left-0 w-[3px] animate-pulse bg-border/40" />
              </div>
            ))}

            {/* Book cards */}
            {filtered.map((book, i) => {
              const palette = PALETTES[(parseInt(book.id) || i) % PALETTES.length];
              return (
                <div
                  key={book.id}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-lg cursor-pointer",
                    "transition-all duration-300 ease-out",
                    "hover:-translate-y-1 hover:shadow-medium",
                    "animate-fade-in",
                    palette.card
                  )}
                  style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
                >
                  {/* Left spine accent */}
                  <div
                    className="absolute inset-y-0 left-0 w-[3px] opacity-50 group-hover:opacity-90 transition-opacity duration-300"
                    style={{ backgroundColor: palette.spine }}
                  />

                  {/* Cover area */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    {/* Background watermark glyph — very large, very faint */}
                    <span
                      className="absolute -bottom-2 -right-2 font-display leading-none select-none pointer-events-none transition-transform duration-500 group-hover:scale-110"
                      style={{
                        fontSize: "7rem",
                        fontStyle: "italic",
                        color: palette.glyphColor,
                        opacity: 0.07,
                      }}
                    >
                      {book.cover}
                    </span>

                    {/* Focal glyph — centered, readable */}
                    <span
                      className="absolute inset-0 flex items-center justify-center font-display text-4xl italic select-none transition-opacity duration-300 group-hover:opacity-60"
                      style={{ color: palette.glyphColor, opacity: 0.35 }}
                    >
                      {book.cover}
                    </span>

                    {/* Chapter count — top right */}
                    <span
                      className="absolute right-3 top-3 font-display text-[10px] italic leading-none"
                      style={{ color: palette.glyphColor, opacity: 0.45 }}
                    >
                      {book.subject}
                    </span>
                  </div>

                  {/* Title */}
                  <div className="px-3.5 pb-3.5 pt-2.5 pl-[calc(3px+0.875rem)]">
                    <h3 className="font-display text-xs italic leading-snug line-clamp-2 text-foreground/70 group-hover:text-foreground/90 transition-colors duration-200">
                      {book.title}
                    </h3>
                  </div>
                </div>
              );
            })}

            {/* Upload slot — ghost card, same portrait ratio */}
            <button
              onClick={pickAndUpload}
              className={cn(
                "group relative flex aspect-[3/4] w-full flex-col items-center justify-center rounded-lg",
                "border border-dashed border-border/30 hover:border-border/60",
                "transition-all duration-300 hover:bg-surface/50 cursor-pointer"
              )}
            >
              <Upload className="h-4 w-4 text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors mb-2" />
              <span className="font-display text-[10px] italic text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors">
                Add book
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
