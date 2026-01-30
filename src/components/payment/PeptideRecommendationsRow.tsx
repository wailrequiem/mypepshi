import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, X, Info, Lightbulb, Shield, Clock, AlertTriangle, Check, Brain } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { explainPeptide, type PeptideExplanation } from "@/lib/peptides/explainPeptide";

// Fallback peptides data (used when API returns empty/fails)
const FALLBACK_PEPTIDES = [
  {
    name: "GHK-Cu",
    fit_score: 92,
    tags: ["Skin", "Anti-aging", "Collagen"],
    summary: "Promotes collagen production and skin regeneration. Known for wound healing and anti-aging benefits.",
    full_description: "GHK-Cu (Copper Peptide) is a naturally occurring peptide that has been extensively studied for its regenerative properties. It stimulates collagen and elastin production, promotes wound healing, and provides powerful antioxidant effects. Clinical studies show improvements in skin firmness, elasticity, and reduction of fine lines.",
    benefits: [
      "Stimulates collagen and elastin synthesis",
      "Improves skin firmness and elasticity",
      "Reduces appearance of fine lines and wrinkles",
      "Promotes wound healing",
      "Provides antioxidant protection"
    ],
    disclaimer: "This peptide is for research purposes only. Consult with a healthcare professional before use."
  },
  {
    name: "BPC-157",
    fit_score: 88,
    tags: ["Recovery", "Healing", "Joint"],
    summary: "Accelerates healing of muscles, tendons, and ligaments. Supports gut health and reduces inflammation.",
    full_description: "BPC-157 (Body Protection Compound) is a synthetic peptide derived from a protective protein found in the stomach. It has shown remarkable healing properties for soft tissue injuries, joint health, and gastrointestinal protection. Research indicates it may accelerate recovery from various injuries.",
    benefits: [
      "Accelerates healing of soft tissue injuries",
      "Supports tendon and ligament repair",
      "Promotes joint health and mobility",
      "Protects and heals the gut lining",
      "Reduces inflammation"
    ],
    disclaimer: "This peptide is for research purposes only. Consult with a healthcare professional before use."
  },
  {
    name: "Epithalon",
    fit_score: 85,
    tags: ["Longevity", "Sleep", "Anti-aging"],
    summary: "Regulates circadian rhythm and supports healthy sleep patterns. May have longevity benefits.",
    full_description: "Epithalon is a synthetic tetrapeptide that has been researched for its potential anti-aging and longevity effects. It works by regulating the pineal gland and normalizing melatonin levels, which can improve sleep quality and support healthy circadian rhythms. Some research suggests it may help maintain telomere length.",
    benefits: [
      "Improves sleep quality and circadian rhythm",
      "May support cellular longevity",
      "Regulates melatonin production",
      "Supports healthy aging processes",
      "Enhances overall vitality"
    ],
    disclaimer: "This peptide is for research purposes only. Consult with a healthcare professional before use."
  }
];

interface Peptide {
  name: string;
  fit_score: number;
  tags?: string[];
  summary: string;
  full_description?: string;
  benefits?: string[];
  disclaimer?: string;
}

interface PeptideRecommendationsRowProps {
  peptides?: Peptide[];
  loading?: boolean;
  error?: boolean;
}

