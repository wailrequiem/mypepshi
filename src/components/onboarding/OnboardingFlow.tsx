import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GenderScreen } from "./screens/GenderScreen";
import { AgeScreen } from "./screens/AgeScreen";
import { GlobalSocialProofScreen } from "./screens/GlobalSocialProofScreen";
import { FaceScanScreen } from "./screens/FaceScanScreen";
import { PostScanTransitionScreen } from "./screens/PostScanTransitionScreen";
import { MultiSelectQuestionScreen } from "./screens/MultiSelectQuestionScreen";
import { MessageScreen } from "./screens/MessageScreen";
import { ImpactSocialProofScreen } from "./screens/ImpactSocialProofScreen";
import { ProjectionScreen } from "./screens/ProjectionScreen";
import { FinalEngagementScreen } from "./screens/FinalEngagementScreen";
import { AuthModal } from "@/components/auth/AuthModal";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { loadGuestPhotos } from "@/lib/guestPhotos";
import { savePendingScan } from "@/lib/pendingScan";

interface OnboardingFlowProps {
  onComplete: (data: any) => void;
  onLoginClick?: () => void;
}

export interface OnboardingData {
  gender: string;
  age: string;
  struggles: string[];
  compliments: string[];
  confidence: string[];
  lifestyle: string[];
  mirrorThoughts: string[];
  peptidesOpenness: string[];
  peptidesKnowledge: string[];
  peptidesGoals: string[];
  peptidesRiskTolerance: string[];
  peptidesPastExperience: string[];
  peptidesTiming: string[];
}

type OnboardingStep = 
  | "gender"
  | "age"
  | "socialProof1"
  | "faceScan"
  | "postScan"
  | "struggles"
  | "compliments"
  | "mission"
  | "futureProjection"
  | "untappedPotential"
  | "socialProof2"
  | "socialProof3"
  | "confidence"
  | "lifestyle"
  | "mirror"
  | "confidenceMessage"
  | "projection"
  | "peptidesOpenness"
  | "peptidesKnowledge"
  | "peptidesGoals"
  | "peptidesRiskTolerance"
  | "peptidesPastExperience"
  | "peptidesTiming"
  | "final";

const TOTAL_STEPS = 24;

const stepOrder: OnboardingStep[] = [
  "gender",
  "age", 
  "socialProof1",
  "faceScan",
  "postScan",
  "struggles",
  "compliments",
  "mission",
  "futureProjection",
  "untappedPotential",
  "socialProof2",
  "socialProof3",
  "confidence",
  "lifestyle",
  "mirror",
  "confidenceMessage",
  "projection",
  "peptidesOpenness",
  "peptidesKnowledge",
  "peptidesGoals",
  "peptidesRiskTolerance",
  "peptidesPastExperience",
  "peptidesTiming",
  "final"
];

