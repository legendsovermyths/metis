import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { openUrl } from "@tauri-apps/plugin-opener";
import { toast } from "sonner";
import { ExternalLink, Copy, Pencil, Unlink } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "katex/dist/katex.min.css";
import { ReasoningBlock } from "./extensions/ReasoningBlock";
import { SlashCommand } from "./extensions/SlashCommand";
import { Spine } from "./extensions/Spine";
import { Notation } from "./extensions/Notation";
import { MathInline, MathBlock } from "./extensions/Math";
import { Calc } from "./extensions/Calc";
import { Structure } from "./extensions/Structure";
import { Mention } from "./extensions/Mention";
import { registerMentionTargets, type MentionTarget } from "./mentionRegistry";
import { reasoningBlocks } from "./noteText";
import { REASONING_KIND_MAP, type ReasoningKind } from "./blocks";
import { useNotebook } from "@/context/NotebookContext";

function parseDoc(content: string): object | string {
  if (!content) return "";
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}

/** Bare domains → https; leave mailto/tel/protocol'd URLs untouched. */
function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  if (/^(https?:|mailto:|tel:)/i.test(t)) return t;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`;
  return `https://${t}`;
}

/** Open a URL in the OS default browser, surfacing failures instead of swallowing them. */
function openExternal(href: string) {
  openUrl(href).catch((err) => {
    console.error("[note] failed to open link", href, err);
    toast.error("Couldn't open the link");
  });
}

interface LinkEditorState {
  url: string;
  left: number;
  top: number;
}

interface HoverLinkState {
  href: string;
  pos: number | null;
  left: number;
  top: number;
}

interface NoteEditorProps {
  noteId: number;
  initialContent: string;
  onChange: (content: string) => void;
}

// Reader-controlled text zoom for the note body (Cmd +/-/0), remembered across
// notes and sessions. Scoped to `.note-prose`, so it never touches the UI chrome.
const SCALE_KEY = "metis:note-scale";
const SCALE_MIN = 0.8;
const SCALE_MAX = 2.2;
const SCALE_STEP = 0.1;

function loadScale(): number {
  const raw = Number(localStorage.getItem(SCALE_KEY));
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, raw));
}

