import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How accurate is the facial analysis?",
    answer: "Our AI uses advanced computer vision algorithms trained on millions of facial images to provide highly accurate analysis. The system evaluates symmetry, proportions, and individual features with precision comparable to professional assessments.",
  },
  {
    question: "Is my photo data secure and private?",
    answer: "Absolutely. Your photos are processed in real-time and are never stored on our servers. All analysis happens securely, and your data is encrypted end-to-end. We take your privacy extremely seriously.",
  },
  {
    question: "How often should I scan my face?",
    answer: "We recommend weekly scans to track your progress effectively. This frequency allows you to see meaningful changes while following your personalized optimization plan.",
  },
  {
    question: "What kind of recommendations will I receive?",
    answer: "You'll get personalized advice covering grooming, skincare routines, lifestyle adjustments, nutrition tips, and exercises. All recommendations are tailored to your unique facial features and goals.",
  },
  {
    question: "Can I use PepMaxx on any device?",
    answer: "Yes! PepMaxx works on any modern smartphone, tablet, or computer with a camera. Our responsive design ensures a seamless experience across all devices.",
  },
  {
    question: "Is there a free trial available?",
    answer: "Yes, you can get your first facial analysis completely free. This includes a detailed breakdown of your features and initial recommendations. Premium features are available with our subscription plans.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">FAQ</span>
          </div>
          <h2 
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Frequently Asked{" "}
            <span className="text-primary">Questions</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Everything you need to know before getting started.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger 
                className="text-left hover:text-primary hover:no-underline"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
