import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanFlow } from "@/components/scan/ScanFlow";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function NewScan() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("🔓 [NewScan] Logging out user...");
      
      localStorage.removeItem("onboarding_data");
      await signOut();
      
      console.log("✅ [NewScan] User logged out successfully");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("❌ [NewScan] Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logout button */}
      <div className="absolute top-0 right-0 z-50 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="gap-2 bg-background/80 backdrop-blur"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Log out"}
        </Button>
      </div>

      {/* Scan Flow - will save to localStorage and redirect to paywall */}
      <ScanFlow mode="newScan" />
    </div>
  );
}
