import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open } from "@tauri-apps/plugin-dialog";
import { FileText, Image as ImageIcon, Type, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  subscribeAgentInput,
  submitAgentInput,
  type AgentInputRequest,
} from "@/lib/service";

type StagedItem =
  | { id: string; kind: "file"; name: string; path: string }
  | { id: string; kind: "image"; name: string; dataUrl: string }
  | { id: string; kind: "text"; name: string; content: string };

const uid = () => Math.random().toString(36).slice(2);
const filenameFromPath = (p: string) => p.split(/[/\\]/).pop() ?? p;

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
      const existing = new Set(prev.filter((i) => i.kind === "file").map((i) => (i as { path: string }).path));
      const next = paths
        .filter((p) => !existing.has(p))
        .map<StagedItem>((p) => ({ id: uid(), kind: "file", name: filenameFromPath(p), path: p }));
      return [...prev, ...next];
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

  // --- paste images (clipboard → data URL) ---
  useEffect(() => {
    if (!request) return;
    const onPaste = (e: ClipboardEvent) => {
      const clip = e.clipboardData;
      if (!clip) return;
      for (const it of Array.from(clip.items)) {
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = () =>
            setItems((prev) => [
              ...prev,
              {
                id: uid(),
                kind: "image",
                name: file.name || `pasted-${Date.now()}.png`,
                dataUrl: reader.result as string,
              },
            ]);
          reader.readAsDataURL(file);
        }
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [request]);

  // --- browse ---
  const browse = async () => {
    const selected = await open({ multiple: true });
    if (Array.isArray(selected)) addPaths(selected);
    else if (typeof selected === "string") addPaths([selected]);
  };

  // --- finish (resolves the waiting backend tool) ---
  const finish = (cancelled: boolean) => {
    if (!request || finishedRef.current) return;
    finishedRef.current = true;
    const payload: StagedItem[] = [...items];
    if (!cancelled && text.trim()) {
      payload.push({ id: uid(), kind: "text", name: "pasted.txt", content: text });
    }
    const serialized = payload.map((i) =>
      i.kind === "file"
        ? { kind: "file", name: i.name, path: i.path }
        : i.kind === "image"
          ? { kind: "image", name: i.name, data_url: i.dataUrl }
          : { kind: "text", name: i.name, content: i.content },
    );
    void submitAgentInput(request.request_id, { items: serialized, cancelled });
    setRequest(null);
  };

  const canSubmit = items.length > 0 || text.trim().length > 0;

  return (
    <Dialog
      open={!!request}
      onOpenChange={(o) => {
        if (!o) finish(true);
      }}
    >
      <DialogContent className="max-w-xl border-border bg-card p-0 overflow-hidden gap-0">
        <div className="px-6 pt-6 pb-4">
          <p className="label-whisper text-text-tertiary mb-2">Metis is asking</p>
          <DialogTitle className="font-display text-2xl text-foreground">
            {request?.title ?? "Add your material"}
          </DialogTitle>
          {request?.prompt && (
            <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {request.prompt}
            </DialogDescription>
          )}
        </div>

        <div className="px-6 pb-2">
          <button
            type="button"
            onClick={() => void browse()}
            className={cn(
              "group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center transition-all",
              dragging
                ? "border-amber bg-amber-soft scale-[0.99]"
                : "border-border bg-surface hover:bg-surface-hover hover:border-text-tertiary/40",
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                dragging ? "bg-amber/15" : "bg-background",
              )}
            >
              <Upload
                className={cn("h-5 w-5 transition-colors", dragging ? "text-amber" : "text-text-tertiary")}
                strokeWidth={1.75}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {dragging ? "Drop to add" : "Drop files, paste an image, or click to browse"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDFs, images, documents — whatever you'd like Metis to work from.
              </p>
            </div>
          </button>
        </div>

        {/* Staged items */}
        {items.length > 0 && (
          <div className="max-h-40 overflow-y-auto px-6 py-2 space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 animate-blur-in"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background">
                  {item.kind === "image" ? (
                    <ImageIcon className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
                  ) : item.kind === "text" ? (
                    <Type className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
                  ) : (
                    <FileText className="h-4 w-4 text-text-tertiary" strokeWidth={1.75} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{item.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-text-tertiary">{item.kind}</p>
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

        {/* Paste-text → .txt */}
        <div className="px-6 pt-2 pb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="…or paste text here — it'll be saved as a .txt"
            rows={2}
            className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-text-tertiary focus:border-text-tertiary/40 focus:outline-none"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface/40 px-6 py-3">
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
            Add
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
