import { Camera, BarChart3, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import step1_a from "@/assets/how-it-works/step1_a.jpg";
import step1_b from "@/assets/how-it-works/step1_b.jpg";
import step2 from "@/assets/how-it-works/step2.jpg";
import step3 from "@/assets/how-it-works/step3.jpg";
import step4 from "@/assets/how-it-works/step4.jpg";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Take a Quick Scan",
    description: "Snap a clear photo. That's all we need to analyze your unique facial features.",
    images: [step1_a, step1_b],
  },
  {
    number: "02",
    icon: BarChart3,
    title: "See What to Improve",
    description: "Get a clear breakdown of your strengths and the areas holding you back.",
    image: step2,
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Follow Your Plan",
    description: "Receive personalized weekly actions tailored specifically to your face and goals.",
    image: step3,
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Watch Yourself Transform",
    description: "Track your progress and see real improvements over time. This is your glow-up.",
    image: step4,
  },
];

// Media component with error handling
function MediaBlock({ images, image }: { images?: string[]; image?: string }) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (src: string) => {
    setImageErrors((prev) => new Set(prev).add(src));
  };

  // Fallback gradient when image fails to load
  const FallbackGradient = () => (
    <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
  );

  // Render two images side-by-side for step 01
  if (images && images.length === 2) {
    return (
      <div className="mb-4 grid grid-cols-2 gap-2">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="relative rounded-xl border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.08)] bg-secondary/30 overflow-hidden"
          >
            {imageErrors.has(src) ? (
              <div className="w-full h-[150px]">
                <FallbackGradient />
              </div>
            ) : (
              <img
                src={src}
                alt={`Step visual ${idx + 1}`}
                className="w-full h-auto"
                onError={() => handleImageError(src)}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Render single image for other steps
  if (image) {
    return (
      <div className="mb-4 rounded-xl border border-white/10 shadow-[0_0_30px_rgba(34,211,238,0.08)] bg-secondary/30 overflow-hidden">
        {imageErrors.has(image) ? (
          <div className="w-full h-[180px]">
            <FallbackGradient />
          </div>
        ) : (
          <img
            src={image}
            alt="Step visual"
            className="w-full h-auto"
            onError={() => handleImageError(image)}
          />
        )}
      </div>
    );
  }

  return null;
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative px-4 py-24 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">How It Works</span>
          </div>
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your Glow-Up in{" "}
            <span className="text-primary">4 Simple Steps</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Start in under a minute. See results within weeks.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-12 left-full hidden h-px w-full bg-border lg:block" />
              )}
              
              <div className="relative rounded-2xl border border-border bg-card/30 p-6 transition-all hover:border-primary/50 hover:bg-card/60">
                <div className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {step.number}
                </div>
                <div className="mb-4 mt-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                
                {/* Media Block */}
                <MediaBlock 
                  images={'images' in step ? step.images : undefined} 
                  image={'image' in step ? step.image : undefined} 
                />
                
                <h3 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
