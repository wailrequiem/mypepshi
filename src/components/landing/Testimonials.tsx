import { Quote, Sparkles, Star } from "lucide-react";
import marcusBeforeAfter from "@/assets/testimonial-marcus-before-after.jpg";
import sarahBeforeAfter from "@/assets/testimonial-sarah-before-after.png";

const testimonials = [
  {
    name: "Alex M.",
    role: "Software Engineer",
    content: "I didn't expect an app to be this precise. The scan highlighted details I'd never noticed, and the advice actually helped me adjust my grooming routine.",
    rating: 5,
  },
  {
    name: "Daniel K.",
    role: "Entrepreneur",
    content: "The masculinity score and feature breakdown made me see my face differently. It's not about changing who you are, just enhancing what's already there.",
    rating: 5,
  },
  {
    name: "Marcus R.",
    role: "Fitness Coach",
    content: "I loved how the app gave me practical, easy-to-follow tasks. It feels like a coach that knows my face better than I do.",
    rating: 5,
    image: marcusBeforeAfter,
  },
  {
    name: "Sarah L.",
    role: "Student",
    content: "Honestly, I didn't expect much… but the scan felt incredibly precise. The feedback was clear, personalized, and easy to apply.",
    rating: 5,
    image: sarahBeforeAfter,
  },
  {
    name: "Oliver P.",
    role: "Designer",
    content: "What impressed me most was how tailored the recommendations felt. It wasn't generic skincare tips — it was specific to my features.",
    rating: 5,
  },
  {
    name: "William T.",
    role: "Marketing Manager",
    content: "It's like having a personal style assistant in your pocket. You scan, you learn, and you evolve — it's that simple.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Testimonials</span>
          </div>
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            What Users Are{" "}
            <span className="text-primary">Saying</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Trusted by thousands looking to understand and improve their appearance.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.name}
              className="relative rounded-2xl border border-border bg-card/30 p-6 transition-all hover:border-primary/20 hover:bg-card/50"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
              
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              {/* Before/After Image */}
              {'image' in testimonial && testimonial.image && (
                <div className="mb-4 -mx-6 -mt-2">
                  <img
                    src={testimonial.image}
                    alt={`${testimonial.name} transformation`}
                    className="w-full h-auto rounded-t-2xl"
                  />
                </div>
              )}
              
              <p className="text-sm leading-relaxed text-muted-foreground">
                {`"${testimonial.content}"`}
              </p>
              
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
