import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentSuccessScreen } from "@/components/payment/PaymentSuccessScreen";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { getSignedUrl } from "@/lib/photoUpload";
import { TabBar } from "@/components/navigation/TabBar";
import { AnalysisTab } from "@/components/tabs/AnalysisTab";
import { CoachTab } from "@/components/tabs/CoachTab";

interface Scan {
  id: string;
  created_at: string;
  front_image_path: string;
  side_image_path: string;
  scores_json: any;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [scanHistory, setScanHistory] = useState<Array<{ date: Date; score: number; id: string }>>([]);
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [frontImageSignedUrl, setFrontImageSignedUrl] = useState<string | null>(null);
  const [sideImageSignedUrl, setSideImageSignedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "coach">("analysis");

  const fetchScans = async () => {
    if (!user) return;

    try {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("[DASHBOARD] Fetching scans for user:", user.id);
      
      const { data, error } = await supabase
        .from("scans")
        .select("id, created_at, front_image_path, side_image_path, scores_json")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        console.log("[DASHBOARD] ✅ Fetched", data.length, "scan(s) from DB");
        console.log("[DASHBOARD] Latest scan ID:", data[0].id);
        console.log("[DASHBOARD] Latest scan created:", data[0].created_at);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("[AI] Raw scores_json from DB:", JSON.stringify(data[0].scores_json, null, 2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Set latest scan for displaying full details
        setLatestScan(data[0]);

        // Generate signed URLs for images (PRIVATE bucket)
        if (data[0].front_image_path) {
          console.log("[DASHBOARD] Generating signed URL for front image:", data[0].front_image_path);
          const frontUrl = await getSignedUrl(data[0].front_image_path, 3600); // 1 hour
          setFrontImageSignedUrl(frontUrl);
        }

        if (data[0].side_image_path) {
          console.log("[DASHBOARD] Generating signed URL for side image:", data[0].side_image_path);
          const sideUrl = await getSignedUrl(data[0].side_image_path, 3600); // 1 hour
          setSideImageSignedUrl(sideUrl);
        }
        
        setScanHistory(
          data.map((scan: Scan) => ({
            id: scan.id,
            date: new Date(scan.created_at),
            score: scan.scores_json?.overall || 0,
          }))
        );
      } else {
        console.log("[DASHBOARD] ⚠️ No scans found for user");
      }
    } catch (error) {
      console.error("[DASHBOARD] ❌ Failed to fetch scans:", error);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [user]);

  useEffect(() => {
    const handleFocus = () => {
      fetchScans();
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

  const handleContinue = () => {
    console.log("Continue clicked");
  };

  const handleSkip = () => {
    console.log("Skip clicked");
  };

  const handleNewScan = () => {
    navigate("/scan/new");
  };

  const handleViewScan = (scanId: string) => {
    navigate(`/scan/${scanId}`);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log("🔓 [Dashboard] Logging out user...");
      
      // Clear local storage onboarding data if needed
      localStorage.removeItem("onboarding_data");
      
      // Sign out from Supabase
      await signOut();
      
      console.log("✅ [Dashboard] User logged out successfully");
      
      // Redirect to home page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("❌ [Dashboard] Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Logout button */}
      <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
          <h2 className="text-lg font-semibold">Dashboard</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "analysis" ? (
          <PaymentSuccessScreen
            onContinue={handleContinue}
            onSkip={handleSkip}
            onNewScan={handleNewScan}
            onViewScan={handleViewScan}
            scanHistory={scanHistory}
            latestScanData={latestScan ? {
              ...latestScan,
              front_image_url: frontImageSignedUrl || "",
              side_image_url: sideImageSignedUrl || "",
            } : null}
          />
        ) : (
          <CoachTab />
        )}
      </div>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
