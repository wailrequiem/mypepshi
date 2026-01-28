# 🐛 AI Coach Debug Guide

## ✅ **What Was Fixed**

### **Frontend Improvements:**
1. ✅ **Detailed Logging** - Every step logged to console
2. ✅ **Visual Debug Box** - On-screen error display with debug info
3. ✅ **Better Error Handling** - All errors caught and displayed
4. ✅ **Disabled States** - Input/button disabled while loading
5. ✅ **Response Parsing** - Handles multiple response formats
6. ✅ **Session Validation** - Explicit token check before API call

### **Backend Improvements:**
1. ✅ **Detailed Logging** - Every step logged
2. ✅ **Request Logging** - Full body logged
3. ✅ **Auth Logging** - Clear auth validation logs
4. ✅ **Response Logging** - Full response logged before sending

---

## 🔍 **How to Debug**

### **Step 1: Open DevTools**
1. Press `F12` in browser
2. Go to **Console** tab
3. Clear console (trash icon)
4. Send a message in Coach

### **Step 2: Look for Frontend Logs**

You should see in order:
```
🚀 [CoachTab] sendMessage fired with text: "your message"
👤 [CoachTab] Current user: user-id-here
📤 [CoachTab] Sending message to coach API...
📝 [CoachTab] Total messages in conversation: 1
🤖 [coach] Sending message to coach...
📝 [coach] Message count: 1
💬 [coach] Last message: {role: "user", content: "..."}
✅ [coach] Session valid, user ID: user-id-here
📤 [coach] Invoking coach-chat with body: {messages: [...]}
📥 [coach] Raw response - data: {...}, error: null
🔍 [coach] Parsing response...
✅ [coach] Parsed data: {ok: true, reply: "..."}
📦 [coach] Payload: {ok: true, reply: "..."}
✅ [coach] Reply received: "First 50 chars..."
📥 [CoachTab] API result: {ok: true, reply: "..."}
✅ [CoachTab] Success! Reply length: 123
✅ [CoachTab] Assistant message added to state
✅ [CoachTab] sendMessage completed
```

### **Step 3: Look for Backend Logs**

Go to **Network** tab:
1. Filter by "coach-chat"
2. Click the request
3. Check **Response** tab - should see `{ ok: true, reply: "..." }`
4. Check **Status** - should be `200`

### **Step 4: Check Supabase Logs (if needed)**

```bash
# View Edge Function logs
supabase functions logs coach-chat --follow

# You should see:
🔔 [coach-chat] Function invoked
📍 [coach-chat] Method: POST
🔑 [coach-chat] Auth header present: true
✅ [coach-chat] User authenticated: user-id
📦 [coach-chat] Request body: {"messages":[...]}
📝 [coach-chat] Messages: 1
🤖 [coach-chat] Calling OpenAI...
✅ [coach-chat] Reply generated, length: 123
📤 [coach-chat] Returning response...
```

---

## 🚨 **Common Issues & Fixes**

### **Issue 1: "Please log in to continue chatting"**

**Symptoms:**
- Debug box shows: `Session error` or `No active session`
- Console: `❌ [coach] No active session`

**Fix:**
```bash
1. Log out
2. Log back in
3. Try again
```

---

### **Issue 2: "Edge function error"**

**Symptoms:**
- Debug box shows network/connection error
- Console: `❌ [coach] Edge function error`

**Possible Causes:**
- Edge Function not deployed
- Wrong function name
- CORS issue

**Fix:**
```bash
# 1. Check if function exists
supabase functions list

# 2. Redeploy
supabase functions deploy coach-chat --no-verify-jwt

# 3. Check logs
supabase functions logs coach-chat
```

---

### **Issue 3: "OPENAI_API_KEY not configured"**

**Symptoms:**
- Backend logs: `❌ [coach-chat] Error: OPENAI_API_KEY not configured`
- Frontend: "Sorry, I'm having trouble connecting"

**Fix:**
```bash
# Set the API key
supabase secrets set OPENAI_API_KEY=sk-your-key-here

# Verify
supabase secrets list
```

---

### **Issue 4: "Invalid JSON body"**

**Symptoms:**
- Backend logs: `❌ [coach-chat] Failed to parse request body`
- Debug box shows parse error

**Fix:**
- Check frontend is sending correct format
- Look at console log: `📤 [coach] Invoking coach-chat with body:`
- Should be: `{ messages: [{role: "user", content: "..."}] }`

---

### **Issue 5: "No reply from OpenAI"**

**Symptoms:**
- Backend logs: `❌ [coach-chat] Error: No reply from OpenAI`
- OpenAI returned empty response

**Possible Causes:**
- OpenAI API issue
- Invalid OpenAI API key
- No credits in OpenAI account

**Fix:**
```bash
# 1. Check OpenAI account credits
# Go to: https://platform.openai.com/usage

# 2. Verify API key is valid
# Go to: https://platform.openai.com/api-keys

# 3. Check OpenAI status
# Go to: https://status.openai.com
```

---

### **Issue 6: Reply appears in console but not in UI**

**Symptoms:**
- Console: `✅ [CoachTab] Success! Reply length: 123`
- But no message appears in chat

**Fix:**
- Check React DevTools
- Look for state update issues
- Check browser console for React errors
- Try refreshing page

---

## 📊 **Expected Network Request**

### **Request:**
```
POST https://your-project.supabase.co/functions/v1/coach-chat

Headers:
  Authorization: Bearer eyJ...
  Content-Type: application/json

Body:
{
  "messages": [
    { "role": "user", "content": "How can I improve my jawline?" }
  ]
}
```

### **Response:**
```
Status: 200 OK

Headers:
  Content-Type: application/json
  Access-Control-Allow-Origin: *

Body:
{
  "ok": true,
  "reply": "Great question! To improve your jawline definition..."
}
```

---

## 🧪 **Manual Test Script**

If UI doesn't work, test Edge Function directly:

```bash
# Replace with your values
PROJECT_URL="https://your-project.supabase.co"
ANON_KEY="your-anon-key"
ACCESS_TOKEN="your-access-token"

curl -X POST "$PROJECT_URL/functions/v1/coach-chat" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Test message"}
    ]
  }'
```

**Expected:**
```json
{"ok":true,"reply":"..."}
```

---

## ✅ **Checklist**

Before asking for help, verify:

- [ ] ✅ User is logged in (check console for user ID)
- [ ] ✅ Edge Function deployed (`supabase functions list`)
- [ ] ✅ OPENAI_API_KEY set (`supabase secrets list`)
- [ ] ✅ Network request shows 200 status (DevTools Network tab)
- [ ] ✅ Response has `ok: true` and `reply` field
- [ ] ✅ Console shows all frontend logs
- [ ] ✅ No React errors in console
- [ ] ✅ OpenAI account has credits

---

## 📝 **Debug Box**

If you see errors, a red debug box will appear at the bottom of the chat with:

```
Debug Info:
Error: [error message here]
{
  "debugInfo": {
    // Detailed error context
  }
}
```

This helps identify exactly where the issue is!

---

## 🎯 **Success Criteria**

When everything works:
1. ✅ Message sent
2. ✅ Loading indicator shows (typing animation)
3. ✅ Network request returns 200
4. ✅ Reply appears in chat within 2-5 seconds
5. ✅ No errors in console
6. ✅ No debug box shown

---

**Need more help? Check the full logs in:**
- Browser Console (F12)
- Supabase Dashboard → Edge Functions → Logs
- Network tab → coach-chat request/response
