import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Send, Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  sendCoachMessage, 
  loadChatHistory, 
  saveChatHistory,
  CoachMessage
} from "@/lib/coach";

const suggestedQuestions = [
  "What are peptides, in simple terms?",
  "Why were these peptides recommended to me?",
  "Are peptides risky?",
  "Peptides vs supplements: what's the difference?",
  "How can peptides support my goals?",
];

export const PeptideCoachSection = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load chat history on mount
  useEffect(() => {
    if (user?.id) {
      const history = loadChatHistory(`${user.id}_peptides`);
      if (history.length > 0) {
        console.log("📚 [PeptideCoach] Loaded chat history:", history.length, "messages");
        setMessages(history);
        setIsExpanded(true);
      }
    }
  }, [user?.id]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (user?.id && messages.length > 0) {
      saveChatHistory(`${user.id}_peptides`, messages);
    }
  }, [messages, user?.id]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    console.log("🚀 [PeptideCoach] sendMessage fired with text:", text);

    const userMessage: CoachMessage = { 
      role: "user", 
      content: text,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      console.log("📤 [PeptideCoach] Sending to coach API (peptides mode)...");
      
      // Call real API
      const result = await sendCoachMessage(updatedMessages);

      if (result.ok && result.reply) {
        console.log("✅ [PeptideCoach] Reply received");
        const assistantMessage: CoachMessage = {
          role: "assistant",
          content: result.reply,
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Show error as assistant message
        console.error("❌ [PeptideCoach] Error:", result.error);
        const errorMessage: CoachMessage = {
          role: "assistant",
          content: result.reply || result.error || "Sorry, something went wrong. Please try again! 💪",
          timestamp: Date.now()
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("❌ [PeptideCoach] Unexpected error:", error);
      const errorMessage: CoachMessage = {
        role: "assistant",
        content: "Oops! I'm having trouble connecting. Please try again in a moment! 🔄",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await sendMessage(input.trim());
    }
  };

  const handleSuggestedClick = async (question: string) => {
    setIsExpanded(true);
    await sendMessage(question);
  };

  const handleBack = () => {
    setMessages([]);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Peptide AI Coach</h2>
        <p className="text-sm text-muted-foreground">
          Ask questions about peptides, optimization, and recovery — anytime.
        </p>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium"
        >
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Available 24/7
        </motion.span>
      </div>

      {/* Chat Container */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
          {isExpanded && messages.length > 0 && (
            <button 
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Peptide Coach</p>
            <p className="text-xs text-emerald-400">Online 24/7</p>
          </div>
        </div>

        {/* Messages Area */}
        {isExpanded && messages.length > 0 ? (
          <div className="max-h-80 overflow-y-auto p-4 space-y-4">
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
                      : "bg-muted/50 border border-border/50"
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
                <div className="bg-muted/50 border border-border/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          /* Suggested Questions */
          <div className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <motion.button
                  key={question}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSuggestedClick(question)}
                  className="text-left text-xs bg-muted/30 hover:bg-muted/50 border border-border/50 rounded-xl px-3 py-2 transition-colors"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border/50">
          <div className="flex items-center gap-2 bg-muted/30 rounded-xl p-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about peptides…"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim()}
              className="rounded-lg px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
