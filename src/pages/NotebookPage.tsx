import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CornerDownRight, Folder as FolderIcon, FolderPlus, Plus, Trash2 } from "lucide-react";
import { useNotebook } from "@/context/NotebookContext";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { Backlinks } from "@/components/notes/Backlinks";
import { excerpt, reasoningBlocks } from "@/components/notes/noteText";
import { REASONING_KIND_MAP, type ReasoningKind } from "@/components/notes/blocks";
import { useFolderShelf } from "@/components/folders/useFolderShelf";
import { FolderBreadcrumb, FolderRow, NewFolderComposer } from "@/components/folders/FolderChrome";
import {
  getAllExplanations,
  getAllJourneys,
  type Folder,
  type Note,
  type NoteAnchor,
} from "@/lib/service";
import { useMasthead, mastheadStyle, toRomanLower } from "@/lib/editorial";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SaveState = "idle" | "saving" | "saved";

function relativeDay(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface Provenance {
  prefix: string;
  label: string;
  to: string | null;
}

/** Where a note was born, resolved to a human line (and a link, when one exists). */
function provenanceFor(
  anchor: NoteAnchor | null,
  journeys: Map<number, string>,
  explanations: Map<number, string>,
): Provenance | null {
  if (!anchor) return null;
  if ("Journey" in anchor) {
    const id = anchor.Journey.journey_id;
    return { prefix: "Born on", label: journeys.get(id) ?? "a journey", to: `/journeys/${id}` };
  }
  if ("Explanation" in anchor) {
    const id = anchor.Explanation.explanation_id;
    return { prefix: "From", label: explanations.get(id) ?? "an explainer", to: `/explanations/${id}` };
  }
  if ("Dialogue" in anchor) {
    return { prefix: "Born in", label: "a dialogue", to: null };
  }
  return null;
}

interface DigestEntry {
  noteId: number;
  noteTitle: string;
  blockId: string;
  kind: string;
  text: string;
}

function DigestList({
  entries,
  emptyLine,
  onOpen,
}: {
  entries: DigestEntry[];
  emptyLine: string;
  onOpen: (noteId: number, blockId?: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-blur-in">
        <div className="display-hero text-[7rem] leading-none text-foreground/[0.06]">◇</div>
        <p className="mt-2 font-display italic text-base text-foreground/70 max-w-sm leading-relaxed">
          {emptyLine}
        </p>
      </div>
    );
  }
  return (
    <ul className="digest">
      {entries.map((e, i) => (
        <li key={e.blockId}>
          <button
            className="digest-item animate-blur-in"
            style={{ animationDelay: `${Math.min(i * 45, 400)}ms` }}
            onClick={() => onOpen(e.noteId, e.blockId)}
          >
            <div className="digest-meta">
              <span className="label-whisper digest-kind">
                {REASONING_KIND_MAP[e.kind as ReasoningKind]?.label ?? e.kind}
              </span>
              <span className="digest-note">{e.noteTitle}</span>
            </div>
            <p className="digest-text">{e.text || "—"}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function NotebookPage() {
  const { notes, notesLoading, create, update, remove, move, refresh, showSlip, focusNoteId, clearFocus } =
    useNotebook();
  const masthead = useMasthead();
  const navigate = useNavigate();

  const [view, setView] = useState<"notes" | "doubts" | "highlights">("notes");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Source titles, resolved once, so a note can name where it was born.
  const [journeyNames, setJourneyNames] = useState<Map<number, string>>(new Map());
  const [explanationNames, setExplanationNames] = useState<Map<number, string>>(new Map());

  const [deleteFol, setDeleteFol] = useState<Folder | null>(null);

  // Cross-corpus views: every open Doubt and every Note-to-self.
  const digest = useMemo(() => {
    const doubts: DigestEntry[] = [];
    const highlights: DigestEntry[] = [];
    for (const n of notes) {
      if (n.id == null) continue;
      for (const b of reasoningBlocks(n.content)) {
        const entry = { noteId: n.id, noteTitle: n.title || "Untitled", blockId: b.blockId, kind: b.kind, text: b.text };
        if (b.kind === "dt" && b.state !== "resolved") doubts.push(entry);
        else if (b.kind === "nt") highlights.push(entry);
      }
    }
    return { doubts, highlights };
  }, [notes]);

  const [title, setTitle] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const selectedIdRef = useRef<number | null>(null);
  const titleRef = useRef("");
  const contentRef = useRef("");
  const saveTimer = useRef<number>();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  // ── Folder shelf ────────────────────────────────────────────────────────────
  const reloadLeaves = useCallback(() => refresh(true), [refresh]);
  const moveLeaf = useCallback(
    (key: string, folderId: number | null) => move(Number(key), folderId),
    [move],
  );
  const leaves = useMemo(
    () => notes.filter((n) => n.id != null).map((n) => ({ key: String(n.id), folderId: n.folder_id })),
    [notes],
  );
  const shelf = useFolderShelf({ scope: "note", leaves, moveLeaf, reloadLeaves });

  const currentNotes = useMemo(
    () => notes.filter((n) => (n.folder_id ?? null) === shelf.currentFolderId),
    [notes, shelf.currentFolderId],
  );

  useEffect(() => {
    void Promise.all([getAllJourneys(), getAllExplanations()])
      .then(([js, es]) => {
        setJourneyNames(new Map(js.map((j) => [j.id, j.journey.journey_title || j.chapter_title || "a journey"])));
        setExplanationNames(new Map(es.map((e) => [e.id, e.title || "an explainer"])));
      })
      .catch(() => {
        /* provenance falls back to generic labels */
      });
  }, []);

  useEffect(() => {
    if (focusNoteId != null) {
      setSelectedId(focusNoteId);
      clearFocus();
    }
  }, [focusNoteId, clearFocus]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    setSaveState("idle");
    if (selected) {
      setTitle(selected.title);
      titleRef.current = selected.title;
      contentRef.current = selected.content;
      if (!selected.title) {
        requestAnimationFrame(() => titleInputRef.current?.focus());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const scheduleSave = useCallback(
    (id: number, t: string, c: string) => {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => {
        setSaveState("saving");
        update(id, t, c)
          .then(() => setSaveState("saved"))
          .catch(() => setSaveState("idle"));
      }, 600);
    },
    [update],
  );

  function flushSave() {
    window.clearTimeout(saveTimer.current);
    if (selectedIdRef.current != null) {
      void update(selectedIdRef.current, titleRef.current, contentRef.current);
    }
  }

  function onTitleChange(v: string) {
    setTitle(v);
    titleRef.current = v;
    if (selectedId != null) scheduleSave(selectedId, v, contentRef.current);
  }

  const onContentChange = useCallback(
    (c: string) => {
      contentRef.current = c;
      if (selectedIdRef.current != null) {
        scheduleSave(selectedIdRef.current, titleRef.current, c);
      }
    },
    [scheduleSave],
  );

  async function onNewNote() {
    const id = await create("", "", null, shelf.currentFolderId);
    setSelectedId(id);
  }

  function onBack() {
    flushSave();
    setSelectedId(null);
  }

  async function confirmDelete() {
    if (deleteTargetId == null) return;
    window.clearTimeout(saveTimer.current);
    const wasSelected = selectedId === deleteTargetId;
    await remove(deleteTargetId);
    setDeleteTargetId(null);
    if (wasSelected) setSelectedId(null);
  }

  const confirmDeleteFol = useCallback(async () => {
    if (!deleteFol) return;
    try {
      await shelf.removeFolder(deleteFol.id);
    } finally {
      setDeleteFol(null);
    }
  }, [deleteFol, shelf]);

  const provenance = selected ? provenanceFor(selected.anchor, journeyNames, explanationNames) : null;

  const sectionLabel =
    shelf.breadcrumb.length > 0 ? shelf.breadcrumb[shelf.breadcrumb.length - 1].name : "All notes";
  const notebookEmpty = !notesLoading && notes.length === 0 && shelf.folders.length === 0;
  const folderEmpty =
    !notesLoading && !notebookEmpty && shelf.childFolders.length === 0 && currentNotes.length === 0;

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] overflow-hidden flex flex-col pb-20 md:pb-0">
      <div
        className={`relative mx-auto w-full flex-1 flex flex-col px-6 md:px-8 ${
          selected ? "max-w-5xl" : "max-w-3xl"
        }`}
      >
        <header className="pt-8 md:pt-10">
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>Metis · The Notebook</span>
            <span className="hidden sm:inline">
              {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        <main className="flex-1 py-10 md:py-12">
          {selected ? (
            <section className="animate-blur-in">
              <div className="mb-8 flex items-center justify-between">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-text-tertiary transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  <span className="label-whisper">All notes</span>
                </button>

                <div className="flex items-center gap-5">
                  <span className="label-whisper flex items-center gap-1.5 text-text-tertiary">
                    {saveState === "saving" && (
                      <>
                        <span className="flex items-center gap-0.5">
                          <span className="thinking-dot inline-block h-1 w-1 rounded-full bg-current" />
                          <span className="thinking-dot inline-block h-1 w-1 rounded-full bg-current" />
                          <span className="thinking-dot inline-block h-1 w-1 rounded-full bg-current" />
                        </span>
                        Saving
                      </>
                    )}
                    {saveState === "saved" && <span className="animate-fade-in">Saved</span>}
                  </span>

                  <button
                    onClick={() => setDeleteTargetId(selected.id)}
                    className="text-text-tertiary transition-colors hover:text-foreground"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Untitled"
                className="w-full bg-transparent display-hero text-4xl text-foreground placeholder:text-text-tertiary/40 focus:outline-none"
              />

              {provenance && (
                <button
                  onClick={() => provenance.to && navigate(provenance.to)}
                  disabled={!provenance.to}
                  className={`group mt-4 inline-flex items-center gap-2 rounded-full border border-border/40 bg-surface/40 px-3 py-1 transition-colors duration-200 ${
                    provenance.to ? "hover:border-amber/40" : "cursor-default"
                  }`}
                >
                  <CornerDownRight
                    className="h-3 w-3 shrink-0 text-text-tertiary transition-colors group-hover:text-amber"
                    strokeWidth={1.5}
                  />
                  <span className="label-whisper text-text-tertiary">{provenance.prefix}</span>
                  <span className="font-display text-xs italic text-text-secondary group-hover:text-foreground">
                    {provenance.label}
                  </span>
                </button>
              )}

              <div
                className="h-px w-12 mt-5 mb-7 animate-reveal-line"
                style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
              />

              <NoteEditor noteId={selected.id!} initialContent={selected.content} onChange={onContentChange} />
              <Backlinks noteId={selected.id!} />
            </section>
          ) : (
            <>
              <section className="mb-12 animate-blur-in">
                <p className="label-whisper text-text-tertiary mb-3">Marginalia</p>
                <h1 className="display-hero text-5xl text-foreground">Notebook</h1>
                <div
                  className="h-px w-12 mt-5 mb-4 animate-reveal-line"
                  style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
                />
                <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-md">
                  Where your thinking is kept: problems worked, doubts held open, and the things
                  worth remembering.
                </p>
              </section>

              <div className="notebook-tabs">
                {(["notes", "doubts", "highlights"] as const).map((v) => {
                  const count = v === "doubts" ? digest.doubts.length : v === "highlights" ? digest.highlights.length : 0;
                  const label = v === "notes" ? "Notes" : v === "doubts" ? "Doubts" : "Highlights";
                  return (
                    <button
                      key={v}
                      className={"notebook-tab label-whisper" + (view === v ? " is-active" : "")}
                      onClick={() => setView(v)}
                    >
                      {label}
                      {count > 0 && <span className="notebook-tab-count">{count}</span>}
                    </button>
                  );
                })}
              </div>

              {view === "notes" && (
                <>
                  <FolderBreadcrumb
                    breadcrumb={shelf.breadcrumb}
                    isHotTarget={shelf.isHotTarget}
                    onNavigate={shelf.setCurrentFolderId}
                  />

                  {/* Section rule — where you are · new page · new folder */}
                  <div className="mt-6 mb-2 flex items-center gap-4">
                    <span className="label-whisper shrink-0 text-text-tertiary">{sectionLabel}</span>
                    {currentNotes.length > 0 && (
                      <span className="label-whisper shrink-0 text-text-tertiary/70 tabular-nums">
                        {currentNotes.length} {currentNotes.length === 1 ? "page" : "pages"}
                      </span>
                    )}
                    <div className="h-px flex-1 bg-border/30" />
                    <button
                      onClick={onNewNote}
                      className="group/np flex shrink-0 items-center gap-1.5 rounded-full border border-border/40 px-3 py-1 text-text-tertiary transition-all duration-200 hover:border-amber/40 hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5 transition-colors group-hover/np:text-amber" strokeWidth={2} />
                      <span className="label-whisper">New page</span>
                    </button>
                    <button
                      onClick={() => shelf.setCreatingFolder(true)}
                      className="group/nf flex shrink-0 items-center gap-1.5 rounded-full border border-border/40 px-3 py-1 text-text-tertiary transition-all duration-200 hover:border-amber/40 hover:text-foreground"
                    >
                      <FolderPlus className="h-3.5 w-3.5 transition-colors group-hover/nf:text-amber" strokeWidth={1.5} />
                      <span className="label-whisper">New folder</span>
                    </button>
                  </div>

                  <NewFolderComposer
                    show={shelf.creatingFolder}
                    inputRef={shelf.newFolderRef}
                    value={shelf.newFolderName}
                    onChange={shelf.setNewFolderName}
                    onSubmit={shelf.submitNewFolder}
                    onCancel={() => {
                      shelf.setCreatingFolder(false);
                      shelf.setNewFolderName("");
                    }}
                  />

                  {notebookEmpty ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center animate-blur-in">
                      <div className="display-hero text-[8rem] leading-none text-foreground/[0.06]">✎</div>
                      <p className="mt-2 font-display italic text-base text-foreground/70 max-w-sm leading-relaxed">
                        Nothing written yet. Begin a page and let the thinking land.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1">
                      {/* Folders */}
                      {shelf.childFolders.map((f, i) => (
                        <FolderRow
                          key={f.id}
                          folder={f}
                          count={shelf.folderCounts.get(f.id) ?? 0}
                          hot={shelf.isHotTarget(f.id)}
                          dimmed={shelf.dragItem?.type === "folder" && shelf.dragItem.id === f.id}
                          isRenaming={shelf.renamingId === f.id}
                          renameValue={shelf.renameValue}
                          renameRef={shelf.renameRef}
                          animationDelay={Math.min(i * 45, 300)}
                          draggedRef={shelf.draggedRef}
                          onOpen={() => shelf.setCurrentFolderId(f.id)}
                          onBeginDrag={(e) => shelf.beginDrag({ type: "folder", id: f.id }, f.name, e)}
                          onRenameChange={shelf.setRenameValue}
                          onRenameSubmit={shelf.submitRename}
                          onRenameCancel={() => shelf.setRenamingId(null)}
                          onRenameStart={() => shelf.beginRename(f)}
                          onDelete={() => setDeleteFol(f)}
                        />
                      ))}

                      {/* Notes */}
                      {currentNotes.map((note, i) => {
                        const preview = excerpt(note.content);
                        const dragging = shelf.dragItem?.type === "leaf" && shelf.dragItem.key === String(note.id);
                        return (
                          <div
                            key={note.id}
                            className={`group border-b border-border/20 last:border-0 animate-blur-in opacity-0 ${
                              dragging ? "opacity-40" : ""
                            }`}
                            style={{ animationDelay: `${Math.min((shelf.childFolders.length + i) * 45, 360)}ms` }}
                          >
                            <div
                              role="button"
                              tabIndex={0}
                              onPointerDown={(e) =>
                                shelf.beginDrag({ type: "leaf", key: String(note.id) }, note.title || "Untitled", e)
                              }
                              onClick={() => {
                                if (shelf.draggedRef.current) return;
                                setSelectedId(note.id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setSelectedId(note.id);
                                }
                              }}
                              className="block w-full cursor-pointer select-none py-5 -mx-2 px-2 rounded-lg text-left transition-colors duration-200 hover:bg-surface-hover/40 focus:outline-none"
                            >
                              <div className="flex items-baseline justify-between gap-4">
                                <h2 className="font-display text-lg text-foreground transition-colors group-hover:text-amber truncate">
                                  {note.title || "Untitled"}
                                </h2>
                                <span className="shrink-0 text-text-tertiary" style={mastheadStyle}>
                                  {relativeDay(note.updated_at)}
                                </span>
                              </div>
                              {preview && (
                                <p className="mt-1.5 text-sm leading-relaxed text-text-tertiary line-clamp-1">
                                  {preview}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {folderEmpty && (
                        <div className="flex flex-col items-center py-16 text-center animate-blur-in">
                          <span className="display-hero text-[6rem] text-foreground/[0.05] select-none leading-none mb-4">
                            ◇
                          </span>
                          <p className="font-display italic text-sm text-foreground/70 max-w-xs leading-relaxed">
                            This folder is empty. Begin a page here, or drag one in.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {view !== "notes" && (
                <DigestList
                  entries={view === "doubts" ? digest.doubts : digest.highlights}
                  emptyLine={
                    view === "doubts"
                      ? "No open doubts. Everything's been chased down."
                      : "No highlights yet. Mark what's worth remembering with a Note."
                  }
                  onOpen={showSlip}
                />
              )}
            </>
          )}
        </main>

        <footer className="pb-8 md:pb-10">
          <div className="h-px w-full bg-border/30 mb-4" />
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>μῆτις · gr. mêtis — cunning intelligence</span>
            <span>—  fol. {toRomanLower(8)}  —</span>
          </div>
        </footer>
      </div>

      {/* Drag ghost */}
      {shelf.dragItem && shelf.dragPos && (
        <div
          className="pointer-events-none fixed z-[60] flex items-center gap-2 rounded-lg border border-border/40 bg-card/95 px-3 py-2 shadow-large backdrop-blur-sm"
          style={{ left: shelf.dragPos.x + 14, top: shelf.dragPos.y + 14, maxWidth: "20rem" }}
        >
          {shelf.dragItem.type === "folder" ? (
            <FolderIcon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} />
          ) : (
            <span className="font-display text-base italic leading-none" style={{ color: "hsl(var(--amber))" }}>
              ✎
            </span>
          )}
          <span className="truncate font-display text-xs italic text-foreground">{shelf.dragLabel}</span>
        </div>
      )}

      <AlertDialog open={deleteTargetId != null} onOpenChange={(o) => !o && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl">Discard this note?</AlertDialogTitle>
            <AlertDialogDescription className="font-display italic text-sm text-muted-foreground">
              This page and everything on it will be gone for good.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Discard</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete folder confirmation */}
      <AlertDialog open={deleteFol !== null} onOpenChange={(o) => { if (!o) setDeleteFol(null); }}>
        <AlertDialogContent className="max-w-sm border-border/60 bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display italic text-base font-normal text-foreground">
              Remove this folder?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-display text-sm italic text-text-secondary leading-relaxed">
              <span className="text-foreground/80">{deleteFol?.name}</span> will be removed. Any pages inside it
              move up to where the folder lived; nothing is lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel className="font-display italic text-sm border-border/50 bg-transparent text-text-secondary hover:bg-surface-hover/40 hover:text-foreground">
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFol}
              className="font-display italic text-sm bg-foreground/90 text-background hover:bg-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
