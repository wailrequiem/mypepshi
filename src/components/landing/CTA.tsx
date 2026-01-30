import { Link } from "react-router-dom";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative px-4 py-24 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>
      
      <div className="relative mx-auto max-w-4xl">
        <div className="rounded-3xl border border-primary/20 bg-card/50 p-8 text-center backdrop-blur-sm sm:p-12 lg:p-16">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to See{" "}
            <span className="text-primary">Your Best Self?</span>
          </h2>
          
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground text-balance">
            Join thousands who have started their transformation journey. 
            Your personalized glow-up plan is just one scan away.
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base py-6">
                Start My Glow-Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent" onClick={() => {
              const element = document.getElementById('how-it-works');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}>
              See How It Works
            </Button>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            Takes 60 seconds · No commitment required
          </p>
        </div>
      </div>
    </section>
  );
}
