import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageContainer } from "@/components/layout/PageContainer";
import { OnboardingHeader } from "../OnboardingHeader";

interface MessageScreenProps {
  badge?: string;
  title: string;
  subtitle?: string;
  footnote?: string;
  onNext: () => void;
  totalSteps: number;
  currentStep: number;
  showButton?: boolean;
  buttonText?: string;
  onBack?: () => void;
  showBeforeAfter?: boolean;
  showTestimonial?: boolean;
}

// Testimonial constants - easily replaceable
const TESTIMONIAL_DATA = {
  stars: 5,
  title: "Didn't know I could look this good…",
  review: "I was skeptical at first, but the personalized approach completely changed how I look and feel. The results speak for themselves.",
  author: "Mark, 23",
  timeframe: "8 weeks progress",
  combinedImage: "/src/assets/testimonial-before-after.png", // Single before/after image
};

export function MessageScreen({ 
  badge,
  title, 
  subtitle,
  footnote,
  onNext, 
  totalSteps, 
  currentStep,
  showButton = true,
  buttonText = "Continue",
  onBack,
  showBeforeAfter = false,
  showTestimonial = false
}: MessageScreenProps) {
  // Images are loaded from /public folder
  const beforeImage = "/before.jpg";
  const afterImage = "/after.jpg";
  return (
    <PageContainer className="px-6 py-8 safe-top safe-bottom">
      <OnboardingHeader 
        current={currentStep} 
        total={totalSteps} 
        onBack={onBack}
        showBack={!!onBack}
      />
      
      <div className="flex-1 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-sm"
        >
          {badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6"
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {badge}
              </span>
            </motion.div>
          )}
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight"
          >
            {title}
          </motion.h1>
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg"
            >
              {subtitle}
            </motion.p>
          )}
          
          {footnote && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground/60 text-sm mt-6"
            >
              {footnote}
            </motion.p>
          )}
        </motion.div>

        {/* Before / After Social Proof */}
        {showBeforeAfter && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-sm mt-10 px-4"
          >
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Before Image */}
              <div className="relative group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-primary/20 bg-surface/50 backdrop-blur-sm">
                  {beforeImage ? (
                    <img 
                      src={beforeImage} 
                      alt="Before transformation"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <span className="text-muted-foreground/50 text-xs">Add before.jpg</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] font-semibold text-white uppercase tracking-wide">
                        Before
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* After Image */}
              <div className="relative group">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-primary/30 bg-surface/50 backdrop-blur-sm shadow-lg shadow-primary/10">
                  {afterImage ? (
                    <img 
                      src={afterImage} 
                      alt="After transformation"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <span className="text-muted-foreground/50 text-xs">Add after.jpg</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className="px-2 py-0.5 rounded-full bg-primary/80 backdrop-blur-sm border border-primary/30">
                      <span className="text-[10px] font-semibold text-white uppercase tracking-wide">
                        After
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Proof Caption */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-xs text-muted-foreground/80 font-medium"
            >
              Real user. Real routine. Real results.
            </motion.p>
          </motion.div>
        )}

        {/* Testimonial Card */}
        {showTestimonial && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-sm mt-12"
          >
            <div className="relative rounded-2xl border border-primary/20 bg-card/30 backdrop-blur-sm p-6 shadow-lg shadow-primary/5">
              {/* 5 Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(TESTIMONIAL_DATA.stars)].map((_, i) => (
                  <span key={i} className="text-primary text-lg">⭐</span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
                {TESTIMONIAL_DATA.title}
              </h3>

              {/* Review Text */}
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {TESTIMONIAL_DATA.review}
              </p>

              {/* Author */}
              <p className="text-muted-foreground/70 text-sm font-medium mb-6">
                — {TESTIMONIAL_DATA.author}
              </p>

              {/* Before/After Combined Image */}
              <div className="relative">
                <div className="relative aspect-[2/1] rounded-lg overflow-hidden border border-primary/20 bg-surface/30">
                  {TESTIMONIAL_DATA.combinedImage ? (
                    <img 
                      src={TESTIMONIAL_DATA.combinedImage} 
                      alt="Before and After transformation"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <span className="text-muted-foreground/50 text-xs font-medium">Before & After</span>
                    </div>
                  )}
                </div>

                {/* Progress Badge - Centered at bottom */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm border border-primary/30 shadow-lg shadow-primary/20">
                    <span className="text-xs font-semibold text-white whitespace-nowrap">
                      {TESTIMONIAL_DATA.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {showButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="pb-4"
        >
          <PrimaryButton onClick={onNext}>
            {buttonText}
          </PrimaryButton>
        </motion.div>
      )}
    </PageContainer>
  );
}
