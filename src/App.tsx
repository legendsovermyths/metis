import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/context/AppContext";
import { useAppContext } from "@/context/AppContext";
import { BookUploadProvider } from "@/context/UploadContext";
import { AppNav } from "@/components/AppNav";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import LibraryPage from "./pages/LibraryPage";
import JourneysPage from "./pages/JourneysPage";
import JourneyDetailPage from "./pages/JourneyDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout() {
  const location = useLocation();
  const { context, loading } = useAppContext();
  const isChatPage = location.pathname === "/chat";
  const onboarded = !!context?.onboarded;
  const showNav = onboarded && !isChatPage;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-4xl font-serif tracking-tighter text-foreground animate-pulse">Metis</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {showNav && <AppNav />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/journeys" element={<JourneysPage />} />
          <Route path="/journeys/:id" element={<JourneyDetailPage />} />
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
        <BookUploadProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
        </BookUploadProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
};

export default App;
