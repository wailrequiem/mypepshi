import { Camera, BarChart3, Lightbulb, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Upload Your Photo",
    description: "Take a clear, front-facing photo with neutral lighting. Our AI handles the rest.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Get Your Analysis",
    description: "Receive a detailed breakdown of your facial features, symmetry, and potential improvements.",
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Follow Your Plan",
    description: "Get personalized recommendations and weekly tasks tailored to your unique profile.",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Track Your Progress",
    description: "Monitor your transformation journey and see measurable improvements over time.",
  },
];

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
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">How It Works</span>
          </div>
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Simple Steps to{" "}
            <span className="text-primary">Transform</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Get started in minutes and begin your optimization journey today.
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
