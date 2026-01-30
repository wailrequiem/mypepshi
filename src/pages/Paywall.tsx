import { useNavigate } from "react-router-dom";
import { PostOnboardingPaywall } from "@/components/paywall/PostOnboardingPaywall";

/**
 * Paywall Page
 * 
 * IMPORTANT: NO scan uploads or database writes happen here.
 * Photos are kept in localStorage until AFTER payment is confirmed.
 * The flush happens in Dashboard when payment=success is detected.
 */
export default function Paywall() {
  const navigate = useNavigate();

  const handleUnlock = () => {
    // This is called after successful payment redirect
    // Navigate to dashboard - the ProtectedRoute will verify access
    console.log("🚀 [Paywall] User unlocked, redirecting to dashboard");
    navigate("/dashboard");
  };

  return <PostOnboardingPaywall onUnlock={handleUnlock} />;
}
