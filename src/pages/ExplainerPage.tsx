import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Folder as FolderIcon, FolderOpen, FolderPlus, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { journeyGlyph, useMasthead, mastheadStyle } from "@/lib/editorial";
import { useTasks } from "@/context/TasksContext";
import {
  createFolder,
  deleteExplanation,
  deleteFolder,
  getAllExplanations,
  getFolders,
  moveExplanation,
  moveFolder,
  renameFolder,
  teachingInit,
  type ExplanationRow,
  type Folder,
} from "@/lib/service";
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

type DragItem = { type: "explanation" | "folder"; id: number };
type DropTarget = number | "root" | null;

export default function ExplainerPage() {
  const navigate = useNavigate();
  const masthead = useMasthead();
  const { byType, onTaskDone } = useTasks();

  const [explanations, setExplanations] = useState<ExplanationRow[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [starting, setStarting] = useState<number | null>(null);

  // Folder editing state
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Deletion targets
  const [deleteExp, setDeleteExp] = useState<ExplanationRow | null>(null);
  const [deleteFol, setDeleteFol] = useState<Folder | null>(null);

  // Pointer-based drag & drop (HTML5 DnD is swallowed by Tauri's webview file-drop)
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragLabel, setDragLabel] = useState<string>("");
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const sessionRef = useRef<{ item: DragItem; started: boolean } | null>(null);
  const draggedRef = useRef(false);

  const newFolderRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      const [ex, fo] = await Promise.all([getAllExplanations(), getFolders()]);
      setExplanations(ex);
      setFolders(fo);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // A finished create_explanation task drops a fresh explanation into the cabinet.
  useEffect(() => onTaskDone(() => void refresh()), [onTaskDone, refresh]);

  useEffect(() => {
    if (creatingFolder) newFolderRef.current?.focus();
  }, [creatingFolder]);
  useEffect(() => {
    if (renamingId != null) renameRef.current?.select();
  }, [renamingId]);

  // ── Tree helpers ──────────────────────────────────────────────────────────
  const childFolders = useMemo(
    () =>
      folders
        .filter((f) => f.parent_id === currentFolderId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [folders, currentFolderId],
  );

  const folderCounts = useMemo(() => {
    const counts = new Map<number, number>();
    const bump = (id: number | null) => {
      if (id != null) counts.set(id, (counts.get(id) ?? 0) + 1);
    };
    folders.forEach((f) => bump(f.parent_id));
    explanations.forEach((e) => bump(e.folder_id));
    return counts;
  }, [folders, explanations]);

  const currentExplanations = useMemo(
    () => explanations.filter((e) => (e.folder_id ?? null) === currentFolderId),
    [explanations, currentFolderId],
  );

  const breadcrumb = useMemo(() => {
    const trail: Folder[] = [];
    let id = currentFolderId;
    const byId = new Map(folders.map((f) => [f.id, f]));
    while (id != null) {
      const f = byId.get(id);
      if (!f) break;
      trail.unshift(f);
      id = f.parent_id;
    }
    return trail;
  }, [currentFolderId, folders]);

  // Descendant set of a folder (to forbid dropping a folder into its own subtree).
  const descendantsOf = useCallback(
    (folderId: number): Set<number> => {
      const out = new Set<number>();
      const stack = [folderId];
      while (stack.length) {
        const cur = stack.pop()!;
        for (const f of folders) {
          if (f.parent_id === cur && !out.has(f.id)) {
            out.add(f.id);
            stack.push(f.id);
          }
        }
      }
      return out;
    },
    [folders],
  );

  // ── Folder actions ────────────────────────────────────────────────────────
  const submitNewFolder = useCallback(async () => {
    const name = newFolderName.trim();
    setCreatingFolder(false);
    setNewFolderName("");
    if (!name) return;
    try {
      await createFolder(name, currentFolderId);
      await refresh();
    } catch {
      /* surfaced via toast */
    }
  }, [newFolderName, currentFolderId, refresh]);

  const submitRename = useCallback(async () => {
    const id = renamingId;
    const name = renameValue.trim();
    setRenamingId(null);
    if (id == null || !name) return;
    try {
      await renameFolder(id, name);
      await refresh();
    } catch {
      /* surfaced via toast */
    }
  }, [renamingId, renameValue, refresh]);

  const confirmDeleteExp = useCallback(async () => {
    if (!deleteExp) return;
    try {
      await deleteExplanation(deleteExp.id);
      await refresh();
    } finally {
      setDeleteExp(null);
    }
  }, [deleteExp, refresh]);

  const confirmDeleteFol = useCallback(async () => {
    if (!deleteFol) return;
    try {
      await deleteFolder(deleteFol.id);
      await refresh();
    } finally {
      setDeleteFol(null);
    }
  }, [deleteFol, refresh]);

  const openExplanation = useCallback(
    async (row: ExplanationRow) => {
      if (starting != null) return;
      setStarting(row.id);
      try {
        await teachingInit("Explanation", row.id);
        navigate("/teach");
      } catch {
        setStarting(null);
      }
    },
    [starting, navigate],
  );

  // ── Pointer-based drag & drop ───────────────────────────────────────────────
  const canDrop = useCallback(
    (item: DragItem, target: DropTarget): boolean => {
      if (target == null) return false;
      const targetId = target === "root" ? null : target;
      if (item.type === "folder") {
        if (target !== "root" && target === item.id) return false;
        if (target !== "root" && descendantsOf(item.id).has(target)) return false;
        const self = folders.find((f) => f.id === item.id);
        return !(self && (self.parent_id ?? null) === targetId);
      }
      const self = explanations.find((e) => e.id === item.id);
      return !(self && (self.folder_id ?? null) === targetId);
    },
    [descendantsOf, folders, explanations],
  );

  // True only while an active drag could legally land on `target` — drives highlight.
  const isHotTarget = (target: DropTarget) =>
    dragItem != null && dropTarget === target && canDrop(dragItem, target);

  const performDropFor = useCallback(
    async (item: DragItem, target: DropTarget) => {
      if (!canDrop(item, target)) return;
      const targetId = target === "root" ? null : target;
      try {
        if (item.type === "folder") await moveFolder(item.id, targetId);
        else await moveExplanation(item.id, targetId);
        await refresh();
      } catch {
        /* surfaced via toast */
      }
    },
    [canDrop, refresh],
  );

  const targetUnderPointer = (x: number, y: number): DropTarget => {
    const el = document.elementFromPoint(x, y)?.closest("[data-drop-id]");
    const raw = el?.getAttribute("data-drop-id");
    if (raw == null) return null;
    return raw === "root" ? "root" : Number(raw);
  };

  const beginDrag = useCallback(
    (item: DragItem, label: string, e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const startX = e.clientX;
      const startY = e.clientY;
      sessionRef.current = { item, started: false };

      const onMove = (ev: PointerEvent) => {
        const sess = sessionRef.current;
        if (!sess) return;
        if (!sess.started) {
          if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < 6) return;
          sess.started = true;
          // Kill page text-selection for the duration of the drag.
          document.body.style.userSelect = "none";
          document.body.style.setProperty("-webkit-user-select", "none");
          window.getSelection()?.removeAllRanges();
          setDragItem(item);
          setDragLabel(label);
        }
        ev.preventDefault();
        window.getSelection()?.removeAllRanges();
        setDragPos({ x: ev.clientX, y: ev.clientY });
        setDropTarget(targetUnderPointer(ev.clientX, ev.clientY));
      };

      const onUp = (ev: PointerEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.userSelect = "";
        document.body.style.removeProperty("-webkit-user-select");
        const sess = sessionRef.current;
        sessionRef.current = null;
        if (sess?.started) {
          draggedRef.current = true;
          setTimeout(() => (draggedRef.current = false), 0);
          void performDropFor(sess.item, targetUnderPointer(ev.clientX, ev.clientY));
        }
        setDragItem(null);
        setDragPos(null);
        setDropTarget(null);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [performDropFor],
  );

  const pendingCreates = byType("create_explanation").length;
  const showRootPending = currentFolderId === null ? pendingCreates : 0;
  const isEmpty =
    !loading &&
    !error &&
    childFolders.length === 0 &&
    currentExplanations.length === 0 &&
    showRootPending === 0;
  const cabinetEmpty = !loading && !error && folders.length === 0 && explanations.length === 0;

  return (
    <div className="paper-texture relative min-h-[calc(100vh-57px)] overflow-hidden flex flex-col pb-20 md:pb-0">
      <div className="relative mx-auto w-full max-w-3xl flex-1 flex flex-col px-6 md:px-8">
        {/* Masthead */}
        <header className="pt-8 md:pt-10">
          <div className="flex items-baseline justify-between text-text-tertiary" style={mastheadStyle}>
            <span>Metis · Cabinet of Explanations</span>
            <span className="hidden sm:inline">
              {masthead.weekday} · {masthead.day} {masthead.month} · {masthead.yearRoman}
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-border/40" />
        </header>

        <main className="flex-1 py-10 md:py-12">
          {/* Hero */}
          <section className="mb-10 animate-blur-in">
            <p className="label-whisper text-text-tertiary mb-3">Worked problems</p>
            <h1 className="display-hero text-5xl text-foreground">Explanations</h1>
            <div
              className="h-px w-12 mt-5 mb-4 animate-reveal-line"
              style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
            />
            <p className="font-display italic text-base text-text-secondary leading-relaxed max-w-md">
              Problems unknotted step by step, each one a route walked from grasp to application.
            </p>
          </section>

          {/* Breadcrumb — only when nested; "All" doubles as the move-to-root drop target */}
          {breadcrumb.length > 0 && (
            <nav className="mb-3 flex flex-wrap items-center gap-x-0.5 gap-y-1">
              <Crumb
                label="All"
                dropId="root"
                active={false}
                hot={isHotTarget("root")}
                onClick={() => setCurrentFolderId(null)}
              />
              {breadcrumb.map((f, i) => (
                <div key={f.id} className="flex items-center gap-x-0.5">
                  <ChevronRight className="h-3 w-3 shrink-0 text-text-tertiary/40" strokeWidth={1.5} />
                  <Crumb
                    label={f.name}
                    dropId={String(f.id)}
                    active={i === breadcrumb.length - 1}
                    hot={isHotTarget(f.id)}
                    onClick={() => setCurrentFolderId(f.id)}
                  />
                </div>
              ))}
            </nav>
          )}

          {/* Section rule + new-folder affordance */}
          <div className="mt-6 flex items-center gap-4">
            <span className="label-whisper shrink-0 text-text-tertiary">
              {breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].name : "The Cabinet"}
            </span>
            <div className="h-px flex-1 bg-border/30" />
            <button
              onClick={() => setCreatingFolder(true)}
              className="group/nf flex shrink-0 items-center gap-1.5 rounded-full border border-border/40 px-3 py-1 text-text-tertiary transition-all duration-200 hover:border-amber/40 hover:text-foreground"
            >
              <FolderPlus
                className="h-3.5 w-3.5 transition-colors group-hover/nf:text-amber"
                strokeWidth={1.5}
              />
              <span className="label-whisper">New folder</span>
            </button>
          </div>

          {/* New folder inline composer */}
          {creatingFolder && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber/30 bg-surface/40 px-4 py-3 animate-blur-in">
              <FolderOpen
                className="h-4 w-4 shrink-0"
                strokeWidth={1.5}
                style={{ color: "hsl(var(--amber))" }}
              />
              <input
                ref={newFolderRef}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitNewFolder();
                  if (e.key === "Escape") {
                    setCreatingFolder(false);
                    setNewFolderName("");
                  }
                }}
                onBlur={() => void submitNewFolder()}
                placeholder="name this folder…"
                className="min-w-0 flex-1 bg-transparent font-display text-sm italic text-foreground placeholder:text-text-tertiary placeholder:italic focus:outline-none"
              />
              <span className="label-whisper shrink-0 text-text-tertiary">↵ to set</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center gap-1 py-16 text-text-tertiary">
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
              <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current" />
            </div>
          )}

          {error && !loading && (
            <div className="mt-6 rounded-xl bg-surface p-6 text-center text-sm text-text-secondary">
              {error}
            </div>
          )}

          {/* Whole-cabinet empty state */}
          {cabinetEmpty && (
            <div className="flex flex-col items-center py-24 text-center animate-blur-in">
              <span className="display-hero text-[8rem] text-foreground/[0.06] select-none leading-none mb-6">
                ∴
              </span>
              <p className="font-display italic text-base text-foreground/70 max-w-sm leading-relaxed mb-2">
                Nothing explained yet.
              </p>
              <p className="text-sm text-text-tertiary max-w-xs leading-relaxed">
                Bring a problem and its solution to the Crossroads. Metis will chart the route and shelve it here.
              </p>
            </div>
          )}

          {/* Empty shelf (folder has nothing) */}
          {isEmpty && !cabinetEmpty && (
            <div className="flex flex-col items-center py-20 text-center animate-blur-in">
              <span className="display-hero text-[6rem] text-foreground/[0.05] select-none leading-none mb-4">
                ◇
              </span>
              <p className="font-display italic text-sm text-foreground/70 max-w-xs leading-relaxed">
                This folder is empty. Drag an explanation here, or nest another folder inside.
              </p>
            </div>
          )}

          {/* Contents */}
          {!loading && !error && !isEmpty && (
            <div className="mt-1">
              {/* Folders */}
              {childFolders.map((f, i) => {
                const count = folderCounts.get(f.id) ?? 0;
                const isRenaming = renamingId === f.id;
                const hot = isHotTarget(f.id);
                return (
                  <div
                    key={f.id}
                    data-drop-id={f.id}
                    className={cn(
                      "group relative border-b border-border/20 animate-blur-in opacity-0",
                      dragItem?.id === f.id && dragItem.type === "folder" && "opacity-40",
                    )}
                    style={{ animationDelay: `${Math.min(i * 45, 300)}ms` }}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-4 py-5 -mx-2 px-2 rounded-lg transition-colors duration-200",
                        hot ? "bg-amber-soft" : "hover:bg-surface-hover/40",
                      )}
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onPointerDown={(e) => !isRenaming && beginDrag({ type: "folder", id: f.id }, f.name, e)}
                        onClick={() => {
                          if (draggedRef.current || isRenaming) return;
                          setCurrentFolderId(f.id);
                        }}
                        onKeyDown={(e) => {
                          if (!isRenaming && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            setCurrentFolderId(f.id);
                          }
                        }}
                        className="flex min-w-0 flex-1 cursor-pointer select-none items-center gap-4 text-left focus:outline-none"
                      >
                        {hot ? (
                          <FolderOpen
                            className="h-[18px] w-[18px] shrink-0"
                            strokeWidth={1.5}
                            style={{ color: "hsl(var(--amber))" }}
                          />
                        ) : (
                          <FolderIcon
                            className="h-[18px] w-[18px] shrink-0 text-text-tertiary transition-colors group-hover:text-foreground/70"
                            strokeWidth={1.5}
                          />
                        )}
                        {isRenaming ? (
                          <input
                            ref={renameRef}
                            value={renameValue}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void submitRename();
                              if (e.key === "Escape") setRenamingId(null);
                            }}
                            onBlur={() => void submitRename()}
                            className="min-w-0 flex-1 bg-transparent font-display text-sm italic text-foreground focus:outline-none"
                          />
                        ) : (
                          <span className="truncate font-display text-sm italic text-foreground">
                            {f.name}
                          </span>
                        )}
                      </div>

                      <span className="shrink-0 label-whisper text-text-tertiary tabular-nums">
                        {count} {count === 1 ? "item" : "items"}
                      </span>

                      {!isRenaming && (
                        <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setRenamingId(f.id);
                              setRenameValue(f.name);
                            }}
                            className="grid h-7 w-7 place-items-center rounded-full text-text-tertiary transition-colors hover:text-foreground"
                            aria-label="Rename folder"
                          >
                            <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setDeleteFol(f)}
                            className="grid h-7 w-7 place-items-center rounded-full text-text-tertiary transition-colors hover:text-foreground"
                            aria-label="Delete folder"
                          >
                            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      )}

                      {!isRenaming && (
                        <ChevronRight
                          className="h-3.5 w-3.5 shrink-0 text-text-tertiary/40 transition-transform duration-200 group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pending creations (always land at root) */}
              {Array.from({ length: showRootPending }).map((_, k) => (
                <div
                  key={`pending-${k}`}
                  className="flex items-start gap-5 border-b border-border/20 py-7 animate-blur-in"
                >
                  <div className="mt-0.5 h-8 w-8 shrink-0 animate-pulse rounded bg-surface" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <div className="h-3.5 w-52 animate-pulse rounded bg-surface" />
                      <div className="h-3 w-8 shrink-0 animate-pulse rounded-full bg-surface" />
                    </div>
                    <p className="mb-3 font-display text-xs italic text-text-tertiary">
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

              {/* Explanations */}
              {currentExplanations.map((row, i) => {
                const glyph = journeyGlyph(row.id);
                const started = row.completed_steps > 0;
                const complete = row.total_steps > 0 && row.completed_steps >= row.total_steps;
                const total = Math.max(row.total_steps, 1);
                return (
                  <div
                    key={row.id}
                    className={cn(
                      "group relative border-b border-border/20 last:border-0 animate-blur-in opacity-0",
                      dragItem?.id === row.id && dragItem.type === "explanation" && "opacity-40",
                    )}
                    style={{ animationDelay: `${Math.min((childFolders.length + i) * 45, 360)}ms` }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => beginDrag({ type: "explanation", id: row.id }, row.title || "Explanation", e)}
                      onClick={() => {
                        if (draggedRef.current) return;
                        void openExplanation(row);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          void openExplanation(row);
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
                            {row.title || "Untitled explanation"}
                          </p>
                          <span className="shrink-0 label-whisper text-text-tertiary tabular-nums">
                            {row.completed_steps}/{row.total_steps}
                          </span>
                        </div>

                        {starting === row.id ? (
                          <p className="mt-1 font-display text-xs italic text-text-tertiary">
                            opening…
                          </p>
                        ) : (
                          <p className="mt-1 font-display text-xs italic text-text-tertiary leading-snug">
                            a route of {row.total_steps} {row.total_steps === 1 ? "step" : "steps"}
                          </p>
                        )}

                        {/* Step rail — one cell per step (Grasp · Observation · Deduction · Conclusion · Application) */}
                        <div className="mt-3 flex gap-[3px]">
                          {Array.from({ length: total }).map((_, idx) => (
                            <div
                              key={idx}
                              className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/25"
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
                                style={{
                                  width: idx < row.completed_steps ? "100%" : "0%",
                                  backgroundColor: "hsl(var(--amber))",
                                  opacity: 0.75,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteExp(row)}
                      className="absolute right-1 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 scale-90 place-items-center rounded-full text-text-tertiary opacity-0 transition-all duration-200 hover:text-foreground group-hover:scale-100 group-hover:opacity-100"
                      aria-label="Delete explanation"
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Delete explanation confirmation */}
        <AlertDialog open={deleteExp !== null} onOpenChange={(o) => { if (!o) setDeleteExp(null); }}>
          <AlertDialogContent className="max-w-sm border-border/60 bg-background">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display italic text-base font-normal text-foreground">
                Remove this explanation?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-display text-sm italic text-text-secondary leading-relaxed">
                <span className="text-foreground/80">{deleteExp?.title || "This explanation"}</span> and all its
                dialogues will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-2">
              <AlertDialogCancel className="font-display italic text-sm border-border/50 bg-transparent text-text-secondary hover:bg-surface-hover/40 hover:text-foreground">
                Keep it
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteExp}
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
            <span>—  fol. iv  —</span>
          </div>
        </footer>
      </div>

      {/* Drag ghost — follows the pointer (HTML5 DnD is unavailable under Tauri) */}
      {dragItem && dragPos && (
        <div
          className="pointer-events-none fixed z-[60] flex items-center gap-2 rounded-lg border border-border/40 bg-card/95 px-3 py-2 shadow-large backdrop-blur-sm"
          style={{ left: dragPos.x + 14, top: dragPos.y + 14, maxWidth: "20rem" }}
        >
          {dragItem.type === "folder" ? (
            <FolderIcon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} />
          ) : (
            <span className="font-display text-base italic leading-none" style={{ color: "hsl(var(--amber))" }}>
              ∂
            </span>
          )}
          <span className="truncate font-display text-xs italic text-foreground">{dragLabel}</span>
        </div>
      )}
    </div>
  );
}

function Crumb({
  label,
  dropId,
  active,
  hot,
  onClick,
}: {
  label: string;
  dropId: string;
  active: boolean;
  hot: boolean;
  onClick: () => void;
}) {
  return (
    <button
      data-drop-id={dropId}
      onClick={onClick}
      className={cn(
        "rounded-md px-1.5 py-0.5 font-display text-sm italic transition-colors duration-150",
        active ? "text-foreground" : "text-text-tertiary hover:text-foreground/70",
        hot && "bg-amber-soft text-foreground",
      )}
    >
      {label}
    </button>
  );
}
