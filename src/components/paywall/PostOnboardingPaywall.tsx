import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Shield, Lock, Check, Users, Clock, Star, ChevronLeft, Mail, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { LockedPeptideCoachSection } from "@/components/payment/LockedPeptideCoachSection";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { BeforeAfterReviewsCarousel } from "@/components/paywall/BeforeAfterReviewsCarousel";

interface PostOnboardingPaywallProps {
  onUnlock: () => void;
  gender?: "man" | "woman" | null;
}

export function PostOnboardingPaywall({ onUnlock, gender }: PostOnboardingPaywallProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>("1month");
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pricingSectionRef = useRef<HTMLDivElement>(null);
  const peptideScrollRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const scrollToPricing = () => {
    pricingSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGlowUpNow = () => {
    if (!user) {
      console.log("🔐 [Paywall] User not authenticated, showing auth modal");
      setShowAuthModal(true);
    } else {
      console.log("✅ [Paywall] User authenticated, proceeding to unlock");
      onUnlock();
    }
  };

  const handleAuthSuccess = () => {
    console.log("✅ [Paywall] Auth successful, closing modal");
    setShowAuthModal(false);
    // Don't call onUnlock() here - let Paywall.tsx processGuestPhotos() handle it
  };

  const plans = [
    { id: "7days", name: "7-day plan", price: "$0.99", originalPrice: "$2.99", perDay: "", highlight: false },
    { id: "1month", name: "1-month plan", price: "$19.99", originalPrice: "$39.99", perDay: "$0.66/day", highlight: true, badge: "MOST POPULAR" },
    { id: "3months", name: "3-month plan", price: "$34.99", originalPrice: "$69.99", perDay: "$0.38/day", highlight: false },
  ];

  const scoreComparison = [
    { name: "Attractiveness", before: 48, after: 81 },
    { name: "Confidence", before: 32, after: 78 },
  ];

  const peptideCards = [
    { name: "BPC-157", subtitle: "Skin quality & glow", fit: 95 },
    { name: "Ipamorelin", subtitle: "Fat loss & definition", fit: 100 },
    { name: "TB-500", subtitle: "Recovery & well-being", fit: 30 },
  ];

  const finalReviews = [
    {
      image: "😊",
      text: "After 8 weeks, my jawline is more defined and my skin looks completely different. People keep asking what I changed.",
      name: "Marcus",
      age: 26,
      duration: "3 months",
    },
    {
      image: "🙂",
      text: "I was skeptical but the personalized approach actually worked. My confidence is way higher now and I've lost stubborn fat.",
      name: "Jordan",
      age: 22,
      duration: "2 months",
    },
  ];

  const StarRating = () => (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
      ))}
    </div>
  );

  return (
    <PageContainer className="px-4 py-6 safe-top pb-28 overflow-y-auto no-copy">
      {/* Before/After Transformation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center gap-2">
          {/* Before Image */}
          <div className="relative flex-1 max-w-[140px]">
            <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-surface border border-border">
              <img 
                src="/src/assets/paywall-before.png"
                alt="Before transformation"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(0.85) saturate(0.8)" }}
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-muted-foreground font-medium">Before</span>
            </div>
          </div>

          {/* Arrow */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <ChevronRight className="w-5 h-5 text-primary-foreground" />
            </div>
          </motion.div>

          {/* After Image - Sharp, aspirational */}
          <div className="relative flex-1 max-w-[140px]">
            <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-surface border-2 border-primary/60 glow-accent">
              <img 
                src="/src/assets/paywall-after.png"
                alt="After transformation"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse drop-shadow-lg" />
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-primary font-semibold">After</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Score Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 space-y-4"
      >
        {scoreComparison.map((item, index) => (
          <div key={item.name} className="glass rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{item.before}%</span>
                <ChevronRight className="w-4 h-4 text-primary" />
                <span 
                  className="text-sm font-bold text-primary"
                  style={{ filter: "blur(1.5px)" }}
                >
                  {item.after}%
                </span>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              {/* Before bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.before}%` }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                className="absolute h-full bg-muted-foreground/40 rounded-full"
              />
              {/* After bar (blurred) */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.after}%` }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                className="absolute h-full bg-primary rounded-full"
                style={{ filter: "blur(2px)", opacity: 0.7 }}
              />
            </div>
          </div>
        ))}

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 pt-2"
        >
          <Users className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">14 people</span> bought our plan in the last hour
          </p>
        </motion.div>
      </motion.div>

      {/* Pricing Section */}
      <motion.div
        ref={pricingSectionRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-xs text-accent font-semibold uppercase tracking-wide">Limited-time offer</span>
        </div>
        <h2 className="text-lg font-semibold text-foreground text-center mb-4">
          Get Started with Special Pricing
        </h2>
        <div className="space-y-3">
          {plans.map((plan, index) => (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all relative ${
                selectedPlan === plan.id
                  ? "bg-primary/20 border-2 border-primary"
                  : "glass border border-border"
              } ${plan.highlight ? "ring-1 ring-primary/50" : ""}`}
            >
              {plan.badge && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary rounded-full">
                  <span className="text-[10px] font-bold text-primary-foreground tracking-wide">{plan.badge}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {selectedPlan === plan.id && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{plan.name}</p>
                  {plan.perDay && (
                    <span className="text-[11px] text-muted-foreground">{plan.perDay}</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground line-through mr-1.5">{plan.originalPrice}</span>
                <span className="text-lg font-bold text-foreground">{plan.price}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Guarantee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center justify-center gap-2 mb-5"
      >
        <Shield className="w-5 h-5 text-primary" />
        <p className="text-sm font-bold text-foreground underline underline-offset-2">
          30-day money-back guarantee
        </p>
      </motion.div>

      {/* Subscribe CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <button 
          onClick={handleGlowUpNow}
          className="w-full py-4 px-6 rounded-2xl bg-accent text-accent-foreground font-bold text-base shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all active:scale-[0.98]"
        >
          {user ? "Glow Up Now" : "Create Account to Continue"}
        </button>
        {!user && (
          <p className="text-center text-xs text-muted-foreground mt-2">
            Sign up to unlock your personalized plan
          </p>
        )}
      </motion.div>

      {/* Locked Results Preview - Glow-Up Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="relative mb-8"
      >
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">Locked</span>
        </div>
        
        <div className="glass rounded-2xl p-5 relative overflow-hidden">
          <h4 className="text-base font-semibold text-foreground mb-1">
            We've created a glow-up plan for you
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Based on your face scan and answers
          </p>
          
          {/* Blurred content */}
          <div 
            className="relative"
            style={{ filter: "blur(3px)" }}
          >
            <img 
              src="/src/assets/glowup-plan.png"
              alt="Glow-up plan preview"
              className="w-full rounded-lg"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent rounded-2xl z-10 pointer-events-none" />
        </div>
      </motion.div>

      {/* AI-Picked Peptides Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="mb-8"
      >
        <div className="relative mb-4">
          <div className="absolute top-0 right-0 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-medium">Locked</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            AI-Picked Peptides for Your Goals
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Not all peptides work for everyone. Based on your face scan and answers, we identify the most relevant peptides for you — no guesswork, no trial and error.
          </p>
        </div>

        {/* Peptide Cards Carousel */}
        <div 
          ref={peptideScrollRef}
          className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {peptideCards.map((peptide, index) => (
            <motion.div
              key={peptide.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + index * 0.1 }}
              className="flex-shrink-0 w-[160px] glass rounded-2xl p-4 border border-border relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none"
                style={{ filter: "blur(2px)" }}
              />
              <div className="relative z-0" style={{ filter: "blur(3px)" }}>
                <h4 className="text-sm font-semibold text-foreground mb-1">{peptide.name}</h4>
                <p className="text-[11px] text-muted-foreground mb-3">{peptide.subtitle}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${peptide.fit >= 80 ? "bg-primary" : peptide.fit >= 50 ? "bg-accent" : "bg-muted-foreground"}`}
                      style={{ width: `${peptide.fit}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${peptide.fit >= 80 ? "text-primary" : peptide.fit >= 50 ? "text-accent" : "text-muted-foreground"}`}>
                    {peptide.fit}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Star Reviews Carousel */}
        <div className="mt-4">
          <BeforeAfterReviewsCarousel />
        </div>

        {/* Peptide CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-4"
        >
          <button 
            onClick={handleGlowUpNow}
            className="w-full py-3.5 px-6 rounded-2xl bg-primary/20 border border-primary text-primary font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Lock className="w-4 h-4" />
            {user ? "Get My Full Peptide Recommendations" : "Sign Up to View Recommendations"}
          </button>
        </motion.div>
      </motion.div>

      {/* Locked Peptide AI Coach Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.45 }}
        className="mb-8"
      >
        <LockedPeptideCoachSection onUnlock={scrollToPricing} />
      </motion.div>

      {/* Final Social Proof Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="mb-8"
      >
        <h3 className="text-lg font-semibold text-foreground text-center mb-4">
          Hundreds More Five-Star Reviews
        </h3>
        <div className="space-y-4">
          {finalReviews.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + index * 0.1 }}
              className="glass rounded-2xl p-4 border border-border premium-glow"
            >
              {/* Review Image */}
              <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-surface flex items-center justify-center">
                <span className="text-3xl">{review.image}</span>
              </div>
              <div className="flex justify-center mb-3">
                <StarRating />
              </div>
              <p className="text-sm text-foreground/90 text-center leading-relaxed italic">
                "{review.text}"
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-xs font-semibold text-foreground">{review.name}, {review.age}</span>
                <span className="text-xs text-muted-foreground">• Used Maxxing for {review.duration}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="mb-8"
      >
        <button 
          onClick={handleGlowUpNow}
          className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-bold text-base glow-accent flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Lock className="w-5 h-5" />
          {user ? "Get My Glow-Up Plan" : "Create Account to Get Plan"}
        </button>
      </motion.div>

      {/* Trust & Reassurance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9 }}
        className="space-y-4 mb-8"
      >
        {/* Card 1 - Subscription Disclosure */}
        <div className="glass rounded-2xl p-4 border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            This is an auto-renewing subscription.
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your first payment is $19.99 as an introductory offer. All future payments of your Maxxing Premium subscription will be automatically charged the full price of $39.99 every 1 month unless cancelled.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            You can cancel the subscription via app settings or by contacting support.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            This subscription is bound by our Privacy Policy, Terms of Use, Fulfillment Policy and Refund Policy.
          </p>
        </div>

        {/* Card 2 - Money-Back Guarantee */}
        <div className="glass rounded-2xl p-4 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              100% Money-Back Guarantee
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We are confident in our service quality and results. If you don't see visible results, you can request a full refund within 30 days.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            You must demonstrate that you followed the program.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary">30 days money-back</span>
          </div>
        </div>

        {/* Card 3 - Data & Support */}
        <div className="glass rounded-2xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground">
              Your information is safe
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We will not sell or share your personal information for any marketing purposes.
          </p>
          <button className="mt-3 flex items-center gap-2 text-xs text-primary font-medium">
            <Mail className="w-3.5 h-3.5" />
            Need help? Contact us here
          </button>
        </div>
      </motion.div>

      {/* Full-Width Urgency Timer Bar */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
        >
          <div className="w-full bg-surface-elevated/98 backdrop-blur-lg border-t border-border shadow-2xl">
            <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Offer expires in</p>
                  <p className={`text-xl font-bold tabular-nums ${timeLeft <= 60 ? "text-red-500 animate-pulse" : "text-foreground"}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
              <button
                onClick={scrollToPricing}
                className="py-3 px-6 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-lg shadow-accent/30 hover:shadow-accent/50 transition-all active:scale-[0.98]"
              >
                Get the offer
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </PageContainer>
  );
}
