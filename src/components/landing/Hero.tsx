import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Check, Users, TrendingUp, Heart, Search } from "lucide-react";

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
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Personalized Glow-Up</span>
          </div>
          
          {/* Headline */}
          <h1 
            className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl" 
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Look better. Feel confident.{" "}
            <span className="text-primary">Get noticed.</span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-balance">
            Scan your face in under a minute and discover exactly what's holding your appearance back — 
            with a clear, personalized glow-up plan.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base py-6">
                Start My Glow-Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent" onClick={scrollToHowItWorks}>
              See How It Works
            </Button>
          </div>

          {/* Reassurance text */}
          <p className="mt-4 text-sm text-muted-foreground">
            Takes 60 seconds · No commitment
          </p>

          {/* Identification Section */}
          <div className="mt-12 rounded-2xl border border-border bg-card/30 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Perfect for you if you want to:
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Improve facial harmony</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Fix weak points</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Build confidence</span>
              </div>
            </div>
          </div>

          {/* Stats - B2C focused */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-10">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground text-center">Thousands of glow-ups started this month</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground text-center">Visible improvements within weeks</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-2">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground text-center">Used daily by people like you</div>
            </div>
          </div>
        </div>

        {/* Feature cards preview */}
        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Discover What to Fix</h3>
          </div>
          
          <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Get Your Personal Plan</h3>
          </div>
          
          <div className="group rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>See Real Results</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
