import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import MaterialView from "./pages/MaterialView";
import Quiz from "./pages/Quiz";
import TestSimulation from "./pages/TestSimulation";
import TestResults from "./pages/TestResults";
import TestSolutions from "./pages/TestSolutions";
import Forum from "./pages/Forum";
import ForumPost from "./pages/ForumPost";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";
import AdminUpload from "./pages/AdminUpload";
import AdminMaterials from "./pages/AdminMaterials";
import AdminQuiz from "./pages/AdminQuiz";
import { AdminGate } from "./components/AdminGate";
import { useAuth } from "./hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicRoute><><Navbar /><Landing /></></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/materials/:id" element={<MaterialView />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/test-simulation/:id" element={<TestSimulation />} />
                <Route path="/test-results/:id" element={<TestResults />} />
                <Route path="/test-solutions/:id" element={<TestSolutions />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/forum/:id" element={<ForumPost />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin Routes */}
                <Route element={<AdminGate />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/upload" element={<AdminUpload />} />
                    <Route path="/admin/materials" element={<AdminMaterials />} />
                    <Route path="/admin/edit/:id" element={<AdminUpload />} />
                    <Route path="/admin/quiz" element={<AdminQuiz />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
