import { FileText, FolderOpen, Image as ImageIcon, Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDataUrl, prettyHost, type MaterialStaging } from "./useMaterialStaging";

/** The one shared upload surface — drop, paste, type, or browse. */
export function MaterialCanvas({ staging }: { staging: MaterialStaging }) {
  const { items, text, setText, dragging, removeItem, browse } = staging;

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-colors duration-200",
        dragging
          ? "border-amber bg-amber-soft"
          : "border-border/60 bg-surface focus-within:border-text-tertiary/40",
      )}
    >
      {items.length > 0 && (
        <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto p-3 pb-0">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5 shadow-soft animate-blur-in"
              style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                {item.kind === "image" && isDataUrl(item.src) ? (
                  <img src={item.src} alt="" className="chat-image h-full w-full object-cover" />
                ) : item.kind === "image" ? (
                  <ImageIcon className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
                ) : item.kind === "url" ? (
                  <Link2 className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
                ) : (
                  <FileText className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  {item.kind === "url" ? prettyHost(item.url) : item.name}
                </p>
                <p className="truncate text-[11px] uppercase tracking-wide text-text-tertiary">
                  {item.kind === "url" ? item.url : item.kind}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="shrink-0 rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text or a link, drop a file, or just start writing…"
        rows={items.length > 0 ? 2 : 4}
        className="w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 text-sm leading-relaxed text-foreground placeholder:text-text-tertiary focus:outline-none"
      />

      <div className="flex items-center justify-between gap-3 border-t border-border/40 px-3 py-2">
        <button
          type="button"
          onClick={() => void browse()}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
          Browse files
        </button>
        <p className="text-[11px] text-text-tertiary">drop · paste an image · drop a link</p>
      </div>

      {dragging && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-amber-soft/95 backdrop-blur-sm animate-fade-in">
          <ImageIcon className="h-6 w-6 text-amber" strokeWidth={1.5} />
          <p className="font-display italic text-sm text-foreground">
            Release, and Metis will take it from here.
          </p>
        </div>
      )}
    </div>
  );
}
