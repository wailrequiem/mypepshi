import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, Sparkles, TrendingUp } from "lucide-react";

export function Hero() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8 lg:pt-40 lg:pb-32">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>
      
      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">AI-Powered Bio-Optimization</span>
          </div>
          
          {/* Headline */}
          <h1 
            className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl" 
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Unlock Your{" "}
            <span className="text-primary">Full Potential</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance">
            Scan your face in seconds and get instant insights: personalized recommendations, 
            daily optimization tips, and progress tracking — all tailored just for you.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Get Your Analysis Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent" onClick={scrollToHowItWorks}>
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-10">
            <div>
              <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>50K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>1M+</div>
              <div className="mt-1 text-sm text-muted-foreground">Scans Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary" style={{ fontFamily: 'var(--font-display)' }}>94%</div>
              <div className="mt-1 text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Feature cards preview */}
        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
              <Scan className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Instant Analysis</h3>
          </div>
          
          <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Personalized Plan</h3>
          </div>
          
          <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Track Progress</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
