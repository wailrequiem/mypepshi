import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { hasGuestPhotos } from "@/lib/guestPhotos";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      // Check if user has guest photos saved
      const hasPhotos = hasGuestPhotos();
      
      if (hasPhotos) {
        console.log("🔒 [ProtectedRoute] No authenticated user but has guest photos, redirecting to paywall");
        navigate("/paywall", { replace: true });
      } else {
        console.log("🔒 [ProtectedRoute] No authenticated user, redirecting to home");
        navigate("/", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