export function OnboardingFlow({ onComplete, onLoginClick }: OnboardingFlowProps) {
  const { setAnswer, onboardingData, setCurrentStep, completeAndSync } = useOnboarding();
  const [currentStep, setCurrentStepState] = useState<OnboardingStep>(
    (onboardingData.current_step as OnboardingStep) || "gender"
  );
  const [showAuthModal, setShowAuthModal] = useState(false);

  const currentStepIndex = stepOrder.indexOf(currentStep) + 1;

  // Save current step whenever it changes
  // Note: setCurrentStep is excluded from deps to prevent infinite loops
  // (function reference may change, but we only care about currentStep value changes)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("[ONBOARDING] Current step:", currentStep);
    }
    setCurrentStep(currentStep);
  }, [currentStep]);

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStepState(stepOrder[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStepState(stepOrder[currentIndex - 1]);
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (import.meta.env.DEV) {
      console.log("[ONBOARDING] ✅ Login successful from onboarding");
    }
    // Don't reset onboarding - user can continue where they left off
  };

  const handleGender = (gender: string) => {
    setAnswer("gender", gender === "man" ? "male" : "female");
    goToNextStep();
  };

  const handleAge = (age: string) => {
    setAnswer("age", parseInt(age));
    goToNextStep();
  };

  const handleStruggles = (struggles: string[]) => {
    setAnswer("struggles", struggles);
    goToNextStep();
  };

  const handleCompliments = (compliments: string[]) => {
    setAnswer("compliments", compliments[0] || "");
    goToNextStep();
  };

  const handleConfidence = (confidence: string[]) => {
    setAnswer("confidence", confidence[0] || "");
    goToNextStep();
  };

  const handleLifestyle = (lifestyle: string[]) => {
    setAnswer("lifestyle", lifestyle);
    goToNextStep();
  };

  const handleMirror = (mirrorThoughts: string[]) => {
    setAnswer("mirror_thoughts", mirrorThoughts[0] || "");
    goToNextStep();
  };

  const handlePeptidesOpenness = (peptidesOpenness: string[]) => {
    setAnswer("peptides_openness", peptidesOpenness[0] || "");
    goToNextStep();
  };

  const handlePeptidesKnowledge = (peptidesKnowledge: string[]) => {
    setAnswer("peptides_knowledge", peptidesKnowledge[0] || "");
    goToNextStep();
  };

  const handlePeptidesGoals = (peptidesGoals: string[]) => {
    setAnswer("peptides_goals", peptidesGoals);
    goToNextStep();
  };

  const handlePeptidesRiskTolerance = (peptidesRiskTolerance: string[]) => {
    setAnswer("peptides_risk_tolerance", peptidesRiskTolerance[0] || "");
    goToNextStep();
  };

  const handlePeptidesPastExperience = (peptidesPastExperience: string[]) => {
    setAnswer("peptides_past_experience", peptidesPastExperience[0] || "");
    goToNextStep();
  };

  const handlePeptidesTiming = (peptidesTiming: string[]) => {
    setAnswer("peptides_timing", peptidesTiming[0] || "");
    goToNextStep();
  };

  const handleComplete = async () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 [OnboardingFlow] handleComplete called");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Load guest photos from localStorage
    const guestPhotos = loadGuestPhotos();
    console.log("📸 [OnboardingFlow] Guest photos:", guestPhotos ? "Found" : "Not found");
    
    if (guestPhotos && guestPhotos.frontPhotoBase64 && guestPhotos.sidePhotoBase64) {
      console.log("📸 [OnboardingFlow] Saving pending scan with photos...");
      
      // Save everything as pending scan (onboarding + photos)
      const saved = savePendingScan({
        onboarding: { ...onboardingData, completed: true },
        frontImage: guestPhotos.frontPhotoBase64,
        sideImage: guestPhotos.sidePhotoBase64,
      });
      
      if (saved) {
        console.log("✅ [OnboardingFlow] Pending scan saved successfully");
      } else {
        console.error("❌ [OnboardingFlow] Failed to save pending scan");
      }
    }
    
    // Mark onboarding as completed AND sync to Supabase in one call
    // This ensures completed: true is saved to the database
    await completeAndSync();
    console.log("✅ [OnboardingFlow] Onboarding marked as completed and synced");
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 [OnboardingFlow] Calling onComplete callback...");
    console.log("📊 [OnboardingFlow] Onboarding data:", onboardingData);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    // Call parent onComplete to redirect to paywall
    onComplete(onboardingData);
    
    console.log("✅ [OnboardingFlow] onComplete callback executed");
  };

  const canGoBack = stepOrder.indexOf(currentStep) > 0;

  const renderStep = () => {
    switch (currentStep) {
      case "gender":
        return (
          <GenderScreen
            onNext={handleGender}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
            onLoginClick={handleLoginClick}
          />
        );

      case "age":
        return (
          <AgeScreen
            onNext={handleAge}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "socialProof1":
        return (
          <GlobalSocialProofScreen
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "faceScan":
        return (
          <FaceScanScreen
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "postScan":
        return (
          <PostScanTransitionScreen
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "struggles":
        return (
          <MultiSelectQuestionScreen
            question="What are you struggling with the most right now?"
            options={[
              { emoji: "😕", label: "Not seeing results despite efforts", value: "no-results" },
              { emoji: "🪞", label: "Feeling limited by my appearance", value: "limited" },
              { emoji: "⏳", label: "Lack of consistency or direction", value: "inconsistent" },
              { emoji: "🧠", label: "Not knowing what actually works", value: "confused" },
              { emoji: "😞", label: "Low confidence or self-image", value: "low-confidence" },
              { emoji: "🔁", label: "Tried many things, nothing stuck", value: "nothing-stuck" },
            ]}
            onNext={handleStruggles}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
            onLoginClick={handleLoginClick}
          />
        );

      case "compliments":
        return (
          <MultiSelectQuestionScreen
            question="How often do people compliment your looks?"
            options={[
              { emoji: "😎", label: "Very often", value: "very-often" },
              { emoji: "🙂", label: "Sometimes", value: "sometimes" },
              { emoji: "😐", label: "Rarely", value: "rarely" },
              { emoji: "😶", label: "Almost never", value: "never" },
            ]}
            onNext={handleCompliments}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "mission":
        return (
          <MessageScreen
            badge="OUR MISSION"
            title="To help people like you become the best possible version of their appearance."
            showBeforeAfter={true}
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "futureProjection":
        return (
          <MultiSelectQuestionScreen
            question="If nothing changes, how will you feel in 6 months?"
            options={[
              { emoji: "😤", label: "Frustrated", value: "frustrated" },
              { emoji: "😕", label: "Disappointed", value: "disappointed" },
              { emoji: "😐", label: "The same", value: "same" },
              { emoji: "🙂", label: "Fine", value: "fine" },
            ]}
            onNext={() => goToNextStep()}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "untappedPotential":
        return (
          <MultiSelectQuestionScreen
            question="Do you believe you have untapped potential?"
            options={[
              { emoji: "🔥", label: "Yes, a lot", value: "yes-a-lot" },
              { emoji: "🤔", label: "Probably", value: "probably" },
              { emoji: "😕", label: "Not sure", value: "not-sure" },
              { emoji: "😞", label: "I don't think so", value: "no" },
            ]}
            onNext={() => goToNextStep()}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "socialProof2":
        return (
          <ImpactSocialProofScreen
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "socialProof3":
        return (
          <MessageScreen
            title="Most people don't have bad genetics"
            subtitle="They just lack the right optimization strategy."
            footnote="That's exactly what we help with."
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
            showTestimonial={true}
          />
        );

      case "confidence":
        return (
          <MultiSelectQuestionScreen
            question="How confident do you feel about your appearance right now?"
            options={[
              { emoji: "😤", label: "Very confident", value: "very-confident" },
              { emoji: "🙂", label: "Somewhat confident", value: "somewhat" },
              { emoji: "😕", label: "Not very confident", value: "not-very" },
              { emoji: "😞", label: "Not confident at all", value: "not-at-all" },
            ]}
            onNext={handleConfidence}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "lifestyle":
        return (
          <MultiSelectQuestionScreen
            question="Which best describes your current lifestyle?"
            options={[
              { emoji: "🏋️", label: "I train consistently", value: "train-consistent" },
              { emoji: "🥗", label: "I try to eat clean", value: "eat-clean" },
              { emoji: "⏳", label: "I'm inconsistent", value: "inconsistent" },
              { emoji: "🌱", label: "I'm just starting", value: "starting" },
            ]}
            onNext={handleLifestyle}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "mirror":
        return (
          <MultiSelectQuestionScreen
            question="When you look in the mirror, what do you usually think?"
            options={[
              { emoji: "😌", label: "I like what I see", value: "like-it" },
              { emoji: "🤔", label: "I see potential", value: "potential" },
              { emoji: "😕", label: "I notice flaws", value: "flaws" },
              { emoji: "😞", label: "I'm often disappointed", value: "disappointed" },
            ]}
            onNext={handleMirror}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "confidenceMessage":
        return (
          <MessageScreen
            title="Your face has more potential than you think"
            subtitle="Optimization beats genetics in most cases."
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "projection":
        return (
          <ProjectionScreen
            onNext={goToNextStep}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            projectedImprovement={49}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "peptidesOpenness":
        return (
          <MultiSelectQuestionScreen
            question="To reach your goals, would you be open to using peptides?"
            options={[
              { emoji: "🚫", label: "I don't know them / I don't want to use peptides for now", value: "not-interested" },
              { emoji: "🤔", label: "I'm curious but cautious", value: "curious-cautious" },
              { emoji: "✅", label: "Yes, if it's safe and well explained", value: "yes-if-safe" },
              { emoji: "🔬", label: "Yes, I'm already interested in peptides", value: "already-interested" },
            ]}
            onNext={handlePeptidesOpenness}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "peptidesKnowledge":
        return (
          <MultiSelectQuestionScreen
            question="How familiar are you with peptides?"
            options={[
              { emoji: "🧠", label: "I don't really know what they are", value: "dont-know" },
              { emoji: "📖", label: "I've heard about them", value: "heard-about" },
              { emoji: "🔍", label: "I've done some research", value: "researched" },
              { emoji: "🧪", label: "I know them quite well", value: "know-well" },
            ]}
            onNext={handlePeptidesKnowledge}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "peptidesGoals":
        return (
          <MultiSelectQuestionScreen
            question="What would you mainly want peptides to help you with (if you want to use peptides)?"
            options={[
              { emoji: "✨", label: "Skin quality & glow", value: "skin-glow" },
              { emoji: "💪", label: "Muscle growth", value: "muscle-growth" },
              { emoji: "🔥", label: "Fat loss / getting lean", value: "fat-loss" },
              { emoji: "🧠", label: "Recovery & well-being", value: "recovery" },
              { emoji: "😴", label: "Sleep & regeneration", value: "sleep" },
              { emoji: "⏭️", label: "Skip for now", value: "skip" },
            ]}
            onNext={handlePeptidesGoals}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={true}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "peptidesRiskTolerance":
        return (
          <MultiSelectQuestionScreen
            question="How cautious are you when trying new optimization tools?"
            options={[
              { emoji: "🛡️", label: "Very cautious, I need strong reassurance", value: "very-cautious" },
              { emoji: "⚖️", label: "Balanced, I like to understand before trying", value: "balanced" },
              { emoji: "🚀", label: "Open-minded, I'm willing to experiment", value: "open-minded" },
              { emoji: "🔥", label: "I'm not afraid to try new things", value: "adventurous" },
            ]}
            onNext={handlePeptidesRiskTolerance}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "peptidesPastExperience":
        return (
          <MultiSelectQuestionScreen
            question="Have you ever tried any performance or optimization supplements before?"
            options={[
              { emoji: "❌", label: "No, never", value: "never" },
              { emoji: "💊", label: "Yes, basic supplements", value: "basic-supplements" },
              { emoji: "🧬", label: "Yes, advanced supplements", value: "advanced-supplements" },
              { emoji: "🧪", label: "Yes, including research compounds", value: "research-compounds" },
            ]}
            onNext={handlePeptidesPastExperience}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "peptidesTiming":
        return (
          <MultiSelectQuestionScreen
            question="When would you consider using peptides (if at all)?"
            options={[
              { emoji: "⏳", label: "Not anytime soon", value: "not-soon" },
              { emoji: "🤔", label: "Maybe in the future", value: "future" },
              { emoji: "📅", label: "In the next few months", value: "next-months" },
              { emoji: "⚡", label: "As soon as I feel ready", value: "asap" },
            ]}
            onNext={handlePeptidesTiming}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            multiSelect={false}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      case "final":
        return (
          <FinalEngagementScreen
            onNext={handleComplete}
            totalSteps={TOTAL_STEPS}
            currentStep={currentStepIndex}
            onBack={canGoBack ? goToPreviousStep : undefined}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Auth Modal for Login */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
