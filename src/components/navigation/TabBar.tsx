import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Scan, MessageCircle, Settings } from "lucide-react";

interface TabBarProps {
  activeTab: "analysis" | "coach" | "settings";
  onTabChange: (tab: "analysis" | "coach") => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const navigate = useNavigate();
  
  const tabs = [
    { id: "analysis" as const, label: "Analysis", icon: Scan },
    { id: "coach" as const, label: "Coach", icon: MessageCircle },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="glass-strong border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          const handleClick = () => {
            if (tab.id === "settings") {
              navigate("/dashboard/settings");
            } else {
              onTabChange(tab.id);
            }
          };

          return (
            <button
              key={tab.id}
              onClick={handleClick}
              className="flex flex-col items-center gap-1 px-6 py-2 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-6 h-6 transition-colors relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs font-medium transition-colors relative z-10 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
