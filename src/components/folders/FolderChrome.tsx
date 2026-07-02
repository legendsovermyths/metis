import { ChevronRight, Folder as FolderIcon, FolderOpen, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/service";
import type { DropTarget } from "./useFolderShelf";

/** Breadcrumb trail; "All" doubles as the move-to-root drop target. */
export function FolderBreadcrumb({
  breadcrumb,
  isHotTarget,
  onNavigate,
}: {
  breadcrumb: Folder[];
  isHotTarget: (t: DropTarget) => boolean;
  onNavigate: (id: number | null) => void;
}) {
  if (breadcrumb.length === 0) return null;
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-x-0.5 gap-y-1">
      <Crumb label="All" dropId="root" active={false} hot={isHotTarget("root")} onClick={() => onNavigate(null)} />
      {breadcrumb.map((f, i) => (
        <div key={f.id} className="flex items-center gap-x-0.5">
          <ChevronRight className="h-3 w-3 shrink-0 text-text-tertiary/40" strokeWidth={1.5} />
          <Crumb
            label={f.name}
            dropId={String(f.id)}
            active={i === breadcrumb.length - 1}
            hot={isHotTarget(f.id)}
            onClick={() => onNavigate(f.id)}
          />
        </div>
      ))}
    </nav>
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

/** Inline composer for naming a new folder. */
export function NewFolderComposer({
  show,
  inputRef,
  value,
  onChange,
  onSubmit,
  onCancel,
}: {
  show: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  if (!show) return null;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber/30 bg-surface/40 px-4 py-3 animate-blur-in">
      <FolderOpen className="h-4 w-4 shrink-0" strokeWidth={1.5} style={{ color: "hsl(var(--amber))" }} />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={onSubmit}
        placeholder="name this folder…"
        className="min-w-0 flex-1 bg-transparent font-display text-sm italic text-foreground placeholder:text-text-tertiary placeholder:italic focus:outline-none"
      />
      <span className="label-whisper shrink-0 text-text-tertiary">↵ to set</span>
    </div>
  );
}

/** One folder row: draggable, openable, renamable, deletable. */
export function FolderRow({
  folder,
  count,
  hot,
  dimmed,
  isRenaming,
  renameValue,
  renameRef,
  animationDelay,
  draggedRef,
  onOpen,
  onBeginDrag,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  onRenameStart,
  onDelete,
}: {
  folder: Folder;
  count: number;
  hot: boolean;
  dimmed: boolean;
  isRenaming: boolean;
  renameValue: string;
  renameRef: React.RefObject<HTMLInputElement>;
  animationDelay: number;
  draggedRef: React.MutableRefObject<boolean>;
  onOpen: () => void;
  onBeginDrag: (e: React.PointerEvent) => void;
  onRenameChange: (v: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onRenameStart: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      data-drop-id={folder.id}
      className={cn(
        "group relative border-b border-border/20 animate-blur-in opacity-0",
        dimmed && "opacity-40",
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
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
          onPointerDown={(e) => !isRenaming && onBeginDrag(e)}
          onClick={() => {
            if (draggedRef.current || isRenaming) return;
            onOpen();
          }}
          onKeyDown={(e) => {
            if (!isRenaming && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onOpen();
            }
          }}
          className="flex min-w-0 flex-1 cursor-pointer select-none items-center gap-4 text-left focus:outline-none"
        >
          {hot ? (
            <FolderOpen className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} style={{ color: "hsl(var(--amber))" }} />
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
              onChange={(e) => onRenameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRenameSubmit();
                if (e.key === "Escape") onRenameCancel();
              }}
              onBlur={onRenameSubmit}
              className="min-w-0 flex-1 bg-transparent font-display text-sm italic text-foreground focus:outline-none"
            />
          ) : (
            <span className="truncate font-display text-sm italic text-foreground">{folder.name}</span>
          )}
        </div>

        <span className="shrink-0 label-whisper text-text-tertiary tabular-nums">
          {count} {count === 1 ? "item" : "items"}
        </span>

        {!isRenaming && (
          <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              onClick={onRenameStart}
              className="grid h-7 w-7 place-items-center rounded-full text-text-tertiary transition-colors hover:text-foreground"
              aria-label="Rename folder"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={onDelete}
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
}
