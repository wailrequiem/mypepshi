import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Lock, Check, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { GlowUpDayTasksModal } from "./GlowUpDayTasksModal";

interface TaskExplanation {
  summary: string;
  why: string[];
  how: string[];
  tip?: string;
  caution?: string;
}

interface Task {
  id: string;
  label: string;
  details?: string;
  est_minutes?: number;
  category?: string;
  ai_explain?: TaskExplanation;
}

interface DayData {
  day: number;
  title: string;
  description: string;
  minutes?: number;
  category?: string;
  tasks?: Task[];
}

interface WeekData {
  week: number;
  title: string;
  days: DayData[];
}

interface GlowUpPlan {
  weeks: WeekData[];
}

interface GlowUpProgress {
  completedDays: number[];
  completedTasksByDay: Record<string, string[]>;
  updatedAt: string;
}

interface GlowUpPlanSectionProps {
  scanId?: string;
}

export const GlowUpPlanSection = ({ scanId: propScanId }: GlowUpPlanSectionProps) => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<{ week: number; day: number; dayIndex: number; dayData: DayData } | null>(null);
  const [justUnlockedWeek, setJustUnlockedWeek] = useState<number | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeekData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanId, setScanId] = useState<string | null>(propScanId || null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayIndex, setDayIndex] = useState(0);
  const [progress, setProgress] = useState<GlowUpProgress>({ completedDays: [], completedTasksByDay: {}, updatedAt: "" });
  const [startDate, setStartDate] = useState<string>("");

  useEffect(() => {
    const fetchGlowUpPlan = async () => {
      try {
        console.log("[GLOWUP] Fetching AI-generated plan (no auth required)");

        // Load saved progress from localStorage
        let savedProgress: GlowUpProgress | null = null;
        try {
          const stored = localStorage.getItem('glowup_progress');
          if (stored) {
            savedProgress = JSON.parse(stored);
            console.log("[GLOWUP] Loaded progress from localStorage:", savedProgress);
          }
        } catch (e) {
          console.error("[GLOWUP] Failed to load localStorage:", e);
        }

        // Call generate-glowup-plan WITHOUT auth
        const { data: planData, error: planError } = await supabase.functions.invoke("generate-glowup-plan", {
          body: {}, // No userId, no auth
        });

        if (planError) {
          console.error("[GLOWUP] Function error:", planError);
          throw new Error("Failed to load plan");
        }

        console.log("[GLOWUP] Response:", planData);
        
        if (!planData?.ok) {
          setError(planData?.error || "Failed to load plan");
          setLoading(false);
          return;
        }

        // Extract response
        setScanId(planData.scanId || null);
        setStartDate(planData.startDate || new Date().toISOString());
        setDayIndex(planData.dayIndex || 0);
        setCurrentWeek(planData.currentWeek || 1);
        setCurrentDay(planData.currentDay || 1);
        setWeeklyPlan(planData.plan?.weeks || []);
        
        // Use saved progress if available, otherwise use default
        setProgress(savedProgress || planData.progress || { completedDays: [], completedTasksByDay: {}, updatedAt: "" });
        setError(null);

        console.log("[GLOWUP] ✅ Plan loaded, weeks:", planData.plan?.weeks?.length);

      } catch (err: any) {
        console.error("[GLOWUP] Error:", err);
        setError(err.message || "Failed to load plan");
      } finally {
        setLoading(false);
      }
    };

    fetchGlowUpPlan();
  }, []); // No dependencies - fetch once on mount

  const isDayCompleted = (dayIdx: number) => {
    return progress.completedDays.includes(dayIdx);
  };

  const getDayIndex = (week: number, day: number) => {
    return (week - 1) * 7 + (day - 1);
  };

  const isDayUnlocked = (week: number, day: number) => {
    const dayIdx = getDayIndex(week, day);
    // Current day and past days are unlocked
    return dayIdx <= dayIndex;
  };

  const handleDayClick = (week: number, day: number) => {
    const dayIdx = getDayIndex(week, day);
    if (!isDayUnlocked(week, day)) return;
    
    const weekData = weeklyPlan.find(w => w.week === week);
    if (!weekData) return;
    
    const dayData = weekData.days.find(d => d.day === day);
    if (!dayData) return;
    
    console.log("[GLOWUP] Open day:", week, dayIdx);
    console.log("[GLOWUP] Tasks count:", dayData.tasks?.length || 0);
    
    setSelectedDay({ week, day, dayIndex: dayIdx, dayData });
  };

  const getCompletedTasksForDay = (dayIdx: number): string[] => {
    return progress.completedTasksByDay?.[`${dayIdx}`] || [];
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    const dayIdx = selectedDay?.dayIndex;
    if (dayIdx === undefined) return;

    console.log("[GLOWUP] Toggle task:", taskId, "completed:", completed, "dayIndex:", dayIdx);

    // Update progress locally (no auth/database)
    setProgress(prev => {
      const dayKey = `${dayIdx}`;
      const currentTasks = prev.completedTasksByDay?.[dayKey] || [];
      const newTasks = completed
        ? [...currentTasks, taskId]
        : currentTasks.filter(id => id !== taskId);
      
      const updated = {
        ...prev,
        completedTasksByDay: {
          ...prev.completedTasksByDay,
          [dayKey]: newTasks
        },
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage for persistence
      try {
        localStorage.setItem('glowup_progress', JSON.stringify(updated));
      } catch (e) {
        console.error("[GLOWUP] Failed to save to localStorage:", e);
      }

      return updated;
    });
  };

  const handleMarkComplete = async () => {
    if (!selectedDay) return;
    
    const { dayIndex: dayIdx } = selectedDay;
    const isCurrentlyCompleted = isDayCompleted(dayIdx);
    const newCompletedState = !isCurrentlyCompleted;

    console.log("[GLOWUP] Updating progress, dayIndex:", dayIdx, "completed:", newCompletedState);

    // Update progress locally (no auth/database)
    setProgress(prev => {
      const newCompletedDays = newCompletedState
        ? [...prev.completedDays, dayIdx].sort((a, b) => a - b)
        : prev.completedDays.filter(d => d !== dayIdx);
      
      const updated = { 
        ...prev, 
        completedDays: newCompletedDays,
        updatedAt: new Date().toISOString()
      };

      // Save to localStorage for persistence
      try {
        localStorage.setItem('glowup_progress', JSON.stringify(updated));
      } catch (e) {
        console.error("[GLOWUP] Failed to save to localStorage:", e);
      }

      return updated;
    });

    if (newCompletedState) {
      toast({
        title: "✅ Day Complete!",
        description: `Great job on Day ${selectedDay.day}!`,
      });
    }
    
    setSelectedDay(null);
  };

  const getCompletedCount = (week: number) => {
    const weekData = weeklyPlan.find(w => w.week === week);
    if (!weekData) return 0;
    let count = 0;
    for (let day = 1; day <= weekData.days.length; day++) {
      const dayIdx = getDayIndex(week, day);
      if (isDayCompleted(dayIdx)) count++;
    }
    return count;
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-center">Your Glow-Up Plan</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !weeklyPlan || weeklyPlan.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-center">Your Glow-Up Plan</h2>
        </div>
        <div className="bg-card/50 border border-border/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-muted-foreground">{error || "Unable to load plan"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Your Glow-Up Plan</h2>
        </div>
        <div className="text-xs text-muted-foreground">
          Week {currentWeek} • Day {currentDay}
        </div>
      </div>

      <div className="space-y-4">
        {(weeklyPlan || []).map((weekData, idx) => {
          const weekUnlocked = weekData.week <= currentWeek;
          const completedCount = getCompletedCount(weekData.week);
          const isJustUnlocked = justUnlockedWeek === weekData.week;

          return (
            <motion.div
              key={weekData.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isJustUnlocked ? [1, 1.02, 1] : 1,
              }}
              transition={{ 
                delay: 0.1 * idx,
                scale: { duration: 0.5, repeat: isJustUnlocked ? 2 : 0 }
              }}
              className={`relative rounded-2xl p-4 transition-all duration-300 ${
                weekUnlocked
                  ? "bg-card/80 border border-primary/30 premium-glow"
                  : "bg-card/30 border border-border/20 opacity-50"
              } ${isJustUnlocked ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
            >
              {/* Week Label */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      weekUnlocked
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {!weekUnlocked && <Lock className="w-3 h-3" />}
                    {weekData.title}
                  </div>
                  {weekData.week === currentWeek && (
                    <span className="text-xs text-primary font-medium">Active</span>
                  )}
                </div>
                {weekUnlocked && (
                  <span className="text-xs text-muted-foreground">
                    {completedCount}/{weekData.days.length} days
                  </span>
                )}
              </div>

              {/* Day Cards - Horizontal Scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {(weekData.days || []).map((dayData, dayIdx) => {
                  const dayNumber = dayData.day;
                  const globalDayIdx = getDayIndex(weekData.week, dayNumber);
                  const dayUnlocked = isDayUnlocked(weekData.week, dayNumber);
                  const dayCompleted = isDayCompleted(globalDayIdx);
                  const isCurrentDayActive = globalDayIdx === dayIndex;
                  const isSelected = selectedDay?.week === weekData.week && selectedDay?.day === dayNumber;

                  return (
                    <motion.button
                      key={dayNumber}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                      }}
                      whileTap={dayUnlocked ? { scale: 0.95 } : undefined}
                      transition={{ delay: 0.05 * dayIdx + 0.1 * idx }}
                      onClick={() => handleDayClick(weekData.week, dayNumber)}
                      disabled={!dayUnlocked}
                      className={`flex-shrink-0 w-20 p-3 rounded-xl text-center transition-all duration-200 relative ${
                        dayCompleted
                          ? "bg-primary/20 border border-primary/50"
                          : isCurrentDayActive
                          ? "bg-background/60 border-2 border-primary hover:border-primary hover:bg-background/80"
                          : dayUnlocked
                          ? "bg-background/60 border border-border/50 hover:border-primary/50"
                          : "bg-background/20 border border-border/10 cursor-not-allowed blur-sm opacity-40 grayscale"
                      } ${isSelected ? "ring-2 ring-primary" : ""}`}
                    >
                      {/* Status Icon */}
                      <div className="absolute -top-1 -right-1">
                        {dayCompleted ? (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        ) : !dayUnlocked ? (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          </div>
                        ) : null}
                      </div>

                      <div
                        className={`text-[10px] font-medium uppercase tracking-wide mb-1 ${
                          dayCompleted
                            ? "text-primary"
                            : dayUnlocked
                            ? "text-primary"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        Day {dayNumber}
                      </div>
                      <div
                        className={`text-xs font-medium leading-tight ${
                          dayCompleted
                            ? "text-foreground"
                            : dayUnlocked
                            ? "text-foreground"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {dayData.title}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Day Tasks Modal */}
      <AnimatePresence>
        {selectedDay && (
          <GlowUpDayTasksModal
            isOpen={true}
            onClose={() => setSelectedDay(null)}
            dayData={selectedDay.dayData}
            weekNumber={selectedDay.week}
            dayIndex={selectedDay.dayIndex}
            completedTasks={getCompletedTasksForDay(selectedDay.dayIndex)}
            onTaskToggle={handleTaskToggle}
            onMarkDayComplete={handleMarkComplete}
            scanId={scanId || undefined}
          />
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="text-xs text-muted-foreground text-center">
          Day {dayIndex + 1} of 28 • {progress.completedDays.length} tasks completed
        </div>
      </div>
    </div>
  );
};
