import { useMemo } from "react";
import { Loader2, AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { useTasks } from "@/context/TasksContext";
import { Button } from "@/components/ui/button";
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
      return file ? `${label} · ${file}` : label;
    }
    case "create_journey": {
      const chapter = typeof params.chapter_title === "string" ? params.chapter_title : "";
      return chapter ? `${label} · ${chapter}` : label;
    }
    case "generate_dialogues": {
      const id = params.id;
      return id != null ? `${label} · journey ${id}` : label;
    }
    default:
      return label;
  }
}

function checkpointSummary(task: BackgroundTask): string | null {
  const cp = task.checkpoint;
  if (!cp || typeof cp !== "object") return null;
  const obj = cp as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof obj.count === "number") parts.push(`${obj.count} produced`);
  if (typeof obj.extracted_chapter_pdf === "boolean" && obj.extracted_chapter_pdf) {
    parts.push("PDF extracted");
  }
  if (typeof obj.content_md === "string" && obj.content_md.length > 0) {
    parts.push("markdown ready");
  }
  if (Array.isArray(obj.topics)) parts.push(`${obj.topics.length} topics`);
  if (obj.journey != null) parts.push("journey drafted");
  if (typeof obj.generated_topic_map === "boolean" && obj.generated_topic_map) {
    parts.push("topic map drawn");
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function StatusBadge({ status }: { status: BackgroundTask["status"] }) {
  const map = {
    Pending: { icon: Clock, cls: "text-muted-foreground", label: "pending" },
    Running: { icon: Loader2, cls: "text-primary", label: "running", spin: true },
    Completed: { icon: CheckCircle2, cls: "text-green-600 dark:text-green-400", label: "completed" },
    Failed: { icon: AlertTriangle, cls: "text-destructive", label: "failed" },
  } as const;
  const entry = map[status];
  const Icon = entry.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", entry.cls)}>
      <Icon className={cn("h-3.5 w-3.5", "spin" in entry && entry.spin && "animate-spin")} />
      {entry.label}
    </span>
  );
}

function TaskCard({ task }: { task: BackgroundTask }) {
  const summary = checkpointSummary(task);
  const failed = task.status === "Failed";

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium text-foreground">{describeTask(task)}</h3>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{task.id}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {summary && (
        <div className="mt-4 text-xs text-muted-foreground">{summary}</div>
      )}

      {!failed && task.error && task.error.length > 0 && (
        <div className="mt-3 text-xs italic text-muted-foreground">{task.error}</div>
      )}

      {failed && task.error && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {task.error}
        </div>
      )}

      {task.identity && (
        <div className="mt-4 border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
          <span className="font-medium text-muted-foreground/80">identity</span> · {task.identity}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { active, tasks, loading, refresh } = useTasks();

  const grouped = useMemo(() => {
    const m = new Map<string, BackgroundTask[]>();
    for (const t of active) {
      const arr = m.get(t.name) ?? [];
      arr.push(t);
      m.set(t.name, arr);
    }
    return Array.from(m.entries());
  }, [active]);

  return (
    <div className="paper-texture min-h-[calc(100vh-57px)] px-6 py-8 pb-24 md:pb-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-end justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Background tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Long-running work happening in the background. Progress updates live.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refresh()}
            className="rounded-xl shadow-soft"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {loading && tasks.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading tasks…</span>
          </div>
        )}

        {!loading && active.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-10 text-center shadow-soft animate-fade-in">
            <p className="text-sm text-muted-foreground">
              Nothing running. New tasks (book uploads, journey creation, dialogue prep) will
              appear here as they start.
            </p>
          </div>
        )}

        {grouped.map(([name, items]) => (
          <section key={name} className="mb-8 animate-fade-in">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground/80">
                {TASK_LABELS[name] ?? name}
              </h2>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {items.length} active
              </span>
            </header>
            <div className="space-y-3">
              {items.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
