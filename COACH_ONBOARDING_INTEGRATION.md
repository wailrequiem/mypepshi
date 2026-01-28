# ✅ AI Coach - Onboarding Data Integration Complete

## 🎯 **What Was Implemented**

The AI Coach now has **full access to user onboarding answers** and provides **highly personalized advice** based on:
- User goals and struggles
- Age and sex
- Peptides openness/preferences
- Lifestyle factors
- Confidence level
- Facial analysis scores (when available)

---

## 📊 **Data Source**

### **Location:** Supabase `profiles` table
**Column:** `onboarding_json`

**Data Structure:**
```typescript
{
  gender: "male" | "female" | null,
  age: number | null,
  struggles: string[],              // e.g., ["confidence", "jawline", "skin"]
  compliments: string,              // frequency of compliments
  confidence: string,               // confidence level
  lifestyle: string[],              // lifestyle factors
  mirror_thoughts: string,          // how they feel looking in mirror
  peptides_openness: string,        // "yes" | "no" | "not sure" | "maybe"
  peptides_knowledge: string,       // knowledge level
  peptides_goals: string[],         // goals with peptides
  peptides_risk_tolerance: string,  // risk tolerance
  peptides_past_experience: string, // past experience
  peptides_timing: string,          // timing interest
  created_at: string,
  last_scan_id: string | null
}
```

---

## 🔧 **Files Modified**

### **1. Backend: `supabase/functions/coach-chat/index.ts`**

**Changes:**
- ✅ Added step 3: Fetch onboarding data from `profiles.onboarding_json`
- ✅ Built comprehensive onboarding context string
- ✅ Updated system prompt to include onboarding context
- ✅ Added personalization guidelines based on user preferences
- ✅ Implemented peptides policy based on `peptides_openness`
- ✅ Added tone adaptation rules
- ✅ Added detailed logging for context

**Key Additions:**
```typescript
// Fetch onboarding data
const { data: profile } = await supabase
  .from("profiles")
  .select("onboarding_json")
  .eq("id", user.id)
  .single();

// Build onboarding context
onboardingContext = `
USER PROFILE & GOALS:
- Age: ${onboarding.age}
- Sex: ${onboarding.gender}
- Main struggles: ${goals.join(", ")}
- Confidence level: ${onboarding.confidence}
...

PEPTIDES PREFERENCES:
- Interest level: ${onboarding.peptides_openness}
- Knowledge level: ${onboarding.peptides_knowledge}
...
`;

// Include in system prompt with adaptation rules
```

**Logs Added:**
```typescript
console.log("✅ [coach-chat] Onboarding data loaded");
console.log("📊 [coach-chat] Onboarding context length:", onboardingContext.length);
console.log("🎯 [coach-chat] Context included:", {
  hasOnboarding: !!onboardingContext,
  hasScan: !!scanContext,
  promptLength: systemPrompt.length
});
```

---

### **2. Frontend: `src/components/payment/PeptideCoachSection.tsx`**

**Changes:**
- ✅ Replaced mock responses with real API calls
- ✅ Now uses `sendCoachMessage()` from `src/lib/coach.ts`
- ✅ Separate chat history for peptides coach (`${userId}_peptides`)
- ✅ Persists conversations in localStorage
- ✅ Same API endpoint, same personalization

**Key Changes:**
```typescript
// Import real API
import { sendCoachMessage, loadChatHistory, saveChatHistory } from "@/lib/coach";

// Call real API instead of mock
const result = await sendCoachMessage(updatedMessages);

// Persist with separate key
saveChatHistory(`${user.id}_peptides`, messages);
```

---

## 🤖 **Personalization Rules**

### **System Prompt Adaptations:**

**1. Tone Based on Struggles:**
```
If struggles include confidence/attractiveness:
→ Extra supportive, motivating tone

If struggles include jawline/face:
→ Prioritize facial exercises, mewing, posture advice

If confidence is low:
→ Focus on quick wins and progressive improvement
```

**2. Peptides Policy (CRITICAL):**
```
If peptides_openness = "no" or negative:
→ NEVER recommend peptides, focus on natural methods only

If peptides_openness = "not sure" or "maybe":
→ Provide educational info only, no recommendations

If peptides_openness = "yes" or positive:
→ Educational recommendations OK, but still emphasize safety
```

**3. Content Prioritization:**
```
If lifestyle includes fitness:
→ Assume some training knowledge

If mirror thoughts are negative:
→ Extra encouragement about potential

If age is young (<25):
→ Emphasize natural methods first
```

---

## 📝 **Example Personalization**

### **User A:**
```
Onboarding:
- Age: 22
- Sex: male
- Struggles: ["confidence", "skin quality"]
- Peptides openness: "no"
- Confidence: "low"
```

**Coach Response Style:**
- Very supportive and encouraging tone
- Focuses on skincare routines and natural methods
- **NEVER mentions peptides** (respects "no" preference)
- Emphasizes quick wins to build confidence
- References "based on your focus on skin quality..."

---

### **User B:**
```
Onboarding:
- Age: 28
- Sex: male
- Struggles: ["jawline", "muscle gain"]
- Peptides openness: "yes, interested"
- Confidence: "moderate"
- Lifestyle: ["gym 5x/week", "meal prep"]
```

