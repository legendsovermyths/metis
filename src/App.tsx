import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/context/AppContext";
import { useAppContext } from "@/context/AppContext";
import { BookUploadProvider } from "@/context/UploadContext";
import { JourneyCreationProvider } from "@/context/JourneyCreationContext";
import { NotebookProvider, useNotebook } from "@/context/NotebookContext";
import { NoteAnchorProvider, useNoteAnchor } from "@/context/NoteAnchorContext";
import { TasksProvider } from "@/context/TasksContext";
import type { NoteAnchor } from "@/lib/service";
import { AppNav } from "@/components/AppNav";
import { AgentInputDialog } from "@/components/AgentInputDialog";
import { FloatingNote } from "@/components/notes/FloatingNote";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import LibraryPage from "./pages/LibraryPage";
import StudiesPage from "./pages/StudiesPage";
import JourneyDetailPage from "./pages/JourneyDetailPage";
import ExplanationDetailPage from "./pages/ExplanationDetailPage";
import NotebookPage from "./pages/NotebookPage";
import TeachingPage from "./pages/TeachingPage";
import TasksPage from "./pages/TasksPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { context, loading } = useAppContext();
  const { anchor, setAnchor } = useNoteAnchor();
  const { openSlip, create, requestOpen } = useNotebook();
  const isChatPage = location.pathname === "/chat";
  const isTeachPage = location.pathname === "/teach";
  const isHomePage = location.pathname === "/";
  const onboarded = context ? context.chat.phase !== "Onboarding" : false;
  const showNav = onboarded && !isHomePage && !isChatPage && !isTeachPage;

  // Provenance for page-level surfaces. /teach sets its own precise
  // (dialogue/segment) anchor from inside TeachingPage.
  useEffect(() => {
    if (location.pathname === "/teach") return;
    const jm = location.pathname.match(/^\/journeys\/(\d+)/);
    if (jm) {
      setAnchor({ Journey: { journey_id: Number(jm[1]) } });
      return;
    }
    const em = location.pathname.match(/^\/explanations\/(\d+)/);
    setAnchor(em ? { Explanation: { explanation_id: Number(em[1]), step_idx: null } } : null);
  }, [location.pathname, setAnchor]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        navigate("/tasks");
      } else if (mod && e.shiftKey && e.key.toLowerCase() === "j") {
        // New full note on the desk, born with the current anchor.
        e.preventDefault();
        void create("", "", anchor).then((id) => {
          requestOpen(id);
          navigate("/notebook");
        });
      } else if (mod && e.key.toLowerCase() === "j") {
        // Quick floating slip, born with the current anchor.
        e.preventDefault();
        void openSlip(anchor);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, anchor, openSlip, create, requestOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-display text-5xl italic tracking-tight text-foreground animate-pulse">Metis</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showNav && <AppNav />}
      <AgentInputDialog />
      {onboarded && <FloatingNote />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/studies" element={<StudiesPage />} />
          <Route path="/journeys/:id" element={<JourneyDetailPage />} />
          <Route path="/explanations/:id" element={<ExplanationDetailPage />} />
          <Route path="/notebook" element={<NotebookPage />} />
          <Route path="/teach" element={<TeachingPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <TasksProvider>
        <BookUploadProvider>
        <JourneyCreationProvider>
        <NotebookProvider>
        <NoteAnchorProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
        </NoteAnchorProvider>
        </NotebookProvider>
        </JourneyCreationProvider>
        </BookUploadProvider>
        </TasksProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
};

export default App;
