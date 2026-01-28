import { Brain, Calendar, Camera, TrendingUp, MessageCircle, Shield, Sparkles, Target } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Advanced Facial Scan",
    description: "Our AI analyzes symmetry, proportions, features, and more with just a single photo.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get detailed breakdowns of your facial features with actionable improvement areas.",
  },
  {
    icon: Target,
    title: "Personalized Recommendations",
    description: "Receive tailored tips from grooming and skincare to lifestyle and nutrition.",
  },
  {
    icon: Calendar,
    title: "Weekly Optimization Tasks",
    description: "Small, guided actions each week to help you improve steadily and see real results.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your transformation over time with before-and-after comparisons.",
  },
  {
    icon: MessageCircle,
    title: "Expert Consultations",
    description: "Have questions? Get answers directly from facial aesthetics professionals.",
  },
  {
    icon: Sparkles,
    title: "Transformation Preview",
    description: "See what your optimized self could look like with AI-generated visualizations.",
  },
  {
    icon: Shield,
    title: "100% Private & Secure",
    description: "Your photos are processed securely and never stored. Your privacy is paramount.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Features</span>
          </div>
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything You Need to{" "}
            <span className="text-primary">Optimize</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Powerful tools designed to help you understand and enhance your natural features.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="group rounded-2xl border border-border bg-card/30 p-6 transition-all hover:border-primary/50 hover:bg-card/60"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
