import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createFolder,
  deleteFolder,
  getFolders,
  moveFolder,
  renameFolder,
  type Folder,
  type FolderScope,
} from "@/lib/service";

/** A filed, draggable leaf (a study or a note) as the shelf needs to see it. */
export interface FolderLeaf {
  key: string;
  folderId: number | null;
}

export type FolderDragItem =
  | { type: "folder"; id: number }
  | { type: "leaf"; key: string };

export type DropTarget = number | "root" | null;

interface Args {
  scope: FolderScope;
  leaves: FolderLeaf[];
  /** Reparent a leaf. */
  moveLeaf: (key: string, folderId: number | null) => Promise<void>;
  /** Reload the owning collection (leaves) after a move/folder-delete. */
  reloadLeaves: () => Promise<void>;
}

/**
 * All folder-tree state and pointer-drag machinery, shared by every shelf
 * (Studies, Notebook). The consumer owns its leaves and how a leaf moves;
 * the shelf owns folders, navigation, rename/create/delete, and drag.
 */
export function useFolderShelf({ scope, leaves, moveLeaf, reloadLeaves }: Args) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [dragItem, setDragItem] = useState<FolderDragItem | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragLabel, setDragLabel] = useState("");
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const sessionRef = useRef<{ item: FolderDragItem; started: boolean } | null>(null);
  const draggedRef = useRef(false);

  const newFolderRef = useRef<HTMLInputElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  const refreshFolders = useCallback(async () => {
    try {
      setFolders(await getFolders(scope));
    } finally {
      setFoldersLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    void refreshFolders();
  }, [refreshFolders]);

  useEffect(() => {
    if (creatingFolder) newFolderRef.current?.focus();
  }, [creatingFolder]);
  useEffect(() => {
    if (renamingId != null) renameRef.current?.select();
  }, [renamingId]);

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
    leaves.forEach((l) => bump(l.folderId));
    return counts;
  }, [folders, leaves]);

  const currentLeafKeys = useMemo(
    () => new Set(leaves.filter((l) => l.folderId === currentFolderId).map((l) => l.key)),
    [leaves, currentFolderId],
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

  const submitNewFolder = useCallback(async () => {
    const name = newFolderName.trim();
    setCreatingFolder(false);
    setNewFolderName("");
    if (!name) return;
    try {
      await createFolder(name, currentFolderId, scope);
      await refreshFolders();
    } catch {
      /* surfaced via toast */
    }
  }, [newFolderName, currentFolderId, scope, refreshFolders]);

  const submitRename = useCallback(async () => {
    const id = renamingId;
    const name = renameValue.trim();
    setRenamingId(null);
    if (id == null || !name) return;
    try {
      await renameFolder(id, name);
      await refreshFolders();
    } catch {
      /* surfaced via toast */
    }
  }, [renamingId, renameValue, refreshFolders]);

  const beginRename = useCallback((f: Folder) => {
    setRenamingId(f.id);
    setRenameValue(f.name);
  }, []);

  const removeFolder = useCallback(
    async (id: number) => {
      await deleteFolder(id);
      await Promise.all([refreshFolders(), reloadLeaves()]);
    },
    [refreshFolders, reloadLeaves],
  );

  // ── Pointer-based drag & drop (HTML5 DnD is swallowed by Tauri's webview) ──
  const canDrop = useCallback(
    (item: FolderDragItem, target: DropTarget): boolean => {
      if (target == null) return false;
      const targetId = target === "root" ? null : target;
      if (item.type === "folder") {
        if (target !== "root" && target === item.id) return false;
        if (target !== "root" && descendantsOf(item.id).has(target)) return false;
        const self = folders.find((f) => f.id === item.id);
        return !(self && (self.parent_id ?? null) === targetId);
      }
      const self = leaves.find((l) => l.key === item.key);
      return !(self && self.folderId === targetId);
    },
    [descendantsOf, folders, leaves],
  );

  const isHotTarget = useCallback(
    (target: DropTarget) =>
      dragItem != null && dropTarget === target && canDrop(dragItem, target),
    [dragItem, dropTarget, canDrop],
  );

  const performDropFor = useCallback(
    async (item: FolderDragItem, target: DropTarget) => {
      if (!canDrop(item, target)) return;
      const targetId = target === "root" ? null : target;
      try {
        if (item.type === "folder") {
          await moveFolder(item.id, targetId);
          await Promise.all([refreshFolders(), reloadLeaves()]);
        } else {
          await moveLeaf(item.key, targetId);
          await reloadLeaves();
        }
      } catch {
        /* surfaced via toast */
      }
    },
    [canDrop, refreshFolders, reloadLeaves, moveLeaf],
  );

  const targetUnderPointer = (x: number, y: number): DropTarget => {
    const el = document.elementFromPoint(x, y)?.closest("[data-drop-id]");
    const raw = el?.getAttribute("data-drop-id");
    if (raw == null) return null;
    return raw === "root" ? "root" : Number(raw);
  };

  const beginDrag = useCallback(
    (item: FolderDragItem, label: string, e: React.PointerEvent) => {
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

  return {
    folders,
    foldersLoading,
    currentFolderId,
    setCurrentFolderId,
    childFolders,
    folderCounts,
    currentLeafKeys,
    breadcrumb,
    refreshFolders,
    // folder create / rename / delete
    creatingFolder,
    setCreatingFolder,
    newFolderName,
    setNewFolderName,
    newFolderRef,
    submitNewFolder,
    renamingId,
    renameValue,
    setRenameValue,
    setRenamingId,
    renameRef,
    submitRename,
    beginRename,
    removeFolder,
    // drag
    dragItem,
    dragPos,
    dragLabel,
    draggedRef,
    beginDrag,
    isHotTarget,
  };
}