**Coach Response Style:**
- Direct, practical advice
- Prioritizes jawline exercises (mewing, chewing)
- **Can mention peptides** (user is open)
- Assumes training knowledge (lifestyle = gym)
- References "given your training background..."

---

## 🧪 **Testing**

### **Test 1: Peptides Policy**
```
User says: "Should I try peptides?"

If peptides_openness = "no":
→ "Let's focus on natural methods that work great! For your goals..."

If peptides_openness = "yes":
→ "Based on your interest, here's what you should know about peptides..."
```

### **Test 2: Personalized Goals**
```
User asks: "How can I improve?"

Coach checks:
- Struggles: ["jawline", "confidence"]
- Scan scores: jawline = 65/100

Reply references BOTH:
→ "Given your focus on jawline definition, and looking at your analysis scores (65/100), here's what I recommend..."
```

### **Test 3: Tone Adaptation**
```
If confidence = "low" + struggles include "attractiveness":
→ Extra supportive, emphasizes potential and progress

If confidence = "high" + lifestyle includes fitness:
→ Direct, assumes knowledge, focuses on optimization
```

---

## 🔍 **Verification Logs**

### **Backend Logs (Supabase):**
```
✅ [coach-chat] User authenticated: user-id
✅ [coach-chat] Onboarding data loaded
📊 [coach-chat] Onboarding context length: 543
🎯 [coach-chat] Context included: {
  hasOnboarding: true,
  hasScan: true,
  promptLength: 2847
}
🤖 [coach-chat] Calling OpenAI...
📏 [coach-chat] System prompt length: 2847
✅ [coach-chat] Reply generated, length: 234
```

### **Frontend Logs (Console):**
```
🚀 [CoachTab] sendMessage fired with text: "..."
📤 [CoachTab] Sending message to coach API...
✅ [coach] Session valid, user ID: xxx
📤 [coach] Invoking coach-chat with body: {...}
✅ [coach] Reply received: "..."
```

---

## 📦 **Where Coach is Used**

### **1. Bottom Tab: "Coach"**
- **Location:** Dashboard → Coach tab
- **File:** `src/components/tabs/CoachTab.tsx`
- **Uses:** Real API with onboarding context
- **Chat history key:** `coach_chat_${userId}`

### **2. Embedded: "Peptide AI Coach"**
- **Location:** Dashboard → Analysis tab → Peptides section
- **File:** `src/components/payment/PeptideCoachSection.tsx`
- **Uses:** Real API with onboarding context (same backend)
- **Chat history key:** `coach_chat_${userId}_peptides`

**Both use the SAME backend** (`coach-chat` Edge Function) with full onboarding context!

---

## ✅ **Expected Results**

### **Before Integration:**
- ❌ Generic advice for all users
- ❌ Ignores user preferences
- ❌ May recommend peptides to users who said "no"
- ❌ Same response for different users

### **After Integration:**
- ✅ Highly personalized advice
- ✅ Respects user preferences (peptides, goals, etc.)
- ✅ Never contradicts onboarding answers
- ✅ Different responses for different users
- ✅ References goals naturally ("given your focus on...")
- ✅ Adapts tone based on confidence level
- ✅ Prioritizes areas user wants to improve

---

## 🎯 **Key Features**

1. ✅ **Data Source:** Supabase `profiles.onboarding_json`
2. ✅ **Backend:** Fetches onboarding data per user
3. ✅ **System Prompt:** Includes full onboarding context
4. ✅ **Personalization:** Adapts tone, advice, and content
5. ✅ **Peptides Policy:** Respects user preferences strictly
6. ✅ **Natural References:** Never says "you said in onboarding..."
7. ✅ **Combined Context:** Onboarding + scan scores = highly targeted
8. ✅ **Both Coaches:** Bottom tab AND embedded both use same logic
9. ✅ **Logging:** Full visibility into context used
10. ✅ **Deployed:** Edge Function updated and live

---

## 🚀 **Test Now**

```bash
# Run the app
npm run dev

# Test in browser:
1. Go to Dashboard
2. Click "Coach" tab (or scroll to Peptides Coach section)
3. Send a message
4. Open DevTools → Console
5. Look for logs showing onboarding context loaded

Expected:
✅ [coach-chat] Onboarding data loaded
📊 [coach-chat] Onboarding context length: XXX
✅ Reply should reference your specific goals/struggles
```

---

## 📊 **Summary**

| Aspect | Status |
|--------|--------|
| Data source | ✅ `profiles.onboarding_json` |
| Backend integration | ✅ Fetches per user |
| System prompt | ✅ Includes full context |
| Personalization | ✅ Tone, advice, content adapted |
| Peptides policy | ✅ Strict preference enforcement |
| Bottom Coach tab | ✅ Uses onboarding data |
| Embedded Peptide Coach | ✅ Uses onboarding data |
| Natural references | ✅ No "you said..." |
| Logging | ✅ Full visibility |
| Deployed | ✅ Live on Supabase |

---

**The AI Coach is now fully personalized! 🎉**

Users with different onboarding answers will receive noticeably different advice tailored to their specific goals, struggles, and preferences.
