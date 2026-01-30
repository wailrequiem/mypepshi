import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessState, getRedirectPath, AccessState } from "@/lib/accessState";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute - Guards routes that require authentication AND proper access state.
 * 
 * State machine:
 *   - Not authenticated -> redirect to /
 *   - Onboarding not completed -> redirect to /onboarding
 *   - Onboarding completed but not paid -> redirect to /paywall
 *   - Onboarding completed and paid -> allow access
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      // Wait for auth to be ready
      if (isAuthLoading) return;

      // No user -> redirect to home
      if (!user) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const accessState = await getAccessState(user.id);
        
        if (!isMounted) return;

        const requiredPath = getRedirectPath(accessState);

        // If user should be somewhere else, redirect them
        if (requiredPath !== "/dashboard") {
          console.log(`[ProtectedRoute] User needs to go to ${requiredPath}`);
          navigate(requiredPath, { replace: true });
          return;
        }

        // User has full access
        setHasAccess(true);
      } catch (error) {
        console.error("[ProtectedRoute] Error checking access:", error);
        // On error, redirect to onboarding to be safe
        navigate("/onboarding", { replace: true });
      } finally {
        if (isMounted) {
          setIsCheckingAccess(false);
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthLoading, navigate, location.pathname]);

  // Show loading spinner while checking auth or access
  if (isAuthLoading || isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render children if no access
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
