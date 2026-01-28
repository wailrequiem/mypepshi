import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface PromptCardProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  index?: number;
}

export function PromptCard({ icon, title, onClick, index = 0 }: PromptCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-left group transition-all duration-300 hover:border-primary/30"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <span className="flex-1 font-medium text-foreground">{title}</span>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </motion.button>
  );
}
