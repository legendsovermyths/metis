import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAllResources, uploadResource, type Resource, type UserInputItem } from "@/lib/service";

export interface PendingUpload {
  tempId: string;
  label: string;
}

interface ResourceContextValue {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  pendingUploads: PendingUpload[];
  refresh: (silent?: boolean) => Promise<void>;
  /** Fire-and-forget: stages an optimistic pending card, ingests, then refreshes. */
  upload: (inputs: UserInputItem[], label: string, notes?: string) => void;
}

const ResourceContext = createContext<ResourceContextValue | null>(null);

const uid = () => Math.random().toString(36).slice(2);

export function ResourceProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setResources(await getAllResources());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(false);
  }, [refresh]);

  const upload = useCallback(
    (inputs: UserInputItem[], label: string, notes = "") => {
      const tempId = uid();
      setPendingUploads((prev) => [...prev, { tempId, label }]);
      void uploadResource(inputs, notes)
        .then(() => refresh(true))
        .catch(() => {
          // Error already surfaced via toast by the service layer.
        })
        .finally(() => {
          setPendingUploads((prev) => prev.filter((p) => p.tempId !== tempId));
        });
    },
    [refresh],
  );

  return (
    <ResourceContext.Provider value={{ resources, loading, error, pendingUploads, refresh, upload }}>
      {children}
    </ResourceContext.Provider>
  );
}

export function useResources() {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error("useResources must be used within ResourceProvider");
  return ctx;
}