export function NoteEditor({ noteId, initialContent, onChange }: NoteEditorProps) {
  const { notes } = useNotebook();
  const [link, setLink] = useState<LinkEditorState | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState<number>(loadScale);
  const [hoverLink, setHoverLink] = useState<HoverLinkState | null>(null);
  const hoverCloseTimer = useRef<number | null>(null);

  const cancelHoverClose = () => {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current);
      hoverCloseTimer.current = null;
    }
  };
  const scheduleHoverClose = () => {
    cancelHoverClose();
    hoverCloseTimer.current = window.setTimeout(() => setHoverLink(null), 140);
  };

  // Cmd/Ctrl +/-/0 zooms the note text (not the app). Intercepted so it
  // overrides the webview's own page zoom.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      const k = e.key;
      if (k === "=" || k === "+") {
        e.preventDefault();
        setScale((s) => Math.min(SCALE_MAX, Math.round((s + SCALE_STEP) * 100) / 100));
      } else if (k === "-" || k === "_") {
        e.preventDefault();
        setScale((s) => Math.max(SCALE_MIN, Math.round((s - SCALE_STEP) * 100) / 100));
      } else if (k === "0") {
        e.preventDefault();
        setScale(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    localStorage.setItem(SCALE_KEY, String(scale));
  }, [scale]);

  useEffect(() => {
    registerMentionTargets((query) => {
      const q = query.toLowerCase();
      const targets: MentionTarget[] = [];
      for (const n of notes) {
        if (n.id === noteId || n.id == null) continue;
        const title = n.title || "Untitled";
        targets.push({ id: n.id, label: title, chip: title });
        for (const b of reasoningBlocks(n.content)) {
          const kindLabel = REASONING_KIND_MAP[b.kind as ReasoningKind]?.label ?? b.kind;
          const snippet = b.text ? ` · ${b.text.slice(0, 44)}` : "";
          targets.push({
            id: n.id,
            blockId: b.blockId,
            label: `${title} › ${kindLabel}${snippet}`,
            chip: `${title} › ${kindLabel}`,
          });
        }
      }
      return targets.filter((t) => t.label.toLowerCase().includes(q)).slice(0, 10);
    });
    return () => registerMentionTargets(null);
  }, [notes, noteId]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          link: {
            autolink: true,
            linkOnPaste: true,
            openOnClick: false,
            HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
          },
        }),
        Placeholder.configure({
          placeholder: "Begin writing: a problem, a rough idea, anything. Press / for blocks.",
        }),
        ReasoningBlock,
        SlashCommand,
        Spine,
        Notation,
        MathInline,
        MathBlock,
        Calc,
        Structure,
        Mention,
      ],
      content: parseDoc(initialContent),
      editorProps: {
        attributes: { class: "note-prose min-h-[55vh]" },
        handleKeyDown(view, event) {
          if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            view.dom.dispatchEvent(new CustomEvent("metis:link"));
            return true;
          }
          return false;
        },
        handleClick(_view, _pos, event) {
          const a = (event.target as HTMLElement).closest("a");
          const href = a?.getAttribute("href");
          if (href) {
            openExternal(href);
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor }) => onChange(JSON.stringify(editor.getJSON())),
      immediatelyRender: true,
    },
    [noteId],
  );

  // Open the link editor for the current selection (Cmd+K or the /link command).
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const open = () => {
      const { state } = editor;
      const { from, to } = state.selection;
      let href = "";
      state.doc.nodesBetween(from, Math.max(to, from + 1), (node) => {
        const mark = node.marks.find((m) => m.type.name === "link");
        if (mark) href = mark.attrs.href as string;
      });
      const coords = editor.view.coordsAtPos(from);
      const left = Math.min(coords.left, window.innerWidth - 340);
      setLink({ url: href, left: Math.max(left, 12), top: coords.bottom + 6 });
      requestAnimationFrame(() => linkInputRef.current?.select());
    };
    dom.addEventListener("metis:link", open);
    return () => dom.removeEventListener("metis:link", open);
  }, [editor]);

  // Hovering a link raises a card with the destination and its actions.
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onOver = (e: Event) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || !dom.contains(a)) return;
      const href = a.getAttribute("href");
      if (!href) return;
      cancelHoverClose();
      const rect = a.getBoundingClientRect();
      let pos: number | null = null;
      try {
        pos = editor.view.posAtDOM(a, 0);
      } catch {
        pos = null;
      }
      const left = Math.min(rect.left, window.innerWidth - 300);
      setHoverLink({ href, pos, left: Math.max(left, 12), top: rect.bottom + 6 });
    };
    const onOut = (e: Event) => {
      if (!(e.target as HTMLElement).closest("a")) return;
      scheduleHoverClose();
    };
    dom.addEventListener("mouseover", onOver);
    dom.addEventListener("mouseout", onOut);
    return () => {
      dom.removeEventListener("mouseover", onOver);
      dom.removeEventListener("mouseout", onOut);
      cancelHoverClose();
    };
  }, [editor]);

  function editHoverLink() {
    if (!editor || !hoverLink) return;
    if (hoverLink.pos != null) {
      editor.chain().focus().setTextSelection(hoverLink.pos).extendMarkRange("link").run();
    }
    editor.view.dom.dispatchEvent(new CustomEvent("metis:link"));
    setHoverLink(null);
  }

  function removeHoverLink() {
    if (!editor || !hoverLink || hoverLink.pos == null) return;
    editor.chain().focus().setTextSelection(hoverLink.pos).extendMarkRange("link").unsetLink().run();
    setHoverLink(null);
  }

  function copyHoverLink() {
    if (!hoverLink) return;
    void navigator.clipboard?.writeText(hoverLink.href);
    toast.success("Link copied");
    setHoverLink(null);
  }

  function applyLink() {
    if (!editor || !link) return;
    const href = normalizeUrl(link.url);
    const chain = editor.chain().focus();
    if (!href) {
      chain.unsetLink().run();
    } else if (editor.state.selection.empty) {
      chain
        .insertContent({ type: "text", text: link.url.trim(), marks: [{ type: "link", attrs: { href } }] })
        .run();
    } else {
      chain.setLink({ href }).run();
    }
    setLink(null);
  }

  return (
    <div style={{ "--note-scale": String(scale) } as CSSProperties}>
      <EditorContent editor={editor} />
      {hoverLink && !link && createPortal(
        <div
          className="link-card animate-blur-in"
          style={{ left: hoverLink.left, top: hoverLink.top }}
          onMouseEnter={cancelHoverClose}
          onMouseLeave={scheduleHoverClose}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="link-card-url">{hoverLink.href.replace(/^https?:\/\//, "")}</div>
          <div className="link-card-actions">
            <button
              className="link-card-action is-open label-whisper"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { openExternal(hoverLink.href); setHoverLink(null); }}
            >
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              Open
            </button>
            <button
              className="link-card-action label-whisper"
              onMouseDown={(e) => e.preventDefault()}
              onClick={copyHoverLink}
            >
              <Copy className="h-3 w-3" strokeWidth={1.5} />
              Copy
            </button>
            <button
              className="link-card-action label-whisper"
              onMouseDown={(e) => e.preventDefault()}
              onClick={editHoverLink}
            >
              <Pencil className="h-3 w-3" strokeWidth={1.5} />
              Edit
            </button>
            <button
              className="link-card-action is-danger label-whisper"
              onMouseDown={(e) => e.preventDefault()}
              onClick={removeHoverLink}
            >
              <Unlink className="h-3 w-3" strokeWidth={1.5} />
              Remove
            </button>
          </div>
        </div>,
        document.body,
      )}
      {link && createPortal(
        <div
          className="link-popover animate-blur-in"
          style={{ left: link.left, top: link.top }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <input
            ref={linkInputRef}
            value={link.url}
            autoFocus
            spellCheck={false}
            placeholder="Paste or type a link…"
            onChange={(e) => setLink((l) => (l ? { ...l, url: e.target.value } : l))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setLink(null);
                editor?.commands.focus();
              }
            }}
            onBlur={() => setLink(null)}
          />
          <button className="link-popover-apply label-whisper" onMouseDown={(e) => e.preventDefault()} onClick={applyLink}>
            {link.url.trim() ? "Link" : "Remove"}
          </button>
        </div>,
        document.body,
      )}
    </div>
  );
}
