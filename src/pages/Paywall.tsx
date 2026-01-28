import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PostOnboardingPaywall } from "@/components/paywall/PostOnboardingPaywall";
import { useAuth } from "@/contexts/AuthContext";
import { hasPendingScan } from "@/lib/pendingScan";
import { flushPendingScanToSupabase } from "@/lib/flushPendingScan";
import { Loader2 } from "lucide-react";

export default function Paywall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFlushing, setIsFlushing] = useState(false);

  // Auto-flush pending scan when user logs in/signs up
  useEffect(() => {
    const autoFlush = async () => {
      if (!user) return;
      if (!hasPendingScan()) return;
      if (isFlushing) return;

      console.log("🔄 [Paywall] User authenticated with pending scan, auto-flushing...");
      setIsFlushing(true);

      try {
        const result = await flushPendingScanToSupabase();
        
        if (result.success) {
          console.log("✅ [Paywall] Flush successful, redirecting to dashboard...");
          // Redirect to dashboard after successful flush
          setTimeout(() => {
            navigate("/dashboard");
          }, 1000);
        } else {
          console.error("❌ [Paywall] Flush failed:", result.error);
          // Show error but still allow to continue
          setIsFlushing(false);
        }
      } catch (error) {
        console.error("❌ [Paywall] Unexpected flush error:", error);
        setIsFlushing(false);
      }
    };

    autoFlush();
  }, [user, navigate]);

  const handleUnlock = () => {
    // Simple: redirect directly to dashboard
    console.log("🚀 [Paywall] User clicked unlock, redirecting to dashboard");
    navigate("/dashboard");
  };

  // Show loading screen while flushing
  if (isFlushing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Saving your scan...</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          We're analyzing your photos and preparing your personalized results.
        </p>
      </div>
    );
  }

  return <PostOnboardingPaywall onUnlock={handleUnlock} />;
}
