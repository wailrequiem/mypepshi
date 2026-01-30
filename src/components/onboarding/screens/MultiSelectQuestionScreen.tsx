import { useState } from "react";
import { motion } from "framer-motion";
import { OnboardingOption } from "../OnboardingOption";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface Option {
  emoji: string;
  label: string;
  value: string;
}

interface MultiSelectQuestionScreenProps {
  question: string;
  subtitle?: string;
  options: Option[];
  onNext: (selected: string[]) => void;
  totalSteps: number;
  currentStep: number;
  multiSelect?: boolean;
  onBack?: () => void;
  onLoginClick?: () => void;
}

export function MultiSelectQuestionScreen({ 
  question, 
  subtitle,
  options, 
  onNext, 
  totalSteps, 
  currentStep,
  multiSelect = true,
  onBack,
  onLoginClick
}: MultiSelectQuestionScreenProps) {
  const [selected, setSelected] = useState<string[]>([]);

  // Determine if this question has only one possible answer
  const hasOnlyOneOption = options.length === 1;
  
  // Show Continue button if:
  // - Multi-select (user needs to confirm selections)
  // - OR single-select with multiple options (user has a real choice)
  const showContinueButton = multiSelect || !hasOnlyOneOption;

  const toggleOption = (value: string) => {
    if (multiSelect) {
      setSelected(prev => 
        prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
      );
    } else {
      setSelected([value]);
      // Auto-advance ONLY if there's just 1 option (no real choice)
      if (hasOnlyOneOption) {
        setTimeout(() => onNext([value]), 300);
      }
    }
  };

  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
        onLoginClick={onLoginClick}
      />
      
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {question}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm">
              {subtitle}
            </p>
          )}
          {multiSelect && (
            <p className="text-muted-foreground text-sm mt-1">
              Select all that apply
            </p>
          )}
        </motion.div>

        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
          {options.map((option, index) => (
            <OnboardingOption
              key={option.value}
              emoji={option.emoji}
              label={option.label}
              selected={selected.includes(option.value)}
              onClick={() => toggleOption(option.value)}
              delay={0.1 + index * 0.05}
            />
          ))}
        </div>
      </div>

      {showContinueButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-4 pt-4"
        >
          <PrimaryButton
            onClick={() => onNext(selected)}
            disabled={selected.length === 0}
          >
            Continue
          </PrimaryButton>
        </motion.div>
      )}
    </PageContainer>
  );
}
