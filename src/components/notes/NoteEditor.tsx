import { useEffect, useRef, useState } from "react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "katex/dist/katex.min.css";
import { ReasoningBlock } from "./extensions/ReasoningBlock";
import { SlashCommand } from "./extensions/SlashCommand";
import { Spine } from "./extensions/Spine";
import { Notation } from "./extensions/Notation";
import { MathInline, MathBlock } from "./extensions/Math";
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

interface LinkEditorState {
  url: string;
  left: number;
  top: number;
}

interface NoteEditorProps {
  noteId: number;
  initialContent: string;
  onChange: (content: string) => void;
}

export function NoteEditor({ noteId, initialContent, onChange }: NoteEditorProps) {
  const { notes } = useNotebook();
  const [link, setLink] = useState<LinkEditorState | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

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
            void openUrl(href);
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
    <>
      <EditorContent editor={editor} />
      {link && (
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
        </div>
      )}
    </>
  );
}