export const PeptideRecommendationsRow = ({ 
  peptides, 
  loading = false,
  error = false 
}: PeptideRecommendationsRowProps) => {
  const [selectedPeptide, setSelectedPeptide] = useState<Peptide | null>(null);
  const [explanation, setExplanation] = useState<PeptideExplanation | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);

  // Fetch AI explanation when a peptide is selected
  useEffect(() => {
    if (!selectedPeptide) {
      setExplanation(null);
      return;
    }

    async function fetchExplanation() {
      setExplanationLoading(true);
      try {
        const result = await explainPeptide({
          peptide: {
            name: selectedPeptide.name,
            fit_score: selectedPeptide.fit_score,
            tags: selectedPeptide.tags,
            summary: selectedPeptide.summary,
          },
          // Could add user context here if available
          // userContext: { scanScores, goals, notes }
        });
        setExplanation(result);
      } catch (error) {
        console.error("Failed to fetch explanation:", error);
        // Explanation will use defaults from the helper
      } finally {
        setExplanationLoading(false);
      }
    }

    fetchExplanation();
  }, [selectedPeptide]);

  // Use API peptides if available and has data, otherwise use fallback
  // Always ensure we have exactly 3 peptides
  const displayPeptides = (peptides && peptides.length > 0) 
    ? peptides.slice(0, 3) 
    : FALLBACK_PEPTIDES;

  // Ensure exactly 3 cards (pad with fallback if needed)
  const finalPeptides = [...displayPeptides];
  while (finalPeptides.length < 3) {
    finalPeptides.push(FALLBACK_PEPTIDES[finalPeptides.length % FALLBACK_PEPTIDES.length]);
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return "from-emerald-500 to-green-400";
    if (score >= 80) return "from-cyan-500 to-blue-400";
    if (score >= 70) return "from-blue-500 to-indigo-400";
    return "from-indigo-500 to-purple-400";
  };

  return (
    <>
      {/* Section Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="flex items-center justify-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" strokeWidth={2} />
          <h3 className="text-xl font-semibold">AI-Picked Peptides for Your Goals</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Matched to your scan and answers
        </p>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 animate-pulse"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-5 bg-muted/50 rounded w-24" />
                  <div className="h-6 bg-muted/50 rounded-full w-20" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 bg-muted/50 rounded-full w-16" />
                  <div className="h-6 bg-muted/50 rounded-full w-20" />
                  <div className="h-6 bg-muted/50 rounded-full w-16" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Peptide Cards - Grid on Desktop, Carousel on Mobile */}
      {!loading && (
        <>
          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {finalPeptides.slice(0, 3).map((peptide, index) => (
              <motion.button
                key={`${peptide.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedPeptide(peptide)}
                className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-5 text-left hover:border-primary/40 hover:bg-card/70 transition-all duration-300 group"
                style={{
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)'
                }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-4">
                  {/* Header: Name + Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-base font-semibold text-foreground leading-tight">
                      {peptide.name}
                    </h4>
                    <div 
                      className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${getScoreColor(peptide.fit_score)} text-white text-xs font-medium whitespace-nowrap shadow-lg`}
                    >
                      {peptide.fit_score}% fit
                    </div>
                  </div>

                  {/* Tags */}
                  {peptide.tags && peptide.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {peptide.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-0.5 rounded-full bg-card border border-border/50 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Summary - 2 lines max */}
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {peptide.summary}
                  </p>

                  {/* Hover indicator */}
                  <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-3 h-3" />
                    <span>Click for details</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Mobile: Horizontal Carousel */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4">
              {finalPeptides.slice(0, 3).map((peptide, index) => (
                <motion.button
                  key={`${peptide.name}-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPeptide(peptide)}
                  className="relative flex-shrink-0 w-[85vw] bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-5 text-left snap-center"
                  style={{
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)'
                  }}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl pointer-events-none" />
                  
                  <div className="relative space-y-4">
                    {/* Header: Name + Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-base font-semibold text-foreground leading-tight">
                        {peptide.name}
                      </h4>
                      <div 
                        className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${getScoreColor(peptide.fit_score)} text-white text-xs font-medium whitespace-nowrap shadow-lg`}
                      >
                        {peptide.fit_score}% fit
                      </div>
                    </div>

                    {/* Tags */}
                    {peptide.tags && peptide.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {peptide.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-0.5 rounded-full bg-card border border-border/50 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Summary - 2 lines max */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {peptide.summary}
                    </p>

                    {/* Tap indicator */}
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Info className="w-3 h-3" />
                      <span>Tap for details</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Carousel Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/30"
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPeptide && (
          <Dialog open={!!selectedPeptide} onOpenChange={() => setSelectedPeptide(null)}>
            <DialogContent className="max-w-lg bg-card/95 backdrop-blur-md border-primary/30">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedPeptide.name}
                      </h2>
                      <div 
                        className={`inline-flex px-3 py-1.5 rounded-full bg-gradient-to-r ${getScoreColor(selectedPeptide.fit_score)} text-white text-sm font-medium shadow-lg`}
                      >
                        {selectedPeptide.fit_score}% match for your goals
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPeptide(null)}
                      className="p-2 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tags */}
                  {selectedPeptide.tags && selectedPeptide.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPeptide.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Full Description */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    About
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedPeptide.full_description || selectedPeptide.summary}
                  </p>
                </div>

                {/* Benefits */}
                {selectedPeptide.benefits && selectedPeptide.benefits.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                      Key Benefits
                    </h3>
                    <ul className="space-y-2">
                      {selectedPeptide.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Explanation Section */}
                <div className="space-y-4 border-t border-border pt-6">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      AI Explanation
                    </h3>
                  </div>

                  {explanationLoading ? (
                    // Loading skeleton
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="animate-spin">⚡</div>
                        <span>Generating personalized explanation...</span>
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                    </div>
                  ) : explanation ? (
                    // Explanation content
                    <div className="space-y-5">
                      {/* Why This Matters */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Why This Peptide
                          </h4>
                        </div>
                        <ul className="space-y-1.5">
                          {explanation.why_this.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* How to Use Safely */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Safe Usage Guidance
                          </h4>
                        </div>
                        <ul className="space-y-1.5">
                          {explanation.how_to_use_safely.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* What to Expect */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            What to Expect
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {explanation.what_to_expect}
                        </p>
                      </div>

                      {/* Warnings */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Important Warnings
                          </h4>
                        </div>
                        <ul className="space-y-1.5">
                          {explanation.warnings.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                              <span className="text-amber-500 mt-0.5">⚠</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Disclaimer */}
                {selectedPeptide.disclaimer && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
                      <strong className="font-semibold">Disclaimer:</strong> {selectedPeptide.disclaimer}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => setSelectedPeptide(null)}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors"
                >
                  Got it
                </button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};
