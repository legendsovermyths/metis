import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getContext as fetchContext, registerContextSetter, type AppContext as AppContextType } from "@/lib/service";

interface AppContextValue {
  context: AppContextType | null;
  loading: boolean;
  updateContext: (ctx: AppContextType) => void;
}

const AppCtx = createContext<AppContextValue | null>(null);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<AppContextType | null>(null);
  const [loading, setLoading] = useState(true);

  const updateContext = useCallback((ctx: AppContextType) => {
    setContext(ctx);
  }, []);

  useEffect(() => {
    registerContextSetter(updateContext);
    fetchContext()
      .then(updateContext)
      .catch((e) => console.error("[Metis] failed to load initial context:", e))
      .finally(() => setLoading(false));

    return () => registerContextSetter(null);
  }, [updateContext]);

  return (
    <AppCtx.Provider value={{ context, loading, updateContext }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const value = useContext(AppCtx);
  if (!value) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return value;
}
