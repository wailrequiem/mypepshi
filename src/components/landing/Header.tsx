import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Header() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            PepMaxx
          </span>
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          <button onClick={() => scrollToSection('features')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </button>
          <button onClick={() => scrollToSection('testimonials')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Testimonials
          </button>
          <button onClick={() => scrollToSection('faq')} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/onboarding">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Log in
            </Button>
          </Link>
          <Link to="/onboarding">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
