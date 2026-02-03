import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessState, getRedirectPath, getAuthRedirectPath } from "@/lib/accessState";
import { Menu, X, LogOut } from "lucide-react";
import logo from "@/assets/logo.png";

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
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
    setIsMobileMenuOpen(false);
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
          // Fetch access state directly for reliability
          const accessState = await getAccessState(currentUser.id);
          
          console.log("[handleAuthSuccess] Access state:", accessState);
          
          // Route based on state:
          // 1. Has paid -> Dashboard
          // 2. Completed onboarding but not paid -> Paywall
          // 3. Not completed onboarding -> Onboarding
          if (accessState.hasPaid) {
            navigate('/dashboard');
          } else if (accessState.onboardingCompleted) {
            navigate('/paywall');
          } else {
            navigate('/onboarding');
          }
        } else {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error("Error getting redirect path:", error);
        navigate('/onboarding');
      }
    }, 300);
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

  const handleLogout = async () => {
    try {
      setIsMobileMenuOpen(false);
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button - left side */}
        <button
          className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Link to="/" className="flex items-center">
          <img 
            src={logo} 
            alt="MyPepMaxx" 
            className="h-14 sm:h-16 w-auto object-contain"
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
              className="hidden md:inline-flex"
              onClick={handleUserButtonClick}
            >
              {hasPaid ? "Dashboard" : hasCompletedOnboarding ? "Unlock Now" : "Continue"}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:inline-flex"
              onClick={() => setIsAuthModalOpen(true)}
            >
              Log in
            </Button>
          )}
          <Link to="/onboarding" className="hidden sm:block">
            <Button size="sm">
              Start My Glow-Up
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col px-4 py-4 space-y-1">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-left px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent rounded-lg"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="text-left px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent rounded-lg"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="text-left px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent rounded-lg"
            >
              Testimonials
            </button>
            <button 
              onClick={() => scrollToSection('faq')} 
              className="text-left px-3 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-accent rounded-lg"
            >
              FAQ
            </button>
            
            <div className="border-t border-border/50 pt-3 mt-2 space-y-2">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      handleUserButtonClick();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {hasPaid ? "Dashboard" : hasCompletedOnboarding ? "Unlock Now" : "Continue"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Log in
                </Button>
              )}
              <Link to="/onboarding" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Start My Glow-Up
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
}
