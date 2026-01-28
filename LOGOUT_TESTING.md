# Quick Logout Testing Guide

## 🧪 5-Minute Test

### Step 1: Login
1. Open app: http://localhost:8080/
2. Log in with your account
3. You should see the Dashboard

### Step 2: Verify Logout Button
1. **On Dashboard:**
   - Look at top-right corner
   - Should see "Log out" button with logout icon

2. **On New Scan:**
   - Click "New scan" button
   - Look at top-right corner
   - Should see floating "Log out" button

3. **On Scan Results:**
   - View any scan from history
   - Look at top navigation bar
   - Should see "Log out" button next to back button

### Step 3: Test Logout
1. Click "Log out" button (from any page)
2. **Expected behavior:**
   - Button changes to "Logging out..."
   - Page redirects to home page (`/`)
   - No longer logged in

### Step 4: Verify Session is Cleared
1. **Refresh the page** (F5 or Ctrl+R)
2. **Expected:** Should stay on home page, NOT auto-login

3. **Try to access Dashboard directly:**
   - Type in URL: `http://localhost:8080/dashboard`
   - Press Enter
   - **Expected:** Redirects back to home page (not accessible)

4. **Check localStorage:**
   - F12 → Application → Local Storage
   - **Expected:** No Supabase auth tokens

### Step 5: Verify Re-login Works
1. Click "Log in" or "Sign up"
2. Enter your credentials
3. Should successfully log back in
4. Should access Dashboard again

---

## ✅ Success Indicators

### Console Logs (F12 → Console)
```
🔓 [Dashboard] Logging out user...
🔓 [AuthContext] Signing out user...
✅ [AuthContext] User signed out successfully
✅ [Dashboard] User logged out successfully
```

### When accessing protected page without auth:
```
🔒 [ProtectedRoute] No authenticated user, redirecting to home
```

---

## ❌ Failure Indicators

If you see any of these, something is wrong:

1. **Auto-login after refresh**
   - ❌ Logout didn't clear session properly

2. **Can access `/dashboard` when logged out**
   - ❌ ProtectedRoute not working

3. **Button doesn't respond to clicks**
   - ❌ Check console for errors

4. **Error messages in console**
   - ❌ Check error details

---

## 🔧 Quick Fixes

### If logout doesn't work:
1. Check console for errors
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try in incognito mode

### If still can access protected pages:
1. Verify you're actually logged out (check user state)
2. Clear localStorage manually
3. Hard refresh (Ctrl+Shift+R)

---

## 📊 Visual Checklist

- [ ] "Log out" button visible on Dashboard
- [ ] "Log out" button visible on New Scan
- [ ] "Log out" button visible on Scan Results
- [ ] Button shows "Logging out..." when clicked
- [ ] Redirects to home page after logout
- [ ] Cannot access protected pages after logout
- [ ] Refresh doesn't restore session
- [ ] Can log back in successfully

---

**If all checkboxes are checked: Feature is working correctly! ✅**
