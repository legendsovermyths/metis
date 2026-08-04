import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  cancelAgentInput,
  subscribeAgentInput,
  submitAgentInput,
  type AgentInputRequest,
} from "@/lib/service";
import { MaterialCanvas } from "@/components/upload/MaterialCanvas";
import { useMaterialStaging } from "@/components/upload/useMaterialStaging";

export function AgentInputDialog() {
  const [request, setRequest] = useState<AgentInputRequest | null>(null);
  const staging = useMaterialStaging(!!request);

  // Guards against double-resolving the backend channel (submit + close).
  const finishedRef = useRef(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let active = true;
    subscribeAgentInput((req) => {
      finishedRef.current = false;
      staging.reset();
      setRequest(req);
    }).then((fn) => {
      if (active) unlisten = fn;
      else fn();
    });
    return () => {
      active = false;
      unlisten?.();
    };
    // staging.reset is stable (useCallback); intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (cancelled: boolean) => {
    if (!request || finishedRef.current) return;
    finishedRef.current = true;
    const id = request.request_id;
    const inputs = staging.buildInputs();
    const notes = request.notes ?? "";
    setRequest(null);
    if (cancelled) void cancelAgentInput(id);
    else void submitAgentInput(id, inputs, notes);
  };

  const canSubmit = staging.count > 0;

  return (
    <Dialog
      open={!!request}
      onOpenChange={(o) => {
        if (!o) finish(true);
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
          <p className="label-whisper text-text-tertiary mb-2">Metis is asking</p>
          <DialogTitle className="font-display text-2xl text-foreground">
            {request?.title ?? "Add your material"}
          </DialogTitle>
          <div
            className="h-px w-10 mt-4 mb-4 animate-reveal-line"
            style={{ backgroundColor: "hsl(var(--amber))", transformOrigin: "left" }}
          />
          <DialogDescription className="relative font-display italic text-[15px] leading-relaxed text-text-secondary">
            <span
              aria-hidden
              className="absolute -left-3 -top-2 font-display not-italic text-2xl"
              style={{ color: "hsl(var(--amber) / 0.4)" }}
            >
              “
            </span>
            {request?.prompt ?? "Share whatever you'd like me to work from."}
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
              Share with Metis
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
