import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  listTasks,
  subscribeTaskEvents,
  type BackgroundTask,
  type TaskDoneEvent,
  type TaskName,
  type TaskProgressEvent,
} from "@/lib/service";

type DoneListener = (event: TaskDoneEvent) => void;

interface TasksContextValue {
  tasks: BackgroundTask[];
  loading: boolean;
  /** Tasks still pending or running. */
  active: BackgroundTask[];
  /** Active tasks of a specific type. */
  byType: (name: TaskName) => BackgroundTask[];
  /** Find an active task by its dedup identity (e.g. `path:/foo.pdf`). */
  byIdentity: (identity: string) => BackgroundTask | undefined;
  /** Force-refresh from backend (useful after spawning a task). */
  refresh: () => Promise<void>;
  /** Subscribe to `task:done` payloads — fires for every completion. */
  onTaskDone: (listener: DoneListener) => () => void;
}

const TasksCtx = createContext<TasksContextValue | null>(null);

const ACTIVE_STATUSES = new Set(["Pending", "Running"]);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<BackgroundTask[]>([]);
  const [loading, setLoading] = useState(true);
  const doneListenersRef = useRef<Set<DoneListener>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const next = await listTasks();
      setTasks(next);
    } catch (e) {
      console.error("[Metis] failed to list tasks:", e);
    }
  }, []);

  const handleProgress = useCallback((event: TaskProgressEvent) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === event.task_id);
      if (idx === -1) {
        // Task we don't know about yet — let a background refresh pick it up.
        return prev;
      }
      const next = prev.slice();
      next[idx] = {
        ...next[idx],
        status: event.status,
        checkpoint: event.checkpoint,
        error: event.status === "Failed" ? event.message : next[idx].error,
      };
      // Drop terminal tasks so the panel only shows active work.
      if (!ACTIVE_STATUSES.has(event.status)) {
        next.splice(idx, 1);
      }
      return next;
    });
  }, []);

  const handleDone = useCallback((event: TaskDoneEvent) => {
    setTasks((prev) => prev.filter((t) => t.id !== event.task_id));
    doneListenersRef.current.forEach((l) => {
      try {
        l(event);
      } catch (e) {
        console.error("[Metis] task done listener threw:", e);
      }
    });
  }, []);

  const handleError = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      void refresh();
    },
    [refresh],
  );

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      unlisten = await subscribeTaskEvents({
        onProgress: handleProgress,
        onDone: handleDone,
        onError: handleError,
      });
      await refresh();
      if (!cancelled) setLoading(false);
    })().catch((e) => {
      console.error("[Metis] TasksProvider init failed:", e);
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      if (unlisten) unlisten();
    };
  }, [handleProgress, handleDone, handleError, refresh]);

  const onTaskDone = useCallback((listener: DoneListener) => {
    doneListenersRef.current.add(listener);
    return () => {
      doneListenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo<TasksContextValue>(() => {
    const active = tasks.filter((t) => ACTIVE_STATUSES.has(t.status));
    return {
      tasks,
      loading,
      active,
      byType: (name) => active.filter((t) => t.name === name),
      byIdentity: (identity) => active.find((t) => t.identity === identity),
      refresh,
      onTaskDone,
    };
  }, [tasks, loading, refresh, onTaskDone]);

  return <TasksCtx.Provider value={value}>{children}</TasksCtx.Provider>;
}

export function useTasks(): TasksContextValue {
  const value = useContext(TasksCtx);
  if (!value) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return value;
}
