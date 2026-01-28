import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, TrendingUp, Target, Calendar, Check } from "lucide-react";

interface GlowUpPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  gender?: "man" | "woman" | null;
}

export function GlowUpPaywall({ isOpen, onClose, gender }: GlowUpPaywallProps) {
  const features = [
    {
      icon: Target,
      title: "Personalized Routine",
      description: "Custom glow-up plan based on your facial analysis",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your aesthetic evolution over time",
    },
    {
      icon: Calendar,
      title: "Daily Guidance",
      description: "Step-by-step recommendations for optimal results",
    },
    {
      icon: Sparkles,
      title: "Goal-Based Optimization",
      description: "Tailored to your personal improvement goals",
    },
  ];

  const plans = [
    {
      id: "monthly",
      name: "Monthly",
      price: "$9.99",
      period: "/month",
      popular: false,
    },
    {
      id: "yearly",
      name: "Yearly",
      price: "$59.99",
      period: "/year",
      popular: true,
      savings: "Save 50%",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
            className="min-h-full flex flex-col px-5 py-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 rounded-full glass flex items-center justify-center"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Unlock Your Glow Up
              </h1>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Get a personalized optimization plan tailored to your unique facial analysis and goals
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 glass rounded-xl p-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {feature.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pricing Plans */}
            <div className="space-y-3 mb-6">
              {plans.map((plan, index) => (
                <motion.button
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                    plan.popular
                      ? "bg-primary/20 border-2 border-primary"
                      : "glass border border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        plan.popular
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {plan.popular && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">
                        {plan.name}
                      </p>
                      {plan.savings && (
                        <span className="text-[10px] text-primary font-medium">
                          {plan.savings}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 rounded-2xl bg-primary text-primary-foreground font-semibold text-base glow-accent-subtle hover:glow-accent transition-all"
            >
              Start My Optimization Plan
            </motion.button>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-[10px] text-muted-foreground text-center mt-4"
            >
              Cancel anytime • Educational content only
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
