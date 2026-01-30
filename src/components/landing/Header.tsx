import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessState, getRedirectPath, getAuthRedirectPath } from "@/lib/accessState";
import logo from "@/assets/logo.png";

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check user access state when user changes
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) {
        setHasPaid(false);
        setHasCompletedOnboarding(false);
        return;
      }

      try {
        const accessState = await getAccessState(user.id);
        setHasPaid(accessState.hasPaid);
        setHasCompletedOnboarding(accessState.onboardingCompleted);
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };

    checkUserStatus();
  }, [user]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    
    // Route based on state machine instead of hardcoded /dashboard
    // Wait a moment for auth state to settle, then get the correct route
    setTimeout(async () => {
      try {
        // Re-fetch user from auth context
        const { data: { user: currentUser } } = await import("@/lib/supabase").then(m => m.supabase.auth.getUser());
        
        if (currentUser) {
          const redirectPath = await getAuthRedirectPath(currentUser.id);
          navigate(redirectPath);
        } else {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error("Error getting redirect path:", error);
        navigate('/onboarding');
      }
    }, 100);
  };

  const handleUserButtonClick = () => {
    if (hasPaid) {
      navigate('/dashboard');
    } else if (hasCompletedOnboarding) {
      navigate('/paywall');
    } else {
      navigate('/onboarding');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="MyPepMaxx" 
            className="h-12 w-auto object-contain"
          />
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          <button onClick={() => scrollToSection('features')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </button>
          <button onClick={() => scrollToSection('testimonials')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Testimonials
          </button>
          <button onClick={() => scrollToSection('faq')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </button>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={handleUserButtonClick}
            >
              {hasPaid ? "Dashboard" : hasCompletedOnboarding ? "Unlock Now" : "Continue"}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Log in
            </Button>
          )}
          <Link to="/onboarding">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
}
