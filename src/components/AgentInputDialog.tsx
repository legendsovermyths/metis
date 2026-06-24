import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open } from "@tauri-apps/plugin-dialog";
import { FileText, FolderOpen, Image as ImageIcon, Link2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  cancelAgentInput,
  subscribeAgentInput,
  submitAgentInput,
  type AgentInputRequest,
  type UserInputItem,
} from "@/lib/service";

type StagedItem =
  // `src` is either an OS file path (drag/browse) or a data URL (pasted) —
  // both are valid for the backend's Image/File variants.
  | { id: string; kind: "file"; name: string; src: string }
  | { id: string; kind: "image"; name: string; src: string; mime: string }
  | { id: string; kind: "url"; url: string };

const uid = () => Math.random().toString(36).slice(2);
const filenameFromPath = (p: string) => p.split(/[/\\]/).pop() ?? p;
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());
const isImagePath = (p: string) =>
  /\.(png|jpe?g|gif|webp|bmp|tiff?|heic|heif|avif)$/i.test(p);
const isDataUrl = (s: string) => s.startsWith("data:");

const IMAGE_MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
};
const imageMimeFromName = (name: string) =>
  IMAGE_MIME_BY_EXT[name.split(".").pop()?.toLowerCase() ?? ""] ?? "image/png";
const prettyHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function AgentInputDialog() {
  const [request, setRequest] = useState<AgentInputRequest | null>(null);
  const [items, setItems] = useState<StagedItem[]>([]);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);

  // The drag-drop listener is global; only act while a request is open.
  const openRef = useRef(false);
  useEffect(() => {
    openRef.current = !!request;
  }, [request]);

  // Guards against double-resolving the backend channel (submit + close).
  const finishedRef = useRef(false);

  const reset = () => {
    setItems([]);
    setText("");
    setDragging(false);
  };

  // --- incoming requests ---
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let active = true;
    subscribeAgentInput((req) => {
      finishedRef.current = false;
      reset();
      setRequest(req);
    }).then((fn) => {
      if (active) unlisten = fn;
      else fn();
    });
    return () => {
      active = false;
      unlisten?.();
    };
  }, []);

  // --- staging helpers ---
  const addPaths = useCallback((paths: string[]) => {
    setItems((prev) => {
      const existing = new Set(
        prev
          .filter((i) => i.kind === "file" || i.kind === "image")
          .map((i) => (i as { src: string }).src),
      );
      const next = paths
        .filter((p) => !existing.has(p))
        .map<StagedItem>((p) =>
          isImagePath(p)
            ? { id: uid(), kind: "image", name: filenameFromPath(p), src: p, mime: imageMimeFromName(p) }
            : { id: uid(), kind: "file", name: filenameFromPath(p), src: p },
        );
      return [...prev, ...next];
    });
  }, []);

  const addUrl = useCallback((url: string) => {
    setItems((prev) => {
      const existing = new Set(prev.filter((i) => i.kind === "url").map((i) => (i as { url: string }).url));
      if (existing.has(url)) return prev;
      return [...prev, { id: uid(), kind: "url", url }];
    });
  }, []);

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  // --- drag & drop (Tauri intercepts OS drops → real file paths) ---
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let active = true;
    getCurrentWebview()
      .onDragDropEvent((event) => {
        if (!openRef.current) return;
        const p = event.payload;
        if (p.type === "enter" || p.type === "over") setDragging(true);
        else if (p.type === "leave") setDragging(false);
        else if (p.type === "drop") {
          setDragging(false);
          addPaths(p.paths ?? []);
        }
      })
      .then((fn) => {
        if (active) unlisten = fn;
        else fn();
      });
    return () => {
      active = false;
      unlisten?.();
    };
  }, [addPaths]);

  // --- paste: image → chip, lone url → chip, everything else → the composer ---
  useEffect(() => {
    if (!request) return;
    const onPaste = (e: ClipboardEvent) => {
      const clip = e.clipboardData;
      if (!clip) return;

      for (const it of Array.from(clip.items)) {
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (!file) continue;
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () =>
            setItems((prev) => [
              ...prev,
              {
                id: uid(),
                kind: "image",
                name: file.name || `pasted-${Date.now()}.png`,
                src: reader.result as string,
                mime: file.type || imageMimeFromName(file.name),
              },
            ]);
          reader.readAsDataURL(file);
          return;
        }
      }

      const pasted = clip.getData("text");
      if (isUrl(pasted)) {
        e.preventDefault();
        addUrl(pasted.trim());
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [request, addUrl]);

  // --- browse ---
  const browse = async () => {
    const selected = await open({ multiple: true });
    if (Array.isArray(selected)) addPaths(selected);
    else if (typeof selected === "string") addPaths([selected]);
  };

  const buildInputs = (): UserInputItem[] => {
    const inputs: UserInputItem[] = items.map((i) =>
      i.kind === "file"
        ? { File: i.src }
        : i.kind === "image"
          ? { Image: { src: i.src, mime: i.mime } }
          : { Url: i.url },
    );
    const trimmed = text.trim();
    if (trimmed) inputs.push(isUrl(trimmed) ? { Url: trimmed } : { Text: trimmed });
    return inputs;
  };

  // --- finish (resolves the waiting backend tool) ---
  const finish = (cancelled: boolean) => {
    if (!request || finishedRef.current) return;
    finishedRef.current = true;
    const id = request.request_id;
    setRequest(null);
    if (cancelled) {
      void cancelAgentInput(id);
    } else {
      void submitAgentInput(id, buildInputs(), request.notes ?? "");
    }
  };

  const count = items.length + (text.trim() ? 1 : 0);
  const canSubmit = count > 0;

  return (
    <Dialog
      open={!!request}
      onOpenChange={(o) => {
        if (!o) finish(true);
      }}
    >
      <DialogContent className="max-w-xl border-border bg-card p-0 overflow-hidden gap-0">
        {/* Watermark — the athenaeum monogram */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-display italic leading-none"
          style={{ fontSize: "14rem", color: "hsl(var(--foreground) / 0.025)" }}
        >
          M
        </span>

        {/* Header — Metis's voice */}
        <div className="relative px-7 pt-7 pb-5">
          <p className="label-whisper text-text-tertiary mb-2">Metis is asking</p>
          <DialogTitle className="font-display text-2xl text-foreground">
            {request?.title ?? "Add your material"}
          </DialogTitle>
          <div
            className="h-px w-10 mt-4 mb-4 animate-reveal-line"
            style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
          />
          <DialogDescription className="relative font-display italic text-[15px] leading-relaxed text-text-secondary">
            <span
              aria-hidden
              className="absolute -left-3 -top-2 font-display not-italic text-2xl"
              style={{ color: "hsl(var(--amber) / 0.4)" }}
            >
              “
            </span>
            {request?.prompt ?? "Share whatever you'd like me to work from."}
          </DialogDescription>
        </div>

        {/* The one canvas — drop, paste, type, or browse */}
        <div className="relative px-7 pb-3">
          <div
            className={cn(
              "relative rounded-2xl border transition-colors duration-200",
              dragging
                ? "border-amber bg-amber-soft"
                : "border-border/60 bg-surface focus-within:border-text-tertiary/40",
            )}
          >
            {/* Staged material */}
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

            {/* Composer — text or a link, typed or pasted */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text or a link, drop a file, or just start writing…"
              rows={items.length > 0 ? 2 : 4}
              className="w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 text-sm leading-relaxed text-foreground placeholder:text-text-tertiary focus:outline-none"
            />

            {/* Footer of the canvas — browse + ambient hint */}
            <div className="flex items-center justify-between gap-3 border-t border-border/40 px-3 py-2">
              <button
                type="button"
                onClick={() => void browse()}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                Browse files
              </button>
              <p className="text-[11px] text-text-tertiary">
                drop · paste an image · drop a link
              </p>
            </div>

            {/* Drag veil */}
            {dragging && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-amber-soft/95 backdrop-blur-sm animate-fade-in">
                <ImageIcon className="h-6 w-6 text-amber" strokeWidth={1.5} />
                <p className="font-display italic text-sm text-foreground">
                  Release, and Metis will take it from here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer rail */}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-7 py-3">
          <span className="text-xs text-text-tertiary">
            {count === 0
              ? "Nothing added yet"
              : `${count} ${count === 1 ? "piece" : "pieces"} ready`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => finish(true)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => finish(false)}
              className={cn(
                "rounded-xl px-5 py-2 text-sm font-medium shadow-soft transition-all",
                canSubmit
                  ? "bg-foreground text-background hover:opacity-90"
                  : "cursor-not-allowed bg-surface text-text-tertiary",
              )}
            >
              Share with Metis
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
