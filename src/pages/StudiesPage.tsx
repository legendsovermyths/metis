import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Folder as FolderIcon, FolderPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { journeyGlyph, useMasthead, mastheadStyle } from "@/lib/editorial";
import { useTasks } from "@/context/TasksContext";
import { useJourneyCreation } from "@/context/JourneyCreationContext";
import {
  deleteExplanation,
  getAllExplanations,
  moveExplanation,
  moveJourney,
  type ExplanationRow,
  type Folder,
} from "@/lib/service";
import {
  explanationToStudy,
  journeyToStudy,
  type StudyItem,
} from "@/lib/studies";
import { useFolderShelf } from "@/components/folders/useFolderShelf";
import {
  FolderBreadcrumb,
  FolderRow,
  NewFolderComposer,
} from "@/components/folders/FolderChrome";
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

export default function StudiesPage() {
  const navigate = useNavigate();
  const masthead = useMasthead();
  const { onTaskDone, byType } = useTasks();
  const {
    journeyRows,
    journeysLoading,
    journeysError,
    pendingJourneys,
    lastCreatedId,
    clearLastCreatedId,
    refreshJourneys,
    removeJourney,
  } = useJourneyCreation();

  const [explanations, setExplanations] = useState<ExplanationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion targets
  const [deleteItem, setDeleteItem] = useState<StudyItem | null>(null);
  const [deleteFol, setDeleteFol] = useState<Folder | null>(null);

  const refreshLocal = useCallback(async () => {
    try {
      setExplanations(await getAllExplanations());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadLeaves = useCallback(
    () => Promise.all([refreshLocal(), refreshJourneys()]).then(() => undefined),
    [refreshLocal, refreshJourneys],
  );

  // ── The unified study set ───────────────────────────────────────────────────
  const items = useMemo<StudyItem[]>(() => {
    const all = [...journeyRows.map(journeyToStudy), ...explanations.map(explanationToStudy)];
    all.sort((a, b) => b.createdAt - a.createdAt);
    return all;
  }, [journeyRows, explanations]);

  const moveLeaf = useCallback(
    async (key: string, folderId: number | null) => {
      const item = items.find((s) => s.key === key);
      if (!item) return;
      if (item.kind === "Journey") await moveJourney(item.id, folderId);
      else await moveExplanation(item.id, folderId);
    },
    [items],
  );

  const shelf = useFolderShelf({
    scope: "study",
    leaves: useMemo(() => items.map((s) => ({ key: s.key, folderId: s.folderId })), [items]),
    moveLeaf,
    reloadLeaves,
  });

  useEffect(() => {
    void refreshLocal();
  }, [refreshLocal]);

  // A finished create task drops a fresh study onto the shelf.
  useEffect(() => onTaskDone(() => void refreshLocal()), [onTaskDone, refreshLocal]);

  // A freshly created journey opens straight into its detail.
  useEffect(() => {
    if (lastCreatedId != null) {
      clearLastCreatedId();
      navigate(`/journeys/${lastCreatedId}`);
    }
  }, [lastCreatedId, clearLastCreatedId, navigate]);

  const currentItems = useMemo(
    () => items.filter((s) => s.folderId === shelf.currentFolderId),
    [items, shelf.currentFolderId],
  );
  const viewCompleted = currentItems.reduce((a, s) => a + s.completed, 0);
  const viewTotal = currentItems.reduce((a, s) => a + s.total, 0);

  const confirmDeleteItem = useCallback(async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.kind === "Journey") await removeJourney(deleteItem.id);
      else {
        await deleteExplanation(deleteItem.id);
        await refreshLocal();
      }
    } finally {
      setDeleteItem(null);
    }
  }, [deleteItem, removeJourney, refreshLocal]);

  const confirmDeleteFol = useCallback(async () => {
    if (!deleteFol) return;
    try {
      await shelf.removeFolder(deleteFol.id);
    } finally {
      setDeleteFol(null);
    }
  }, [deleteFol, shelf]);

  const openStudy = useCallback(
    (item: StudyItem) => {
      const base = item.kind === "Journey" ? "journeys" : "explanations";
      navigate(`/${base}/${item.id}`);
    },
    [navigate],
  );

  const isDraggingStudy = (item: StudyItem) =>
    shelf.dragItem?.type === "leaf" && shelf.dragItem.key === item.key;

  const atRoot = shelf.currentFolderId === null;
  const pendingExplanations = atRoot ? byType("create_explanation").length : 0;
  const pendingJourneyCount = atRoot ? pendingJourneys.length : 0;
  const pendingCount = pendingExplanations + pendingJourneyCount;

  const initialLoading =
    (loading || journeysLoading || shelf.foldersLoading) && pendingCount === 0;
  const shownError = error ?? journeysError ?? null;

  const isEmpty =
    !initialLoading &&
    !shownError &&
    shelf.childFolders.length === 0 &&
    currentItems.length === 0 &&
    pendingCount === 0;
  const studyEmpty =
    !initialLoading &&
    !shownError &&
    shelf.folders.length === 0 &&
    items.length === 0 &&
    atRoot &&
    pendingCount === 0;

  const sectionLabel =
    shelf.breadcrumb.length > 0
      ? shelf.breadcrumb[shelf.breadcrumb.length - 1].name
      : "The Study";

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] overflow-hidden flex flex-col pb-20 md:pb-0">
      <div className="relative mx-auto w-full max-w-3xl flex-1 flex flex-col px-6 md:px-8">
        {/* Masthead */}
        <header className="pt-8 md:pt-10">
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>Metis · The Study</span>
            <span className="hidden sm:inline">
              {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        <main className="flex-1 py-10 md:py-12">
          {/* Hero */}
          <section className="mb-10 animate-blur-in">
            <p className="label-whisper text-text-tertiary mb-3">Paths &amp; problems</p>
            <h1 className="display-hero text-5xl text-foreground">Studies</h1>
            <div
              className="h-px w-12 mt-5 mb-4 animate-reveal-line"
              style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
            />
            <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-md">
              Journeys to walk and problems unknotted. Every study you've begun, shelved as you please.
            </p>
          </section>

          {/* Breadcrumb */}
          <FolderBreadcrumb
            breadcrumb={shelf.breadcrumb}
            isHotTarget={shelf.isHotTarget}
            onNavigate={shelf.setCurrentFolderId}
          />

          {/* Section rule — label · live count/progress · new-folder affordance */}
          <div className="mt-6 flex items-center gap-4">
            <span className="label-whisper shrink-0 text-text-tertiary">{sectionLabel}</span>
            {currentItems.length > 0 && (
              <span className="label-whisper shrink-0 text-text-tertiary/70 tabular-nums">
                {currentItems.length} {currentItems.length === 1 ? "study" : "studies"}
                {viewTotal > 0 && (
                  <span className="ml-1 text-text-tertiary/50">
                    · {viewCompleted}/{viewTotal} steps
                  </span>
                )}
              </span>
            )}
            <div className="h-px flex-1 bg-border/30" />
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

          {/* Loading */}
          {initialLoading && (
            <div className="flex justify-center gap-1 py-16 text-text-tertiary">
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
            </div>
          )}

          {shownError && !initialLoading && (
            <div className="mt-6 rounded-xl bg-surface p-6 text-center text-sm text-text-secondary">
              {shownError}
            </div>
          )}

          {/* Whole-study empty state */}
          {studyEmpty && (
            <div className="flex flex-col items-center py-24 text-center animate-blur-in">
              <span className="display-hero text-[8rem] text-foreground/[0.06] select-none leading-none mb-6">
                ∴
              </span>
              <p className="font-display italic text-base text-foreground/70 max-w-sm leading-relaxed mb-2">
                Nothing studied yet.
              </p>
              <p className="text-sm text-text-tertiary max-w-xs leading-relaxed">
                Set a journey from a book, or bring a problem to the Crossroads. Everything you learn is shelved here.
              </p>
            </div>
          )}

          {/* Empty shelf */}
          {isEmpty && !studyEmpty && (
            <div className="flex flex-col items-center py-20 text-center animate-blur-in">
              <span className="display-hero text-[6rem] text-foreground/[0.05] select-none leading-none mb-4">
                ◇
              </span>
              <p className="font-display italic text-sm text-foreground/70 max-w-xs leading-relaxed">
                This folder is empty. Drag a study here, or nest another folder inside.
              </p>
            </div>
          )}

          {/* Contents */}
          {!initialLoading && !shownError && !isEmpty && (
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

              {/* Pending journeys (always land at root) */}
              {pendingJourneyCount > 0 &&
                pendingJourneys.map((j) => (
                  <div
                    key={j.tempId}
                    className="flex items-start gap-5 border-b border-border/20 py-7 animate-blur-in"
                  >
                    <div className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded bg-surface" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-baseline justify-between gap-4">
                        <div className="h-3.5 w-48 animate-pulse rounded bg-surface" />
                        <div className="h-3 w-8 shrink-0 animate-pulse rounded-full bg-surface" />
                      </div>
                      {j.chapterTitle ? (
                        <p className="mb-3 font-display text-xs italic text-text-tertiary leading-snug">
                          <span className="label-whisper mr-2 text-text-tertiary/90">Journey</span>
                          charting from {j.chapterTitle}
                        </p>
                      ) : (
                        <div className="mb-3 h-2.5 w-28 animate-pulse rounded-full bg-surface" />
                      )}
                      <div className="flex gap-[3px]">
                        {[1, 2, 3].map((k) => (
                          <div
                            key={k}
                            className="h-[3px] flex-1 animate-pulse rounded-full bg-surface"
                            style={{ animationDelay: `${k * 100}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="mt-1.5 flex shrink-0 items-center gap-0.5">
                      <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                      <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                    </span>
                  </div>
                ))}

              {/* Pending explanations (always land at root) */}
              {Array.from({ length: pendingExplanations }).map((_, k) => (
                <div
                  key={`pending-exp-${k}`}
                  className="flex items-start gap-5 border-b border-border/20 py-7 animate-blur-in"
                >
                  <div className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded bg-surface" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <div className="h-3.5 w-52 animate-pulse rounded bg-surface" />
                      <div className="h-3 w-8 shrink-0 animate-pulse rounded-full bg-surface" />
                    </div>
                    <p className="mb-3 font-display text-xs italic text-text-tertiary">
                      <span className="label-whisper mr-2 text-text-tertiary/90">Explainer</span>
                      charting the route…
                    </p>
                    <div className="flex gap-[3px]">
                      {[1, 2, 3, 4, 5].map((k2) => (
                        <div
                          key={k2}
                          className="h-[3px] flex-1 animate-pulse rounded-full bg-surface"
                          style={{ animationDelay: `${k2 * 90}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="mt-1.5 flex shrink-0 items-center gap-0.5">
                    <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                    <span className="thinking-dot h-1 w-1 rounded-full bg-text-tertiary" />
                  </span>
                </div>
              ))}

              {/* Studies */}
              {currentItems.map((item, i) => {
                const glyph = journeyGlyph(item.id);
                const started = item.completed > 0;
                const complete = item.total > 0 && item.completed >= item.total;
                return (
                  <div
                    key={item.key}
                    className={cn(
                      "group relative border-b border-border/20 last:border-0 animate-blur-in opacity-0",
                      isDraggingStudy(item) && "opacity-40",
                    )}
                    style={{ animationDelay: `${Math.min((shelf.childFolders.length + i) * 45, 360)}ms` }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) =>
                        shelf.beginDrag({ type: "leaf", key: item.key }, item.title, e)
                      }
                      onClick={() => {
                        if (shelf.draggedRef.current) return;
                        void openStudy(item);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          void openStudy(item);
                        }
                      }}
                      className="flex w-full cursor-pointer select-none items-start gap-5 py-7 -mx-2 px-2 rounded-lg text-left transition-colors duration-200 hover:bg-surface-hover/40 focus:outline-none"
                    >
                      <span
                        className="w-8 shrink-0 pt-0.5 font-display text-3xl italic select-none transition-opacity duration-200 group-hover:opacity-80"
                        style={{
                          color: "hsl(var(--amber))",
                          opacity: complete ? 0.75 : started ? 0.55 : 0.35,
                        }}
                      >
                        {glyph}
                      </span>

                      <div className="min-w-0 flex-1 pr-12">
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="font-display text-sm italic text-foreground leading-snug">
                            {item.title}
                          </p>
                          <span className="flex shrink-0 items-center gap-1.5 label-whisper text-text-tertiary tabular-nums">
                            {complete && <span className="h-1 w-1 rounded-full bg-amber/60" aria-hidden />}
                            {item.completed}/{item.total}
                          </span>
                        </div>

                        <p className="mt-1 flex items-center gap-2 leading-snug">
                          <span className="label-whisper text-text-tertiary/90">{item.kindLabel}</span>
                          {item.subtitle && (
                            <>
                              <span className="text-text-tertiary/40" aria-hidden>
                                ·
                              </span>
                              <span className="font-display text-xs italic text-text-tertiary">
                                {item.subtitle}
                              </span>
                            </>
                          )}
                        </p>

                        <div className="mt-3 flex gap-[3px]">
                          {item.segments.length > 0 ? (
                            item.segments.map((fill, idx) => (
                              <div
                                key={idx}
                                className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/25"
                              >
                                <div
                                  className="h-full rounded-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
                                  style={{
                                    width: `${fill * 100}%`,
                                    backgroundColor: "hsl(var(--amber))",
                                    opacity: 0.75,
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="h-[3px] flex-1 rounded-full bg-border/15" />
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteItem(item)}
                      className="absolute right-1 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 scale-90 place-items-center rounded-full text-text-tertiary opacity-0 transition-all duration-200 hover:text-foreground group-hover:scale-100 group-hover:opacity-100"
                      aria-label={`Delete ${item.kindLabel.toLowerCase()}`}
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Delete study confirmation */}
        <AlertDialog open={deleteItem !== null} onOpenChange={(o) => { if (!o) setDeleteItem(null); }}>
          <AlertDialogContent className="max-w-sm border-border/60 bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display italic text-base font-normal text-foreground">
                Remove this {deleteItem?.kindLabel.toLowerCase() ?? "study"}?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-display text-sm italic text-text-secondary leading-relaxed">
                <span className="text-foreground/80">{deleteItem?.title ?? "This study"}</span> and all its
                dialogues will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2">
              <AlertDialogCancel className="font-display italic text-sm border-border/50 bg-transparent text-text-secondary hover:bg-surface-hover/40 hover:text-foreground">
                Keep it
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteItem}
                className="font-display italic text-sm bg-foreground/90 text-background hover:bg-foreground"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete folder confirmation */}
        <AlertDialog open={deleteFol !== null} onOpenChange={(o) => { if (!o) setDeleteFol(null); }}>
          <AlertDialogContent className="max-w-sm border-border/60 bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display italic text-base font-normal text-foreground">
                Remove this shelf?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-display text-sm italic text-text-secondary leading-relaxed">
                <span className="text-foreground/80">{deleteFol?.name}</span> will be removed. Anything inside it
                moves up to where the shelf lived; nothing is lost.
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

        {/* Colophon */}
        <footer className="pb-8 md:pb-10">
          <div className="h-px w-full bg-border/30 mb-4" />
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>μῆτις · gr. mêtis — cunning intelligence</span>
            <span>—  fol. iii  —</span>
          </div>
        </footer>
      </div>

      {/* Drag ghost — follows the pointer (HTML5 DnD is unavailable under Tauri) */}
      {shelf.dragItem && shelf.dragPos && (
        <div
          className="pointer-events-none fixed z-[60] flex items-center gap-2 rounded-lg border border-border/40 bg-card/95 px-3 py-2 shadow-large backdrop-blur-sm"
          style={{ left: shelf.dragPos.x + 14, top: shelf.dragPos.y + 14, maxWidth: "20rem" }}
        >
          {shelf.dragItem.type === "folder" ? (
            <FolderIcon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} />
          ) : (
            <span
              className="font-display text-base italic leading-none"
              style={{ color: "hsl(var(--amber))" }}
            >
              {journeyGlyph(Number(shelf.dragItem.key.split("-")[1]))}
            </span>
          )}
          <span className="truncate font-display text-xs italic text-foreground">{shelf.dragLabel}</span>
        </div>
      )}
    </div>
  );
}
