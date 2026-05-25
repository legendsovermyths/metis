import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Book } from "@/data/mockData";
import { useBookUploads } from "@/context/UploadContext";
import { useAppContext } from "@/context/AppContext";
import { setChat } from "@/lib/service";
import { cn } from "@/lib/utils";
import { useMasthead, mastheadStyle } from "@/lib/editorial";

const COVER_GLYPHS = ["∑", "∂", "λ", "∫", "⊥", "∇", "Θ", "◈"] as const;

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
  const { context } = useAppContext();
  const navigate = useNavigate();
  const masthead = useMasthead();
  const { books: rawBooks, booksLoading, booksError, pendingUploads, pickAndUpload } =
    useBookUploads();

  const books = useMemo(() => rawBooks.map(backendBookToDisplay), [rawBooks]);

  const activeBookId = context?.session.book_id;
  const activeBook = useMemo(
    () => activeBookId != null ? books.find((b) => b.id === String(activeBookId)) : null,
    [books, activeBookId]
  );
  const activePalette = useMemo(() => {
    if (!activeBook) return PALETTES[0];
    return PALETTES[(parseInt(activeBook.id) || 0) % PALETTES.length];
  }, [activeBook]);

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

  const resumeReading = async () => {
    if (context) await setChat({ ...context.chat, is_done: false });
    navigate("/chat");
  };

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] flex flex-col pb-20 md:pb-0">
      <div className="relative mx-auto w-full max-w-5xl flex-1 flex flex-col px-6 md:px-8">

        {/* Masthead */}
        <header className="pt-8 md:pt-10">
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>Metis · Catalogue of Volumes</span>
            <span className="hidden sm:inline">
              {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        <main className="flex-1 py-10 md:py-12">

          {/* Hero */}
          <section className="relative mb-12 animate-blur-in">
            <div className="flex items-end justify-between gap-6">
              <div className="min-w-0">
                <p className="label-whisper text-text-tertiary mb-2">Collection</p>
                <h1 className="display-hero text-5xl text-foreground">
                  Library
                </h1>
                <div
                  className="h-px w-12 mt-5 mb-4 animate-reveal-line"
                  style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
                />
                <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-md">
                  An assembly of volumes, ordered by the hand of its keeper.
                </p>
              </div>

              {/* Editorial search — underline style */}
              <div className="relative flex items-center shrink-0 self-end">
                <Search className="absolute left-0 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
                <input
                  type="text"
                  placeholder="find a volume…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "w-44 border-b border-border/30 bg-transparent pb-1 pl-5 pr-1",
                    "font-display text-sm italic text-foreground placeholder:text-text-tertiary",
                    "focus:outline-none focus:border-foreground/25 transition-colors"
                  )}
                />
              </div>
            </div>
          </section>

          {booksError && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {booksError}
            </div>
          )}

          {/* Loading */}
          {booksLoading && books.length === 0 && pendingUploads.length === 0 && (
            <div className="flex items-center justify-center gap-1.5 py-32">
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
            </div>
          )}

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center py-24 text-center animate-blur-in">
              <span className="display-hero text-[8rem] text-foreground/[0.06] select-none leading-none mb-6">
                ∑
              </span>
              <p className="font-display italic text-base text-foreground/70 max-w-sm leading-relaxed">
                {books.length === 0
                  ? "An empty shelf awaits its first volume."
                  : "No titles match your search."}
              </p>
              {books.length === 0 && (
                <button
                  onClick={pickAndUpload}
                  className="mt-5 label-whisper text-text-tertiary hover:text-foreground/70 underline underline-offset-4 decoration-border transition-colors"
                >
                  Acquire a volume
                </button>
              )}
            </div>
          )}

          {/* Presently in hand — featured slot */}
          {activeBook && !search && (
            <section className="mb-14 animate-blur-in">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="label-whisper text-text-tertiary">Presently in hand</span>
                <div className="flex-1 h-px bg-border/30" />
              </div>
              <div className={cn("flex gap-6 rounded-xl overflow-hidden", activePalette.card)}>
                {/* Large book cover */}
                <div className="relative w-36 shrink-0 overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <div
                    className="absolute inset-y-0 left-0 w-[4px]"
                    style={{ backgroundColor: activePalette.spine, opacity: 0.7 }}
                  />
                  <span
                    className="absolute -bottom-2 -right-2 font-display italic leading-none select-none pointer-events-none"
                    style={{ fontSize: "9rem", color: activePalette.glyphColor, opacity: 0.07 }}
                  >
                    {activeBook.cover}
                  </span>
                  <span
                    className="absolute inset-0 flex items-center justify-center font-display text-5xl italic select-none"
                    style={{ color: activePalette.glyphColor, opacity: 0.35 }}
                  >
                    {activeBook.cover}
                  </span>
                </div>
                {/* Info */}
                <div className="flex flex-1 flex-col justify-between py-6 pr-6 min-w-0">
                  <div className="min-w-0">
                    <h2 className="display-hero text-2xl text-foreground mb-2 line-clamp-2">
                      {activeBook.title}
                    </h2>
                    <p className="label-whisper text-text-tertiary">{activeBook.subject}</p>
                  </div>
                  <button
                    onClick={() => void resumeReading()}
                    className="group self-start text-sm text-text-secondary hover:text-foreground transition-colors font-display italic"
                  >
                    resume the dialogue
                    <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* The shelf — grid */}
          {(filtered.length > 0 || pendingUploads.length > 0) && (
            <section>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="label-whisper text-text-tertiary">The Shelf</span>
                <div className="flex-1 h-px bg-border/30" />
                {totalCount > 0 && (
                  <span className="label-whisper text-text-tertiary">
                    {totalCount} {totalCount === 1 ? "vol." : "vols."}
                  </span>
                )}
              </div>

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
                          <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                          <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                          <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
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
                        "animate-blur-in opacity-0",
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
                        <span
                          className="absolute inset-0 flex items-center justify-center font-display text-4xl italic select-none transition-opacity duration-300 group-hover:opacity-60"
                          style={{ color: palette.glyphColor, opacity: 0.35 }}
                        >
                          {book.cover}
                        </span>
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

                {/* Upload slot — italic plus, librarian's empty slot */}
                <button
                  onClick={pickAndUpload}
                  className={cn(
                    "group relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg",
                    "border border-dashed border-border/30 hover:border-amber/40",
                    "transition-all duration-300 hover:bg-surface/50 cursor-pointer"
                  )}
                >
                  <span className="font-display text-3xl italic text-text-tertiary group-hover:text-amber transition-colors select-none leading-none">
                    +
                  </span>
                  <span className="font-display text-[11px] italic text-text-tertiary group-hover:text-foreground transition-colors">
                    a new volume
                  </span>
                </button>
              </div>
            </section>
          )}
        </main>

        {/* Colophon */}
        <footer className="pb-8 md:pb-10">
          <div className="h-px w-full bg-border/30 mb-4" />
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>μῆτις · gr. mêtis — cunning intelligence</span>
            <span>—  fol. ii  —</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
