import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SharedRoadmap from "./pages/SharedRoadmap";
import WeakPointDetail from "./pages/WeakPointDetail";
import SkillDetail from "./pages/SkillDetail";
import WeakPointsHub from "./pages/WeakPointsHub";
import TrendsHub from "./pages/TrendsHub";
import TrendDetail from "./pages/TrendDetail";
import MentorHub from "./pages/MentorHub";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roadmap/:id" element={<SharedRoadmap />} />
          <Route path="/roadmap/:roadmapId/phase/:phaseName/skill/:skillName" element={<SkillDetail />} />
          <Route path="/trends" element={<TrendsHub />} />
          <Route path="/trends/:trendId" element={<TrendDetail />} />
          <Route path="/mentor" element={<MentorHub />} />
          <Route path="/weak-point/:id" element={<WeakPointDetail />} />
          <Route path="/weak-points-hub" element={<WeakPointsHub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
