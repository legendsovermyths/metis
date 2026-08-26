import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Watermark } from "@/components/Watermark";
import { useResources } from "@/context/ResourceContext";
import { UploadDialog } from "@/components/upload/UploadDialog";
import { isLibraryVisible, resourceCover } from "@/lib/resources";
import { cn } from "@/lib/utils";
import { useMasthead, mastheadStyle } from "@/lib/editorial";

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const masthead = useMasthead();
  const { resources, loading, error, pendingUploads } = useResources();

  const shelf = useMemo(
    () =>
      resources
        .filter(isLibraryVisible)
        .slice()
        .sort((a, b) => b.created_at - a.created_at),
    [resources],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return shelf;
    return shelf.filter(
      (r) =>
        r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    );
  }, [shelf, search]);

  const totalCount = shelf.length + pendingUploads.length;
  const isEmptyLibrary =
    !loading && !error && shelf.length === 0 && pendingUploads.length === 0;
  const noMatch =
    shelf.length > 0 && filtered.length === 0 && pendingUploads.length === 0;

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] flex flex-col pb-20 md:pb-0">
      <Watermark />
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      <div className="relative mx-auto w-full max-w-3xl flex-1 flex flex-col px-6 md:px-8">
        {/* Masthead */}
        <header className="pt-8 md:pt-10">
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>Metis · The Reading Room</span>
            <span className="hidden sm:inline">
              {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        <main className="flex-1 py-10 md:py-12">
          {/* Hero */}
          <section className="relative mb-12 animate-blur-in">
            <p className="label-whisper text-text-tertiary mb-2">Collection</p>
            <h1 className="display-hero text-5xl text-foreground">Library</h1>
            <div
              className="h-px w-12 mt-5 mb-4 animate-reveal-line"
              style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
            />
            <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-md">
              Every book and paper you've set down, ordered by the hand of its keeper.
            </p>
          </section>

          {error && (
            <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && shelf.length === 0 && pendingUploads.length === 0 && (
            <div className="flex items-center justify-center gap-1.5 py-32">
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-text-tertiary" />
            </div>
          )}

          {isEmptyLibrary && (
            <div className="flex flex-col items-center py-24 text-center animate-blur-in-settle">
              <span className="display-hero text-[8rem] text-foreground/[0.06] select-none leading-none mb-6">
                ∑
              </span>
              <p className="font-display italic text-base text-foreground/70 max-w-sm leading-relaxed">
                An empty shelf awaits its first volume.
              </p>
              <button
                onClick={() => setUploadOpen(true)}
                className="mt-5 label-whisper text-text-tertiary hover:text-foreground/70 underline underline-offset-4 decoration-border transition-colors"
              >
                Acquire your first
              </button>
            </div>
          )}

          {(shelf.length > 0 || pendingUploads.length > 0) && (
            <section>
              <div className="flex items-center gap-4 mb-6">
                <span className="label-whisper text-text-tertiary">The Shelf</span>
                <div className="flex-1 h-px bg-border/30" />
                <div className="relative shrink-0">
                  <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3 w-3 text-text-tertiary pointer-events-none" />
                  <input
                    type="text"
                    placeholder="find a title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(
                      "w-36 border-b border-border/30 bg-transparent pb-0.5 pl-4 pr-1",
                      "font-display text-sm italic text-foreground placeholder:text-text-tertiary",
                      "focus:outline-none focus:border-foreground/25 transition-colors",
                    )}
                  />
                </div>
                {totalCount > 0 && (
                  <span className="label-whisper text-text-tertiary shrink-0">
                    {totalCount} {totalCount === 1 ? "item" : "items"}
                  </span>
                )}
              </div>

              {noMatch ? (
                <div className="flex flex-col items-center py-16 text-center animate-blur-in-settle">
                  <p className="font-display italic text-sm text-foreground/60 max-w-xs leading-relaxed">
                    No titles match “{search.trim()}”.
                  </p>
                </div>
              ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {/* Pending uploads — classifying */}
                {pendingUploads.map((u) => (
                  <div
                    key={u.tempId}
                    className="relative flex flex-col overflow-hidden rounded-lg border border-border/20 bg-surface"
                  >
                    <div className="relative aspect-[3/4] w-full">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <span className="flex items-center gap-0.5">
                          <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                          <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                          <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                        </span>
                        <span className="label-whisper text-text-tertiary">reading…</span>
                      </div>
                      <div className="h-full w-full animate-pulse bg-surface" />
                    </div>
                    <div className="px-3.5 pb-3.5 pt-2.5">
                      <p className="font-display text-xs italic leading-snug line-clamp-2 text-foreground/60">
                        {u.label}
                      </p>
                    </div>
                    <div className="absolute inset-y-0 left-0 w-[3px] animate-pulse bg-border/40" />
                  </div>
                ))}

                {/* Resource cards */}
                {filtered.map((r, i) => {
                  const cover = resourceCover(r.resource_type);
                  const tag = cover.detail ? `${cover.kindLabel} · ${cover.detail}` : cover.kindLabel;
                  return (
                    <Link
                      key={r.id}
                      to={`/library/${r.id}`}
                      className={cn(
                        "group relative flex flex-col overflow-hidden rounded-lg cursor-pointer",
                        "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-medium",
                        "animate-blur-in opacity-0",
                        cover.palette.card,
                      )}
                      style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 w-[3px] opacity-50 group-hover:opacity-90 transition-opacity duration-300"
                        style={{ backgroundColor: cover.palette.spine }}
                      />

                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <span
                          className="absolute -bottom-2 -right-2 font-display italic leading-none select-none pointer-events-none transition-transform duration-500 group-hover:scale-110"
                          style={{ fontSize: "7rem", color: cover.palette.glyphColor, opacity: 0.07 }}
                        >
                          {cover.glyph}
                        </span>
                        <span
                          className="absolute inset-0 flex items-center justify-center font-display text-4xl italic select-none transition-opacity duration-300 group-hover:opacity-60"
                          style={{ color: cover.palette.glyphColor, opacity: 0.35 }}
                        >
                          {cover.glyph}
                        </span>
                        <span
                          className="absolute right-3 top-3 font-display text-[10px] italic leading-none text-right max-w-[80%]"
                          style={{ color: cover.palette.glyphColor, opacity: 0.5 }}
                        >
                          {tag}
                        </span>
                      </div>

                      <div className="px-3.5 pb-3.5 pt-2.5 pl-[calc(3px+0.875rem)]">
                        <h3 className="font-display text-xs italic leading-snug line-clamp-2 text-foreground/70 group-hover:text-foreground/90 transition-colors duration-200">
                          {r.title}
                        </h3>
                      </div>
                    </Link>
                  );
                })}

                {/* Add material slot */}
                <button
                  onClick={() => setUploadOpen(true)}
                  className={cn(
                    "group relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-lg",
                    "border border-dashed border-border/30 hover:border-amber/40",
                    "transition-all duration-300 hover:bg-surface/50 cursor-pointer",
                  )}
                >
                  <span className="font-display text-3xl italic text-text-tertiary group-hover:text-amber transition-colors select-none leading-none">
                    +
                  </span>
                  <span className="font-display text-[11px] italic text-text-tertiary group-hover:text-foreground transition-colors">
                    add material
                  </span>
                </button>
              </div>
              )}
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
