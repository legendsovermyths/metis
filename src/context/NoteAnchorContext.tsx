import { createContext, useContext, useState } from "react";
import type { NoteAnchor } from "@/lib/service";

interface NoteAnchorContextValue {
  anchor: NoteAnchor | null;
  setAnchor: (anchor: NoteAnchor | null) => void;
}

const NoteAnchorContext = createContext<NoteAnchorContextValue | null>(null);

export function NoteAnchorProvider({ children }: { children: React.ReactNode }) {
  const [anchor, setAnchor] = useState<NoteAnchor | null>(null);
  return (
    <NoteAnchorContext.Provider value={{ anchor, setAnchor }}>
      {children}
    </NoteAnchorContext.Provider>
  );
}

export function useNoteAnchor() {
  const ctx = useContext(NoteAnchorContext);
  if (!ctx) throw new Error("useNoteAnchor must be used within NoteAnchorProvider");
  return ctx;
}

/** Human label for where a note is (or would be) anchored. */
export function anchorLabel(anchor: NoteAnchor | null): string {
  if (!anchor) return "Unfiled";
  if ("Journey" in anchor) return "On this journey";
  if ("Dialogue" in anchor) return "On this dialogue";
  if ("Explanation" in anchor) return "On this explainer";
  return "Unfiled";
}
