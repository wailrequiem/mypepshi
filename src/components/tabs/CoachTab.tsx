import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PromptCard } from "@/components/coach/PromptCard";
import { useAuth } from "@/contexts/AuthContext";
import { 
  sendCoachMessage, 
  loadChatHistory, 
  saveChatHistory,
  CoachMessage
} from "@/lib/coach";
import { 
  Dumbbell, 
  Droplets, 
  FlaskConical, 
  Target, 
  Zap,
  Send,
  ArrowLeft,
  Clock
} from "lucide-react";

const prompts = [
  { icon: <Target className="w-6 h-6 text-primary" />, title: "Improve your jawline" },
  { icon: <Dumbbell className="w-6 h-6 text-primary" />, title: "Gain more muscle" },
  { icon: <Droplets className="w-6 h-6 text-primary" />, title: "Improve skin quality" },
  { icon: <FlaskConical className="w-6 h-6 text-primary" />, title: "Learn about peptides" },
  { icon: <Target className="w-6 h-6 text-primary" />, title: "Best peptides for my goals" },
  { icon: <Zap className="w-6 h-6 text-primary" />, title: "Optimize recovery & performance" },
];

export function CoachTab() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    if (user?.id) {
      const history = loadChatHistory(user.id);
      if (history.length > 0) {
        console.log("📚 [CoachTab] Loaded chat history:", history.length, "messages");
        setMessages(history);
      }
    }
  }, [user?.id]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      saveChatHistory(user.id, messages);
    }
  }, [messages, user?.id]);

  const handlePromptClick = (title: string) => {
    sendMessage(title);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) {
      console.log("⚠️ [CoachTab] Empty message, ignoring");
      return;
    }

    console.log("🚀 [CoachTab] sendMessage fired with text:", text);
    console.log("👤 [CoachTab] Current user:", user?.id);

    const userMessage: CoachMessage = { 
      role: "user", 
      content: text,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setLastError(null);
    setDebugInfo(null);

    try {
      console.log("📤 [CoachTab] Sending message to coach API...");
      console.log("📝 [CoachTab] Total messages in conversation:", updatedMessages.length);
      
      // Call real API
      const result = await sendCoachMessage(updatedMessages);
      
      console.log("📥 [CoachTab] API result:", result);

      // Store debug info
      if (result.debugInfo) {
        console.log("🐛 [CoachTab] Debug info:", result.debugInfo);
        setDebugInfo(result.debugInfo);
      }

      if (result.ok && result.reply) {
        console.log("✅ [CoachTab] Success! Reply length:", result.reply.length);
        const assistantMessage: CoachMessage = {
          role: "assistant",
          content: result.reply,
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, assistantMessage]);
        console.log("✅ [CoachTab] Assistant message added to state");
      } else {
        // Show error as assistant message
        console.error("❌ [CoachTab] API returned error:", result.error);
        setLastError(result.error || "Unknown error");
        
        const errorMessage: CoachMessage = {
          role: "assistant",
          content: result.reply || result.error || "Sorry, something went wrong. Please try again! 💪",
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error("❌ [CoachTab] Error message added to chat");
      }
    } catch (error) {
      console.error("❌ [CoachTab] Unexpected error caught:", error);
      const errorString = error instanceof Error ? error.message : String(error);
      setLastError(errorString);
      
      const errorMessage: CoachMessage = {
        role: "assistant",
        content: "Oops! I'm having trouble connecting. Please try again in a moment! 🔄",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      console.log("✅ [CoachTab] sendMessage completed");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input.trim());
    }
  };

  const handleBack = () => {
    setMessages([]);
  };

  if (messages.length > 0) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-4">
          <button onClick={handleBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">Your Coach</h2>
              <span className="text-xs text-green-500 font-mono">✅</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Available 24/7</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="glass rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-6 pb-4">
          <div className="glass rounded-2xl flex items-center p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your coach..."
              disabled={isTyping}
              className="flex-1 bg-transparent px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 transition-opacity"
            >
              <Send className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
          
          {/* Debug Info (Dev Only) */}
          {(lastError || debugInfo) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <p className="text-xs font-semibold text-red-400 mb-1">Debug Info:</p>
              {lastError && (
                <p className="text-xs text-red-300 mb-1">Error: {lastError}</p>
              )}
              {debugInfo && (
                <pre className="text-xs text-muted-foreground overflow-x-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              )}
            </motion.div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-6 pt-6">
      {/* Dev Marker */}
      <div className="mb-2 text-xs text-green-500 font-mono">
        ✅ Coach chat mounted
      </div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground">Coach</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-muted-foreground text-sm">
            Learn how to...
          </p>
          <div className="flex items-center gap-1 text-xs text-primary">
            <Clock className="w-3 h-3" />
            <span>24/7</span>
          </div>
        </div>
      </motion.div>

      {/* Prompt Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {prompts.map((prompt, index) => (
          <PromptCard
            key={prompt.title}
            icon={prompt.icon}
            title={prompt.title}
            onClick={() => handlePromptClick(prompt.title)}
            index={index}
          />
        ))}
      </div>

      {/* Input Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pb-4"
      >
        <div className="glass rounded-2xl flex items-center p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Or ask anything..."
            disabled={isTyping}
            className="flex-1 bg-transparent px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && input.trim() && !isTyping) {
                e.preventDefault();
                sendMessage(input.trim());
              }
            }}
          />
          <button
            onClick={() => input.trim() && !isTyping && sendMessage(input.trim())}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            <Send className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
        
        {/* Debug Info (Dev Only) */}
        {(lastError || debugInfo) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <p className="text-xs font-semibold text-red-400 mb-1">Debug Info:</p>
            {lastError && (
              <p className="text-xs text-red-300 mb-1">Error: {lastError}</p>
            )}
            {debugInfo && (
              <pre className="text-xs text-muted-foreground overflow-x-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
