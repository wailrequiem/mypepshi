import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentSuccessScreen } from "@/components/payment/PaymentSuccessScreen";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { getSignedUrl } from "@/lib/photoUpload";
import { AppHeader } from "@/components/layout/AppHeader";
import { TabBar } from "@/components/navigation/TabBar";
import { AnalysisTab } from "@/components/tabs/AnalysisTab";
import { CoachTab } from "@/components/tabs/CoachTab";
import { hasPendingScan } from "@/lib/pendingScan";
import { flushPendingScanToSupabase } from "@/lib/flushPendingScan";

interface Scan {
  id: string;
  created_at: string;
  front_image_path: string;
  side_image_path: string;
  scores_json: any;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [scanHistory, setScanHistory] = useState<Array<{ date: Date; score: number; id: string }>>([]);
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [frontImageSignedUrl, setFrontImageSignedUrl] = useState<string | null>(null);
  const [sideImageSignedUrl, setSideImageSignedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "coach">("analysis");
  const [isFlushingPendingScan, setIsFlushingPendingScan] = useState(false);
  const hasFlushedRef = useRef(false);

  // Flush pending scan AFTER payment success
  // This is the ONLY place where pending scans are uploaded to Supabase
  useEffect(() => {
    const flushAfterPayment = async () => {
      const paymentStatus = searchParams.get("payment");
      
      // Only flush if payment was successful and we have pending scan
      if (paymentStatus !== "success") return;
      if (!user) return;
      if (!hasPendingScan()) return;
      if (hasFlushedRef.current) return;
      
      console.log("💳 [Dashboard] Payment success detected, flushing pending scan...");
      hasFlushedRef.current = true;
      setIsFlushingPendingScan(true);
      
      try {
        const result = await flushPendingScanToSupabase();
        
        if (result.success) {
          console.log("✅ [Dashboard] Pending scan flushed successfully:", result.scanId);
          // Refresh scans to show the new one
          await fetchScans();
        } else {
          console.error("❌ [Dashboard] Flush failed:", result.error);
        }
      } catch (error) {
        console.error("❌ [Dashboard] Unexpected flush error:", error);
      } finally {
        setIsFlushingPendingScan(false);
        // Clear the payment query param to prevent re-flush on refresh
        searchParams.delete("payment");
        setSearchParams(searchParams, { replace: true });
      }
    };
    
    flushAfterPayment();
  }, [user, searchParams]);

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

  // Show loading screen while flushing pending scan after payment
  if (isFlushingPendingScan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Processing your scan...</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          We're analyzing your photos and preparing your personalized results.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with hamburger menu */}
      <AppHeader title="Dashboard" />

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
