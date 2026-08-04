import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { open } from "@tauri-apps/plugin-dialog";
import type { UserInputItem } from "@/lib/service";

export type StagedItem =
  // `src` is either an OS file path (drag/browse) or a data URL (pasted) —
  // both are valid for the backend's Image/File variants.
  | { id: string; kind: "file"; name: string; src: string }
  | { id: string; kind: "image"; name: string; src: string; mime: string }
  | { id: string; kind: "url"; url: string };

const uid = () => Math.random().toString(36).slice(2);
const filenameFromPath = (p: string) => p.split(/[/\\]/).pop() ?? p;
export const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s.trim());
const isImagePath = (p: string) =>
  /\.(png|jpe?g|gif|webp|bmp|tiff?|heic|heif|avif)$/i.test(p);
export const isDataUrl = (s: string) => s.startsWith("data:");

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

export const prettyHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export interface MaterialStaging {
  items: StagedItem[];
  text: string;
  setText: (t: string) => void;
  dragging: boolean;
  addPaths: (paths: string[]) => void;
  addUrl: (url: string) => void;
  removeItem: (id: string) => void;
  browse: () => Promise<void>;
  buildInputs: () => UserInputItem[];
  reset: () => void;
  count: number;
}

/** All the drop / paste / browse / staging logic behind the one upload canvas. */
export function useMaterialStaging(active: boolean): MaterialStaging {
  const [items, setItems] = useState<StagedItem[]>([]);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);

  const activeRef = useRef(false);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const reset = useCallback(() => {
    setItems([]);
    setText("");
    setDragging(false);
  }, []);

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

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Drag & drop — Tauri intercepts OS drops into real file paths.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let alive = true;
    getCurrentWebview()
      .onDragDropEvent((event) => {
        if (!activeRef.current) return;
        const p = event.payload;
        if (p.type === "enter" || p.type === "over") setDragging(true);
        else if (p.type === "leave") setDragging(false);
        else if (p.type === "drop") {
          setDragging(false);
          addPaths(p.paths ?? []);
        }
      })
      .then((fn) => {
        if (alive) unlisten = fn;
        else fn();
      });
    return () => {
      alive = false;
      unlisten?.();
    };
  }, [addPaths]);

  // Paste: image → chip, lone url → chip, everything else stays in the composer.
  useEffect(() => {
    if (!active) return;
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
  }, [active, addUrl]);

  const browse = useCallback(async () => {
    const selected = await open({ multiple: true });
    if (Array.isArray(selected)) addPaths(selected);
    else if (typeof selected === "string") addPaths([selected]);
  }, [addPaths]);

  const buildInputs = useCallback((): UserInputItem[] => {
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
  }, [items, text]);

  const count = items.length + (text.trim() ? 1 : 0);

  return { items, text, setText, dragging, addPaths, addUrl, removeItem, browse, buildInputs, reset, count };
}
