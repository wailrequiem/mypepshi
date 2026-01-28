import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageTransition } from "@/components/layout/PageTransition";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Paywall from "./pages/Paywall";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import ScanResults from "./pages/ScanResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Animated routes component (needs to be inside BrowserRouter to access useLocation)
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <PageTransition>
            <Index />
          </PageTransition>
        } />
        <Route path="/onboarding" element={
          <PageTransition>
            <Onboarding />
          </PageTransition>
        } />
        <Route path="/paywall" element={
          <PageTransition>
            <Paywall />
          </PageTransition>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageTransition>
              <Dashboard />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/scan/new" element={
          <ProtectedRoute>
            <PageTransition>
              <NewScan />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/scan/:scanId" element={
          <ProtectedRoute>
            <PageTransition>
              <ScanResults />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <PageTransition>
            <NotFound />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OnboardingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </OnboardingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
