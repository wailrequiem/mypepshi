import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CircleDashed } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getSignedUrl } from "@/lib/photoUpload";
import { normalizeScores, formatScore, getProgressValue } from "@/lib/normalizeScores";
import { AppHeader } from "@/components/layout/AppHeader";

interface ScanData {
  id: string;
  created_at: string;
  front_image_path: string;
  side_image_path: string;
  scores_json: any;
}

export default function ScanResults() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [frontImageSignedUrl, setFrontImageSignedUrl] = useState<string | null>(null);
  const [sideImageSignedUrl, setSideImageSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !scanId) {
      navigate("/dashboard");
      return;
    }

    const fetchScan = async () => {
      try {
        const { data, error } = await supabase
          .from("scans")
          .select("*")
          .eq("id", scanId)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setScan(data);

        // Generate signed URLs for images (PRIVATE bucket)
        if (data.front_image_path) {
          console.log("🔐 [ScanResults] Generating signed URL for front image:", data.front_image_path);
          const frontUrl = await getSignedUrl(data.front_image_path, 3600); // 1 hour
          setFrontImageSignedUrl(frontUrl);
        }

        if (data.side_image_path) {
          console.log("🔐 [ScanResults] Generating signed URL for side image:", data.side_image_path);
          const sideUrl = await getSignedUrl(data.side_image_path, 3600); // 1 hour
          setSideImageSignedUrl(sideUrl);
        }
      } catch (error) {
        console.error("Failed to fetch scan:", error);
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScan();
  }, [scanId, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!scan) return null;

  // Normalize scores with proper key mapping
  const scores = normalizeScores(scan.scores_json);
  
  const overallScore = scores.overall ?? 0;
  const aspects = [
    { key: "skinQuality", label: "Skin Quality", score: scores.skinQuality },
    { key: "jawline", label: "Jawline Definition", score: scores.jawline },
    { key: "cheekbones", label: "Cheekbones", score: scores.cheekbones },
    { key: "symmetry", label: "Facial Symmetry", score: scores.symmetry },
    { key: "eyeArea", label: "Eye Area", score: scores.eyeArea },
    { key: "potential", label: "Potential", score: scores.potential },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-8 flex flex-col">
      {/* Header with hamburger menu */}
      <AppHeader title="Scan Results" />

      <div className="px-4 pt-8 space-y-8">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Scan from {new Date(scan.created_at).toLocaleDateString()}</h1>
          <p className="text-muted-foreground">Your analysis results</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-block bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
            <div className="relative">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Overall</p>
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                {formatScore(overallScore)}
              </div>
              <div className="mt-3 w-48 mx-auto">
                <Progress value={getProgressValue(overallScore)} className="h-2" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-2 gap-3">
            {aspects.map((aspect, index) => {
              const scoreValue = aspect.score;
              const isNull = scoreValue === null || scoreValue === undefined;
              
              return (
                <motion.div
                  key={aspect.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 ${
                    aspect.key === "potential" ? "bg-primary/10 border-primary/30" : ""
                  } ${isNull ? "opacity-60" : ""}`}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {aspect.label}
                  </p>
                  <p className={`text-2xl font-bold mb-2 ${
                    aspect.key === "potential" ? "text-primary" : ""
                  } ${isNull ? "text-muted-foreground" : ""}`}>
                    {formatScore(scoreValue)}
                  </p>
                  <Progress 
                    value={getProgressValue(scoreValue)}
                    className={`h-1.5 ${aspect.key === "potential" ? "[&>div]:bg-primary" : ""} ${
                      isNull ? "opacity-30" : ""
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h2 className="text-lg font-semibold text-center">Your Scan Photos</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Front photo", image: frontImageSignedUrl },
              { label: "Side photo", image: sideImageSignedUrl }
            ].map(({ label, image }) => (
              <div
                key={label}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 aspect-square flex flex-col items-center justify-center gap-3"
              >
                {image ? (
                  <img src={image} alt={label} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                      <CircleDashed className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
