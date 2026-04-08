import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { generateCourse, getAllJourneys, type JourneyArtifacts, type JourneyRow } from "@/lib/service";

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
  startJourneyCreation: (chapterTitle: string, onError?: (msg: string) => void) => void;
}

const JourneyCreationContext = createContext<JourneyCreationContextValue | null>(null);

export function JourneyCreationProvider({ children }: { children: React.ReactNode }) {
  const [journeyRows, setJourneyRows] = useState<JourneyRow[]>([]);
  const [journeysLoading, setJourneysLoading] = useState(true);
  const [journeysError, setJourneysError] = useState<string | null>(null);
  const [pendingJourneys, setPendingJourneys] = useState<PendingJourney[]>([]);
  const [lastCreatedId, setLastCreatedId] = useState<number | null>(null);
  const nextId = useRef(0);

  const fetchJourneys = useCallback((silent = false) => {
    if (!silent) setJourneysLoading(true);
    setJourneysError(null);
    return getAllJourneys()
      .then(setJourneyRows)
      .catch((e: unknown) => setJourneysError(e instanceof Error ? e.message : String(e)))
      .finally(() => setJourneysLoading(false));
  }, []);

  // Fetch once on mount
  useEffect(() => { fetchJourneys(false); }, [fetchJourneys]);

  const clearLastCreatedId = useCallback(() => setLastCreatedId(null), []);

  const startJourneyCreation = useCallback(
    (chapterTitle: string, onError?: (msg: string) => void) => {
      const tempId = `journey-${nextId.current++}`;
      setPendingJourneys((prev) => [...prev, { tempId, chapterTitle }]);

      generateCourse(chapterTitle)
        .then((artifacts: JourneyArtifacts) => {
          if (artifacts.id != null && Number.isFinite(artifacts.id)) {
            setLastCreatedId(artifacts.id);
          }
          fetchJourneys(true);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          onError?.(msg);
        })
        .finally(() => {
          setPendingJourneys((prev) => prev.filter((j) => j.tempId !== tempId));
        });
    },
    [fetchJourneys]
  );

  return (
    <JourneyCreationContext.Provider
      value={{ journeyRows, journeysLoading, journeysError, pendingJourneys, lastCreatedId, clearLastCreatedId, startJourneyCreation }}
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
