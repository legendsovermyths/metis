import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/context/AppContext";
import { useAppContext } from "@/context/AppContext";
import { BookUploadProvider } from "@/context/UploadContext";
import { JourneyCreationProvider } from "@/context/JourneyCreationContext";
import { TasksProvider } from "@/context/TasksContext";
import { AppNav } from "@/components/AppNav";
import { BackgroundTasksPanel } from "@/components/BackgroundTasksPanel";
import { AgentInputDialog } from "@/components/AgentInputDialog";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import LibraryPage from "./pages/LibraryPage";
import JourneysPage from "./pages/JourneysPage";
import JourneyDetailPage from "./pages/JourneyDetailPage";
import TeachingPage from "./pages/TeachingPage";
import TasksPage from "./pages/TasksPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const { context, loading } = useAppContext();
  const isChatPage = location.pathname === "/chat";
  const isTeachPage = location.pathname === "/teach";
  const isHomePage = location.pathname === "/";
  const onboarded = context ? context.chat.phase !== "Onboarding" : false;
  const showNav = onboarded && !isHomePage && !isChatPage && !isTeachPage;

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
      {onboarded && <BackgroundTasksPanel />}
      <AgentInputDialog />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/journeys" element={<JourneysPage />} />
          <Route path="/journeys/:id" element={<JourneyDetailPage />} />
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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
        </JourneyCreationProvider>
        </BookUploadProvider>
        </TasksProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
};

export default App;
