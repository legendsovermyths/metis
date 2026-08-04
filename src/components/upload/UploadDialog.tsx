import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useResources } from "@/context/ResourceContext";
import { MaterialCanvas } from "./MaterialCanvas";
import { useMaterialStaging, prettyHost } from "./useMaterialStaging";

/** Manual "add material" surface — the same canvas the agent uses, no agent waiting. */
export function UploadDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const staging = useMaterialStaging(open);
  const { upload } = useResources();

  const labelFor = (): string => {
    const first = staging.items[0];
    if (first) return first.kind === "url" ? prettyHost(first.url) : first.name;
    const t = staging.text.trim();
    return t ? (t.length > 40 ? `${t.slice(0, 40)}…` : t) : "New material";
  };

  const submit = () => {
    if (staging.count === 0) return;
    upload(staging.buildInputs(), labelFor());
    staging.reset();
    onOpenChange(false);
  };

  const canSubmit = staging.count > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) staging.reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-w-xl border-border bg-card p-0 overflow-hidden gap-0">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-10 select-none font-display italic leading-none"
          style={{ fontSize: "14rem", color: "hsl(var(--foreground) / 0.025)" }}
        >
          M
        </span>

        <div className="relative px-7 pt-7 pb-5">
          <p className="label-whisper text-text-tertiary mb-2">A new acquisition</p>
          <DialogTitle className="font-display text-2xl text-foreground">Add material</DialogTitle>
          <div
            className="h-px w-10 mt-4 mb-4 animate-reveal-line"
            style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
          />
          <DialogDescription className="font-display italic text-[15px] leading-relaxed text-text-secondary">
            A book, a paper, an article — drop it here and Metis will shelve it.
          </DialogDescription>
        </div>

        <div className="relative px-7 pb-3">
          <MaterialCanvas staging={staging} />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/40 px-7 py-3">
          <span className="text-xs text-text-tertiary">
            {staging.count === 0
              ? "Nothing added yet"
              : `${staging.count} ${staging.count === 1 ? "piece" : "pieces"} ready`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submit}
              className={cn(
                "rounded-xl px-5 py-2 text-sm font-medium shadow-soft transition-all",
                canSubmit
                  ? "bg-foreground text-background hover:opacity-90"
                  : "cursor-not-allowed bg-surface text-text-tertiary",
              )}
            >
              Shelve it
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
