import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
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
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Ready to Unlock Your{" "}
            <span className="text-primary">Potential?</span>
          </h2>
          
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground text-balance">
            Join thousands who have transformed their appearance with personalized, 
            AI-powered insights. Your first analysis is completely free.
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Get Your Analysis Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/paywall" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full bg-transparent">
                View Pricing
              </Button>
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required. Free forever tier available.
          </p>
        </div>
      </div>
    </section>
  );
}
