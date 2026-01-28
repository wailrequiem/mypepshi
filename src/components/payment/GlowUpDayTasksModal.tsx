import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, X, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface TaskExplanation {
  summary: string;
  why: string[];
  how: { step: number; text: string }[];
  tip?: string;
  caution?: string;
  mistakes?: string[];
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

interface GlowUpDayTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DayData | null;
  weekNumber: number;
  dayIndex: number;
  completedTasks: string[];
  onTaskToggle: (taskId: string, completed: boolean) => void;
  onMarkDayComplete: () => void;
  scanId?: string;
}

export const GlowUpDayTasksModal = ({
  isOpen,
  onClose,
  dayData,
  weekNumber,
  dayIndex,
  completedTasks,
  onTaskToggle,
  onMarkDayComplete,
  scanId
}: GlowUpDayTasksModalProps) => {
  const [localCompletedTasks, setLocalCompletedTasks] = useState<Set<string>>(new Set(completedTasks));
  const [openExplainTaskId, setOpenExplainTaskId] = useState<string | null>(null);
  const [taskExplanations, setTaskExplanations] = useState<Record<string, {
    explanation: TaskExplanation | null;
    loading: boolean;
  }>>({});
  const { toast } = useToast();

  useEffect(() => {
    setLocalCompletedTasks(new Set(completedTasks));
  }, [completedTasks]);

  if (!isOpen || !dayData) return null;

  const tasks = dayData.tasks || [];
  const hasTasks = tasks.length > 0;
  const totalMinutes = tasks.reduce((sum, task) => sum + (task.est_minutes || 0), 0);
  const allTasksCompleted = hasTasks && tasks.every(task => localCompletedTasks.has(task.id));

  console.log("[GLOWUP] Open day:", weekNumber, dayIndex);
  console.log("[GLOWUP] Tasks count:", tasks.length);

  const handleTaskClick = (taskId: string) => {
    const isCompleted = localCompletedTasks.has(taskId);
    const newCompleted = !isCompleted;
    
    // Optimistic update
    const newSet = new Set(localCompletedTasks);
    if (newCompleted) {
      newSet.add(taskId);
    } else {
      newSet.delete(taskId);
    }
    setLocalCompletedTasks(newSet);
    
    // Call parent handler
    onTaskToggle(taskId, newCompleted);
  };

  const handleMarkComplete = () => {
    if (allTasksCompleted) {
      onMarkDayComplete();
      onClose();
    }
  };

  const handleInfoClick = (task: Task, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("[TASK_EXPLAIN] Toggle task:", task.id, "current open:", openExplainTaskId);

    // Toggle - if already open, close it
    if (openExplainTaskId === task.id) {
      setOpenExplainTaskId(null);
      return;
    }

    // Open this task's popover
    setOpenExplainTaskId(task.id);

    // If already has data, we're done
    if (taskExplanations[task.id]) {
      console.log("[TASK_EXPLAIN] Using existing data");
      return;
    }

    // If task has cached explanation, use it
    if (task.ai_explain) {
      console.log("[TASK_EXPLAIN] Using cached explanation from task");
      setTaskExplanations(prev => ({
        ...prev,
        [task.id]: {
          explanation: task.ai_explain!,
          loading: false,
        }
      }));
      return;
    }

    // Need to load - show loading state immediately
    console.log("[TASK_EXPLAIN] Starting load");
    setTaskExplanations(prev => ({
      ...prev,
      [task.id]: {
        explanation: null,
        loading: true,
      }
    }));

    // Load explanation immediately (don't wait)
    setTimeout(() => loadExplanation(task), 0);
  };

  const loadExplanation = async (task: Task) => {
    console.log("[EXPLAIN] calling edge function for task:", task.label);

    // Build request body for the public API
    const requestBody = {
      taskTitle: task.label,
      taskCategory: task.category || "lifestyle",
      dayTitle: dayData?.title,
      week: weekNumber,
      day: dayData?.day,
      // Optional user context (if scanId exists, could fetch scores, but keeping it simple for now)
      userContext: null,
    };

    console.log("[EXPLAIN] Request body:", requestBody);

    try {
      // Call the PUBLIC edge function (no auth required)
      const { data, error } = await supabase.functions.invoke("explain-glowup-task", {
        body: requestBody,
      });

      console.log("[EXPLAIN] Response:", { data, error });

      if (error) {
        console.error("[EXPLAIN] Supabase error:", error);
        setTaskExplanations(prev => ({
          ...prev,
          [task.id]: {
                            explanation: {
                              summary: "Unable to load explanation",
                              why: ["Connection error"],
                              how: [{ step: 1, text: "Please try again later" }],
                            },
            loading: false,
          }
        }));
        return;
      }

      if (!data?.ok) {
        console.error("[EXPLAIN] API returned not ok:", data);
        setTaskExplanations(prev => ({
          ...prev,
          [task.id]: {
            explanation: {
              summary: "Unable to generate explanation",
              why: ["The AI service encountered an error"],
              how: [{ step: 1, text: "Please try again in a moment" }],
            },
            loading: false,
          }
        }));
        return;
      }

      // Convert new API format to UI format
      const explanation: TaskExplanation = {
        summary: data.summary || "Task explanation",
        why: data.why_this_matters || ["Helps improve your appearance"],
        how: data.how_to_do_it || [{ step: 1, text: "Follow the task instructions" }],
        tip: data.personalized_tip,
        mistakes: data.common_mistakes,
      };

      console.log("[EXPLAIN] success - converted explanation:", explanation);

      // Cache it on the task object
      task.ai_explain = explanation;

      setTaskExplanations(prev => ({
        ...prev,
        [task.id]: {
          explanation,
          loading: false,
        }
      }));
    } catch (err) {
      console.error("[EXPLAIN] Exception:", err);
      setTaskExplanations(prev => ({
        ...prev,
        [task.id]: {
          explanation: {
            summary: "Network error",
            why: ["Unable to connect to the server"],
            how: [{ step: 1, text: "Check your internet connection and try again" }],
          },
          loading: false,
        }
      }));
    }
  };

  const handleInfoMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-primary font-medium uppercase tracking-wide">
                Week {weekNumber} • Day {dayData.day}
              </div>
              <h3 className="text-xl font-bold mt-1">{dayData.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">{dayData.description}</p>
          
          {hasTasks && totalMinutes > 0 && (
            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Estimated time: {totalMinutes} minutes</span>
            </div>
          )}
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {!hasTasks ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No tasks available for this day yet.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isCompleted = localCompletedTasks.has(task.id);
              const isExplainOpen = openExplainTaskId === task.id;
              const explanationState = taskExplanations[task.id];
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: tasks.indexOf(task) * 0.05 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleTaskClick(task.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isCompleted
                        ? "bg-primary/10 border-primary/30"
                        : "bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-primary border-primary"
                            : "border-border/50"
                        }`}
                      >
                        {isCompleted && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-8">
                        <p className={`text-sm font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                          {task.label}
                        </p>
                        {task.details && (
                          <p className="text-xs text-muted-foreground mt-1">{task.details}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {task.est_minutes && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.est_minutes}m
                            </span>
                          )}
                          {task.category && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Info Button with Popover */}
                  <Popover 
                    open={isExplainOpen} 
                    onOpenChange={(open) => {
                      console.log("[TASK_EXPLAIN] Popover onOpenChange:", open, "for task:", task.id);
                      if (!open) {
                        setOpenExplainTaskId(null);
                      } else {
                        setOpenExplainTaskId(task.id);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        onMouseDown={handleInfoMouseDown}
                        onClick={(e) => handleInfoClick(task, e)}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted/80 hover:bg-primary/20 hover:text-primary flex items-center justify-center transition-all duration-200 group z-10"
                        aria-label="Learn more about this task"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 max-h-[70vh] overflow-y-auto"
                      side="left"
                      align="start"
                      sideOffset={8}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                      onCloseAutoFocus={(e) => e.preventDefault()}
                    >
                      {explanationState?.loading ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <p className="text-xs text-muted-foreground">Generating explanation...</p>
                        </div>
                      ) : explanationState?.explanation ? (
                        <div className="space-y-4">
                          {/* Task Title */}
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{task.label}</h4>
                            {task.category && (
                              <span className="inline-flex text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {task.category}
                              </span>
                            )}
                          </div>

                          {/* Summary */}
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs font-medium text-foreground">
                              {explanationState.explanation.summary}
                            </p>
                          </div>

                          {/* Why Section */}
                          <div>
                            <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                ?
                              </span>
                              Why This Matters
                            </h5>
                            <ul className="space-y-1.5">
                              {explanationState.explanation.why.map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                  <span className="flex-shrink-0 w-1 h-1 rounded-full bg-primary mt-1.5" />
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* How Section */}
                          <div>
                            <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                ✓
                              </span>
                              How To Do It
                            </h5>
                            <ol className="space-y-2">
                              {explanationState.explanation.how.map((item, idx) => {
                                // Handle both old string format and new object format
                                const stepNumber = typeof item === 'object' ? item.step : idx + 1;
                                const stepText = typeof item === 'object' ? item.text : item;
                                
                                return (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                                      {stepNumber}
                                    </span>
                                    <span className="text-xs text-muted-foreground pt-0.5">{stepText}</span>
                                  </li>
                                );
                              })}
                            </ol>
                          </div>

                          {/* Common Mistakes Section */}
                          {explanationState.explanation.mistakes && explanationState.explanation.mistakes.length > 0 && (
                            <div>
                              <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-xs font-bold">
                                  !
                                </span>
                                Common Mistakes
                              </h5>
                              <ul className="space-y-1.5">
                                {explanationState.explanation.mistakes.map((mistake, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <span className="flex-shrink-0 w-1 h-1 rounded-full bg-orange-500 mt-1.5" />
                                    <span>{mistake}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Personalized Tip Section */}
                          {explanationState.explanation.tip && (
                            <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                              <div className="flex items-start gap-1.5">
                                <span className="text-blue-500 text-xs font-bold">💡 TIP:</span>
                                <p className="text-xs text-foreground flex-1">
                                  {explanationState.explanation.tip}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Caution Section */}
                          {explanationState.explanation.caution && (
                            <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/20">
                              <div className="flex items-start gap-1.5">
                                <span className="text-orange-500 text-xs font-bold">⚠️</span>
                                <p className="text-xs text-foreground flex-1">
                                  {explanationState.explanation.caution}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <p className="text-xs text-muted-foreground">Loading explanation...</p>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {hasTasks && (
          <div className="p-6 border-t border-border/50">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {localCompletedTasks.size} / {tasks.length} completed
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: allTasksCompleted ? 1.02 : 1 }}
              whileTap={{ scale: allTasksCompleted ? 0.98 : 1 }}
              onClick={handleMarkComplete}
              disabled={!allTasksCompleted}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                allTasksCompleted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {allTasksCompleted ? (
                <>
                  <Check className="w-4 h-4" />
                  Mark Day as Complete
                </>
              ) : (
                <>Complete all tasks to finish this day</>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
