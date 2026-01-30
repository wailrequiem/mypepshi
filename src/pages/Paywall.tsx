import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { PostOnboardingPaywall } from "@/components/paywall/PostOnboardingPaywall";
import { useAuth } from "@/contexts/AuthContext";
import { hasPendingScan } from "@/lib/pendingScan";
import { flushPendingScanToSupabase } from "@/lib/flushPendingScan";
import { Loader2 } from "lucide-react";

export default function Paywall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFlushing, setIsFlushing] = useState(false);
  const hasFlushedRef = useRef(false);

  // Flush pending scan when user logs in/signs up (but don't auto-redirect)
  useEffect(() => {
    const flushPendingScan = async () => {
      if (!user) return;
      if (!hasPendingScan()) return;
      if (isFlushing || hasFlushedRef.current) return;

      console.log("🔄 [Paywall] User authenticated with pending scan, flushing...");
      setIsFlushing(true);
      hasFlushedRef.current = true;

      try {
        const result = await flushPendingScanToSupabase();
        
        if (result.success) {
          console.log("✅ [Paywall] Flush successful");
          // NOTE: Do NOT auto-redirect to dashboard here
          // User must pay first - PaywallRoute guard will redirect after payment
        } else {
          console.error("❌ [Paywall] Flush failed:", result.error);
        }
      } catch (error) {
        console.error("❌ [Paywall] Unexpected flush error:", error);
      } finally {
        setIsFlushing(false);
      }
    };

    flushPendingScan();
  }, [user]);

  const handleUnlock = () => {
    // This is called after successful payment
    // Navigate to dashboard - the ProtectedRoute will verify access
    console.log("🚀 [Paywall] User unlocked, redirecting to dashboard");
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
