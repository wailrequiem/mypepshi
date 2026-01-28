import { supabase } from "./supabase";

export interface CoachMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

/**
 * Send a message to the AI Coach and get a reply
 */
export async function sendCoachMessage(
  messages: CoachMessage[],
  scanId?: string
): Promise<{ ok: boolean; reply?: string; error?: string; debugInfo?: any }> {
  try {
    console.log("🤖 [coach] Sending message to coach...");
    console.log("📝 [coach] Message count:", messages.length);
    console.log("💬 [coach] Last message:", messages[messages.length - 1]);

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("❌ [coach] Session error:", sessionError);
      return { 
        ok: false, 
        error: "Session error: " + sessionError.message,
        reply: "Session error. Please log out and log back in! 🔐",
        debugInfo: { sessionError }
      };
    }

    if (!session || !session.access_token) {
      console.error("❌ [coach] No active session or access token");
      return { 
        ok: false, 
        error: "No active session",
        reply: "Please log in to continue chatting with me! 🔐",
        debugInfo: { hasSession: !!session, hasToken: !!session?.access_token }
      };
    }

    console.log("✅ [coach] Session valid, user ID:", session.user?.id);

    const requestBody = {
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      scanId,
    };

    console.log("📤 [coach] Invoking coach-chat with body:", requestBody);

    // Call coach-chat Edge Function
    const { data, error } = await supabase.functions.invoke("coach-chat", {
      body: requestBody,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    console.log("📥 [coach] Raw response - data:", data, "error:", error);

    if (error) {
      console.error("❌ [coach] Edge function error:", error);
      return { 
        ok: false, 
        error: error.message || "Edge function error",
        reply: "Sorry, I'm having trouble connecting right now. Please try again! 💪",
        debugInfo: { error, data }
      };
    }

    // Parse response - handle multiple formats
    console.log("🔍 [coach] Parsing response...");
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    console.log("✅ [coach] Parsed data:", parsed);

    // Accept both { ok, reply } and { ok, data: { reply } }
    const payload = parsed?.data ?? parsed;
    console.log("📦 [coach] Payload:", payload);

    if (!payload) {
      console.error("❌ [coach] No payload in response");
      return {
        ok: false,
        error: "Empty response",
        reply: "Received empty response from server. Please try again!",
        debugInfo: { parsed, payload }
      };
    }

    if (!payload.ok) {
      console.error("❌ [coach] API returned ok:false -", payload.error || payload.message);
      return { 
        ok: false, 
        error: payload.error || payload.message || "Unknown error",
        reply: payload.reply || "Something went wrong. Please try again!",
        debugInfo: { payload }
      };
    }

    if (!payload.reply) {
      console.error("❌ [coach] No reply in successful response");
      return {
        ok: false,
        error: "No reply field in response",
        reply: "Received response but no message. Please try again!",
        debugInfo: { payload }
      };
    }

    console.log("✅ [coach] Reply received:", payload.reply.substring(0, 50) + "...");
    return { ok: true, reply: payload.reply };

  } catch (error) {
    console.error("❌ [coach] Unexpected error:", error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      reply: "Oops! Something went wrong. Please try again! 🔄",
      debugInfo: { error: error instanceof Error ? error.stack : String(error) }
    };
  }
}

/**
 * Load chat history from localStorage
 */
export function loadChatHistory(userId: string): CoachMessage[] {
  try {
    const key = `coach_chat_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("❌ [coach] Failed to load chat history:", error);
  }
  return [];
}

/**
 * Save chat history to localStorage
 */
export function saveChatHistory(userId: string, messages: CoachMessage[]): void {
  try {
    const key = `coach_chat_${userId}`;
    localStorage.setItem(key, JSON.stringify(messages));
    console.log("💾 [coach] Chat history saved");
  } catch (error) {
    console.error("❌ [coach] Failed to save chat history:", error);
  }
}

/**
 * Clear chat history
 */
export function clearChatHistory(userId: string): void {
  try {
    const key = `coach_chat_${userId}`;
    localStorage.removeItem(key);
    console.log("🗑️ [coach] Chat history cleared");
  } catch (error) {
    console.error("❌ [coach] Failed to clear chat history:", error);
  }
}
