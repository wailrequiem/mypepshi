import { Camera, Calendar, TrendingUp, MessageCircle, Shield, Target, Eye, Gift, ImageIcon } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Quick Face Scan",
    description: "One photo is all it takes to understand your unique features and areas for improvement.",
  },
  {
    icon: Eye,
    title: "Know Your Weak Points",
    description: "See exactly what's holding your appearance back — skin, jawline, symmetry, and more.",
  },
  {
    icon: Target,
    title: "Personalized Plan",
    description: "Get recommendations tailored to you — from skincare to grooming to lifestyle habits.",
  },
  {
    icon: Calendar,
    title: "Weekly Actions",
    description: "Small, easy steps each week that add up to real, visible transformation.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "See how far you've come with before-and-after comparisons over time.",
  },
  {
    icon: MessageCircle,
    title: "Expert Guidance",
    description: "Questions? Get answers from people who understand facial aesthetics.",
  },
  {
    icon: ImageIcon,
    title: "See Your Potential",
    description: "Visualize what you could look like after following your personalized plan.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your photos stay private. We never store or share them. Your transformation is yours alone.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <Gift className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">What You Get</span>
          </div>
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Everything You Need to{" "}
            <span className="text-primary">Glow Up</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            A complete toolkit to understand your face and transform your appearance.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="group rounded-2xl border border-border bg-card/30 p-6 transition-all hover:border-primary/50 hover:bg-card/60 text-center"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20 mx-auto">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
