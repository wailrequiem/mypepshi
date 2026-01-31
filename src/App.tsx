import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PaywallRoute } from "@/components/auth/PaywallRoute";
import { OnboardingRoute } from "@/components/auth/OnboardingRoute";
import { PageTransition } from "@/components/layout/PageTransition";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Paywall from "./pages/Paywall";
import Dashboard from "./pages/Dashboard";
import NewScan from "./pages/NewScan";
import ScanResults from "./pages/ScanResults";
import Settings from "./pages/Settings";
import AuthCallback from "./pages/AuthCallback";
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
        <Route path="/auth/callback" element={
          <PageTransition>
            <AuthCallback />
          </PageTransition>
        } />
        <Route path="/onboarding" element={
          <OnboardingRoute>
            <PageTransition>
              <Onboarding />
            </PageTransition>
          </OnboardingRoute>
        } />
        <Route path="/paywall" element={
          <PaywallRoute>
            <PageTransition>
              <Paywall />
            </PageTransition>
          </PaywallRoute>
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
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <PageTransition>
              <Settings />
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
