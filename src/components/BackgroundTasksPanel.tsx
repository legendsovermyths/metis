import { useState } from "react";
import { Activity, Loader2, AlertTriangle } from "lucide-react";
import { useTasks } from "@/context/TasksContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BackgroundTask } from "@/lib/service";

const TASK_LABELS: Record<string, string> = {
  analyse_book: "Analysing book",
  create_journey: "Creating journey",
  generate_dialogues: "Preparing dialogues",
};

function describeTask(task: BackgroundTask): string {
  const label = TASK_LABELS[task.name] ?? task.name;
  const params = task.params ?? {};
  switch (task.name) {
    case "analyse_book": {
      const path = typeof params.path === "string" ? params.path : "";
      const file = path.split(/[\\/]/).pop() || path;
      return file ? `${label}: ${file}` : label;
    }
    case "create_journey": {
      const chapter = typeof params.chapter_title === "string" ? params.chapter_title : "";
      return chapter ? `${label}: ${chapter}` : label;
    }
    case "generate_dialogues": {
      const id = params.id;
      return id != null ? `${label} (journey ${id})` : label;
    }
    default:
      return label;
  }
}

function progressSummary(task: BackgroundTask): string | null {
  const cp = task.checkpoint;
  if (!cp || typeof cp !== "object") return null;
  const obj = cp as Record<string, unknown>;
  if (typeof obj.count === "number") return `${obj.count} done`;
  return null;
}

export function BackgroundTasksPanel() {
  const { active, loading } = useTasks();
  const [open, setOpen] = useState(false);
  const count = active.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Background tasks"
          className={cn(
            "fixed bottom-20 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card shadow-lg transition-colors hover:bg-accent md:bottom-4",
            count > 0 && "border-primary",
          )}
        >
          {count > 0 ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Activity className="h-5 w-5 text-muted-foreground" />
          )}
          {count > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-[10px]"
            >
              {count}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Background tasks</div>
          <div className="text-xs text-muted-foreground">
            {loading
              ? "Loading…"
              : count === 0
                ? "Nothing running."
                : `${count} ${count === 1 ? "task" : "tasks"} running`}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {active.map((task) => {
            const failed = task.status === "Failed";
            const summary = progressSummary(task);
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <div className="mt-0.5">
                  {failed ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{describeTask(task)}</div>
                  <div className="text-xs text-muted-foreground">
                    {failed ? task.error || "Failed" : summary ?? task.status.toLowerCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
