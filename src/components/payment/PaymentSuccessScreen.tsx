import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Plus, CircleDashed, Calendar, FlaskConical, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { GlowUpPlanSection } from "./GlowUpPlanSection";
import { PeptideCoachSection } from "./PeptideCoachSection";
import { PeptideRecommendationsRow } from "./PeptideRecommendationsRow";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { normalizeScores, formatScore, getProgressValue } from "@/lib/normalizeScores";
import { getPeptideRecommendations, PeptideRecommendationsData } from "@/lib/peptideRecommendations";

interface PaymentSuccessScreenProps {
  onContinue: () => void;
  onSkip: () => void;
  onNewScan?: () => void;
  onViewScan?: (scanId: string) => void;
  scanHistory?: Array<{ date: Date; score: number; id?: string }>;
  latestScanData?: {
    id: string;
    created_at: string;
    front_image_url: string;
    side_image_url: string;
    scores_json: any;
  } | null;
}

export const PaymentSuccessScreen = ({ 
  onContinue, 
  onSkip, 
  onNewScan,
  onViewScan,
  scanHistory = [{ date: new Date(), score: 75 }],
  latestScanData = null
}: PaymentSuccessScreenProps) => {
  // ✅ ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [peptideRecommendations, setPeptideRecommendations] = useState<PeptideRecommendationsData>({
    generated_at: new Date().toISOString(),
    peptides: []
  });
  const [loadingPeptides, setLoadingPeptides] = useState(false);
  const [peptideError, setPeptideError] = useState(false);
  
  // Extract REAL scores from latest scan - NO FALLBACK
  const scoresJson = latestScanData?.scores_json;
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[DASHBOARD] PaymentSuccessScreen render");
  console.log("[DASHBOARD] Using scanId:", latestScanData?.id);
  console.log("[DASHBOARD] Scores source (scores_json):", scoresJson);
  console.log("[DASHBOARD] Has real data:", !!scoresJson);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Load peptide recommendations
  useEffect(() => {
    async function loadPeptideRecommendations() {
      if (!latestScanData?.id) {
        console.log("[PEPTIDES] No scan ID available, skipping recommendations fetch");
        return;
      }
      
      console.log("[PEPTIDES] Fetching recommendations for scan:", latestScanData.id);
      setLoadingPeptides(true);
      setPeptideError(false);
      
      try {
        const recommendations = await getPeptideRecommendations(latestScanData.id);
        
        // Ensure peptides is always an array
        const normalizedRecommendations: PeptideRecommendationsData = {
          generated_at: recommendations?.generated_at || new Date().toISOString(),
          peptides: Array.isArray(recommendations?.peptides) ? recommendations.peptides : []
        };
        
        setPeptideRecommendations(normalizedRecommendations);
        console.log("✅ [PEPTIDES] Loaded peptide recommendations:", normalizedRecommendations.peptides.length, "peptides");
        
        if (normalizedRecommendations.peptides.length === 0) {
          console.warn("⚠️ [PEPTIDES] No peptides in recommendations");
          setPeptideError(true);
        }
      } catch (error) {
        console.error("❌ [PEPTIDES] Failed to load peptide recommendations:", error);
        setPeptideError(true);
        // Set empty array on error
        setPeptideRecommendations({
          generated_at: new Date().toISOString(),
          peptides: []
        });
      } finally {
        setLoadingPeptides(false);
      }
    }
    
    loadPeptideRecommendations();
  }, [latestScanData?.id]);
  
  // ✅ NOW SAFE TO DO EARLY RETURN - ALL HOOKS ALREADY CALLED
  // If no scan data, show error message
  if (!latestScanData || !scoresJson) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <h2 className="text-2xl font-bold">No scan data available</h2>
          <p className="text-muted-foreground">
            Please complete a face scan to see your results.
          </p>
          {onNewScan && (
            <Button onClick={onNewScan} className="w-full">
              Take your first scan
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // ✅ NORMALIZE SCORES - handles all key format variations
  const scores = normalizeScores(scoresJson);
  
  // Build aspects array with normalized scores
  const aspects = [
    { key: "skinQuality", label: "Skin Quality", score: scores.skinQuality },
    { key: "jawline", label: "Jawline Definition", score: scores.jawline },
    { key: "cheekbones", label: "Cheekbones", score: scores.cheekbones },
    { key: "symmetry", label: "Facial Symmetry", score: scores.symmetry },
    { key: "eyeArea", label: "Eye Area", score: scores.eyeArea },
    { key: "potential", label: "Potential", score: scores.potential },
  ];
  
  // Use REAL overall score from normalized data
  const overallScore = scores.overall ?? 0;
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("[AI] Normalized scores for display:");
  console.log("  overall:", scores.overall);
  console.log("  skinQuality:", scores.skinQuality);
  console.log("  jawline:", scores.jawline);
  console.log("  cheekbones:", scores.cheekbones);
  console.log("  symmetry:", scores.symmetry);
  console.log("  eyeArea:", scores.eyeArea);
  console.log("  potential:", scores.potential);
  console.log("[AI] UI will display:");
  console.log("  Overall:", formatScore(overallScore));
  console.log("  Skin Quality:", formatScore(scores.skinQuality));
  console.log("  Jawline:", formatScore(scores.jawline));
  console.log("  Cheekbones:", formatScore(scores.cheekbones));
  console.log("  Symmetry:", formatScore(scores.symmetry));
  console.log("  Eye Area:", formatScore(scores.eyeArea));
  console.log("  Potential:", formatScore(scores.potential));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const handleSaveProgress = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      onContinue();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onContinue();
  };

  // Helper function to get color based on score (0 = red, 50 = yellow, 100 = green)
  const getScoreColor = (score: number): string => {
    if (score === null || score === undefined) return "hsl(0, 0%, 50%)"; // gray for null
    
    // Clamp score between 0 and 100
    const clampedScore = Math.max(0, Math.min(100, score));
    
    // Map 0-100 to hue 0-120 (red to green)
    // 0 = red (hue 0), 50 = yellow (hue 60), 100 = green (hue 120)
    const hue = (clampedScore / 100) * 120;
    
    // Return HSL color with good saturation and lightness
    return `hsl(${hue}, 70%, 50%)`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <motion.div
        className="px-4 pt-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Success Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3 relative z-20">
          <h1 className="text-3xl font-bold">Your results are ready</h1>
          <p className="text-muted-foreground">
            Full analysis, glow-up plan & peptide matches unlocked.
          </p>
        </motion.div>

        {/* Unified Results Card */}
        <motion.div variants={itemVariants} className="relative mt-24">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 pt-20 relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />
            
            {/* Photo Bubble - positioned inside card, near top */}
            <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-10">
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-primary/30 blur-md" />
                {/* Perfect circle photo container */}
                <div 
                  className="relative w-24 h-24 rounded-full ring-4 ring-background bg-card overflow-hidden shadow-xl"
                  style={{ borderRadius: '9999px' }}
                >
                  {latestScanData?.front_image_url ? (
                    <img 
                      src={latestScanData.front_image_url} 
                      alt="Your photo" 
                      className="w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Eye className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative space-y-6">
              {/* Overall Score Section */}
              <div className="text-center space-y-3 pb-6 border-b border-border/30">
                <p className="text-sm text-muted-foreground uppercase tracking-wider">Overall Score</p>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.4 }}
                  className="text-6xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent"
                >
                  {formatScore(overallScore)}
                </motion.div>
                <div className="max-w-xs mx-auto">
                  <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressValue(overallScore)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full transition-all"
                      style={{ backgroundColor: getScoreColor(overallScore) }}
                    />
                  </div>
                </div>
              </div>

              {/* Sub-metrics 2×3 Grid */}
              <div className="grid grid-cols-2 gap-3">
                {aspects.map((aspect, index) => {
                  const scoreValue = aspect.score;
                  const isNull = scoreValue === null || scoreValue === undefined;
                  
                  return (
                    <motion.div
                      key={aspect.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className={`space-y-2 ${
                        aspect.key === "potential" 
                          ? "bg-primary/10 border-2 border-primary/50 rounded-xl p-3 shadow-lg shadow-primary/30" 
                          : ""
                      } ${isNull ? "opacity-50" : ""}`}
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wider truncate">
                        {aspect.label}
                      </p>
                      <p className={`text-xl font-bold ${aspect.key === "potential" ? "text-primary" : ""}`}>
                        {formatScore(scoreValue)}
                      </p>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressValue(scoreValue)}%` }}
                          transition={{ duration: 0.8, delay: 0.7 + index * 0.05 }}
                          className="h-full rounded-full transition-all"
                          style={{ backgroundColor: getScoreColor(scoreValue) }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI-Picked Peptides Section - 3-Card Row */}
        <motion.div variants={itemVariants} className="mt-8">
          <PeptideRecommendationsRow
            peptides={peptideRecommendations.peptides}
            loading={loadingPeptides}
            error={peptideError}
          />
        </motion.div>

        {/* Scan Images */}
        {latestScanData && (
          <motion.div variants={itemVariants} className="space-y-3">
            <h2 className="text-lg font-semibold text-center">Your Scan Photos</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Front photo", image: latestScanData.front_image_url },
                { label: "Side photo", image: latestScanData.side_image_url }
              ].map(({ label, image }) => (
                <div
                  key={label}
                  className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden"
                >
                  {image ? (
                    <img 
                      src={image} 
                      alt={label} 
                      className="w-full aspect-square object-cover" 
                    />
                  ) : (
                    <div className="w-full aspect-square flex flex-col items-center justify-center gap-3 p-4">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                        <CircleDashed className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Glow-Up Plan - with premium glow effect */}
        <motion.div variants={itemVariants} className="premium-glow rounded-2xl">
          <GlowUpPlanSection scanId={latestScanData.id} />
        </motion.div>

        {/* Peptide AI Coach */}
        <motion.div variants={itemVariants}>
          <PeptideCoachSection />
        </motion.div>

        {/* History */}
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            {scanHistory.length === 1 
              ? "Your first scan has been saved."
              : `${scanHistory.length} scans saved.`
            }
          </p>
          
          <div className="space-y-2">
            {scanHistory.slice(0, 3).map((scan, idx) => {
              const Element = scan.id && onViewScan ? "button" : "div";
              return (
                <Element
                  key={scan.id || idx}
                  onClick={scan.id && onViewScan ? () => onViewScan(scan.id!) : undefined}
                  className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 flex items-center justify-between w-full ${
                    idx === 0 ? "border-primary/50" : "border-border/50"
                  } ${scan.id && onViewScan ? "cursor-pointer hover:bg-card/80 transition-colors" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {idx === 0 && (
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {scan.date.toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric",
                          year: "numeric"
                        })}
                        {idx === 0 && <span className="text-primary ml-1">(Latest)</span>}
                      </p>
                      <p className="font-medium">Overall: {scan.score}</p>
                    </div>
                  </div>
                  {scan.id && onViewScan && (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Element>
              );
            })}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full gap-1.5"
            onClick={onNewScan}
          >
            <Plus className="w-4 h-4" />
            New scan
          </Button>
        </motion.div>

        {/* Account Creation CTA */}
        {!user && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
          >
            <Button
              onClick={handleSaveProgress}
              className="w-full py-6 rounded-xl font-semibold text-lg"
            >
              Create my account
            </Button>
          </motion.div>
        )}
      </motion.div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};
