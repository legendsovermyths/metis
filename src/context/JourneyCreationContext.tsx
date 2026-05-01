import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createJourney,
  getAllJourneys,
  type CreateJourneyParams,
  type JourneyRow,
} from "@/lib/service";
import { useTasks } from "@/context/TasksContext";

export interface PendingJourney {
  tempId: string;
  chapterTitle: string;
}

interface JourneyCreationContextValue {
  journeyRows: JourneyRow[];
  journeysLoading: boolean;
  journeysError: string | null;
  pendingJourneys: PendingJourney[];
  lastCreatedId: number | null;
  clearLastCreatedId: () => void;
  startJourneyCreation: (
    params: CreateJourneyParams,
    onError?: (msg: string) => void,
  ) => Promise<void>;
}

const JourneyCreationContext = createContext<JourneyCreationContextValue | null>(null);

export function JourneyCreationProvider({ children }: { children: React.ReactNode }) {
  const [journeyRows, setJourneyRows] = useState<JourneyRow[]>([]);
  const [journeysLoading, setJourneysLoading] = useState(true);
  const [journeysError, setJourneysError] = useState<string | null>(null);
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);
  const lastSeenIdsRef = useRef<Set<number>>(new Set());
  const { byType, onTaskDone } = useTasks();

  const fetchJourneys = useCallback(
    async (silent = false): Promise<JourneyRow[]> => {
      if (!silent) setJourneysLoading(true);
      setJourneysError(null);
      try {
        const next = await getAllJourneys();
        setJourneyRows(next);
        return next;
      } catch (e) {
        setJourneysError(e instanceof Error ? e.message : String(e));
        return [];
      } finally {
        setJourneysLoading(false);
      }
    },
    [],
  );

  // Seed the "seen" set on first load so newly created journeys can be detected
  // via diff after a task completes.
  useEffect(() => {
    fetchJourneys(false).then((rows) => {
      lastSeenIdsRef.current = new Set(rows.map((r) => r.id));
    });
  }, [fetchJourneys]);

  // When any task finishes, refetch journeys; if a new one appeared, surface
  // it via lastCreatedId so the page can navigate.
  useEffect(() => {
    return onTaskDone(() => {
      fetchJourneys(true).then((rows) => {
        const seen = lastSeenIdsRef.current;
        const fresh = rows.find((r) => !seen.has(r.id));
        if (fresh) setLastCreatedId(fresh.id);
        lastSeenIdsRef.current = new Set(rows.map((r) => r.id));
      });
    });
  }, [onTaskDone, fetchJourneys]);

  const clearLastCreatedId = useCallback(() => setLastCreatedId(null), []);

  const startJourneyCreation = useCallback(
    async (params: CreateJourneyParams, onError?: (msg: string) => void) => {
      try {
        await createJourney(params);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        onError?.(msg);
      }
    },
    [],
  );

  const pendingJourneys = useMemo<PendingJourney[]>(() => {
    return byType("create_journey").map((task) => {
      const chapter =
        typeof task.params.chapter_title === "string" ? task.params.chapter_title : "";
      return { tempId: task.id, chapterTitle: chapter };
    });
  }, [byType]);

  return (
    <JourneyCreationContext.Provider
      value={{
        journeyRows,
        journeysLoading,
        journeysError,
        pendingJourneys,
        lastCreatedId,
        clearLastCreatedId,
        startJourneyCreation,
      }}
    >
      {children}
    </JourneyCreationContext.Provider>
  );
}

export function useJourneyCreation() {
  const ctx = useContext(JourneyCreationContext);
  if (!ctx) throw new Error("useJourneyCreation must be used within JourneyCreationProvider");
  return ctx;
}
