# Onboarding Data Management

## Overview

All onboarding answers are now stored in a structured format that can be used for AI prompts, personalization, and analytics.

## Implementation

### Context Provider

**Location:** `src/contexts/OnboardingContext.tsx`

Provides:
- `onboardingData` - Current state of all onboarding answers
- `setAnswer(key, value)` - Set a single answer
- `toggleMultiAnswer(key, value)` - Toggle a value in an array (for multi-select)
- `setScanId(scanId)` - Link a scan to onboarding data
- `syncToSupabase()` - Save data to user profile
- `resetOnboarding()` - Clear all data

### Data Schema

```typescript
interface OnboardingData {
  gender: "male" | "female" | null;
  age: number | null;
  struggles: string[];                    // Multi-select
  compliments: string;                    // Single-select
  confidence: string;                     // Single-select
  lifestyle: string[];                    // Multi-select
  mirror_thoughts: string;                // Single-select
  peptides_openness: string;              // Single-select
  peptides_knowledge: string;             // Single-select
  peptides_goals: string[];               // Multi-select
  peptides_risk_tolerance: string;        // Single-select
  peptides_past_experience: string;       // Single-select
  peptides_timing: string;                // Single-select
  created_at: string;                     // ISO timestamp
  last_scan_id: string | null;            // Reference to scans table
}
```

### Persistence

1. **localStorage** (immediate)
   - Automatically saves on every change
   - Loaded on app start
   - Key: `onboarding_data`
   - Survives refresh and navigation

2. **Supabase profiles table** (when authenticated)
   - Synced when user logs in
   - Synced when onboarding completes
   - Synced when scan completes
   - Column: `onboarding_json` (jsonb)

## Database Setup

Run `PROFILES_SETUP.sql` in Supabase SQL Editor to create:
- `profiles` table
- RLS policies (users can only access their own profile)
- Indexes for performance

## Usage

### In Components

```tsx
import { useOnboarding } from "@/contexts/OnboardingContext";

function MyComponent() {
  const { onboardingData, setAnswer, toggleMultiAnswer } = useOnboarding();

  const handleGenderSelect = (gender: string) => {
    setAnswer("gender", gender === "man" ? "male" : "female");
    // Navigate to next step
  };

  const handleMultiSelect = (value: string) => {
    toggleMultiAnswer("struggles", value);
  };

  return <div>{/* UI */}</div>;
}
```

### Accessing User Data

```tsx
// In any component with auth
const { user } = useAuth();
const { onboardingData } = useOnboarding();

// Data is already loaded from localStorage
// If user is authenticated, it's synced to Supabase
console.log(onboardingData);
```

### Fetching from Supabase

```tsx
const { data } = await supabase
  .from("profiles")
  .select("onboarding_json")
  .eq("id", user.id)
  .single();

const onboardingData = data.onboarding_json;
```

## Integration with Scans

When a scan completes:
1. Scan is saved to `scans` table
2. `last_scan_id` is updated in onboarding data
3. Onboarding data is synced to Supabase

This creates a link between:
- User's answers (onboarding data)
- User's facial analysis (scan results)
- User's account (profiles)

## AI Prompt Building

Example prompt construction:

```typescript
const { onboardingData } = useOnboarding();
const { data: scan } = await supabase
  .from("scans")
  .select("scores_json")
  .eq("id", onboardingData.last_scan_id)
  .single();

const aiPrompt = `
User Profile:
- Gender: ${onboardingData.gender}
- Age: ${onboardingData.age}
- Main struggles: ${onboardingData.struggles.join(", ")}
- Confidence level: ${onboardingData.confidence}
- Peptide interest: ${onboardingData.peptides_openness}

Facial Analysis:
- Overall score: ${scan.scores_json.overall}
- Skin quality: ${scan.scores_json.skinQuality}
- Jawline: ${scan.scores_json.jawline}
- Potential: ${scan.scores_json.potential}

Generate a personalized glow-up plan...
`;
```

## Data Flow

1. **User starts onboarding**
   - Data saved to localStorage on each answer
   - Context keeps state in sync

2. **User completes face scan**
   - Scan saved to `scans` table
   - `last_scan_id` updated in context
   - If authenticated: synced to profiles

3. **User completes onboarding**
   - Final sync to Supabase (if authenticated)
   - Navigate to paywall

4. **User logs in later**
   - localStorage data synced to profiles
   - Subsequent changes auto-sync

5. **User creates new scan from dashboard**
   - New scan saved
   - `last_scan_id` updated
   - Profiles updated

## Reset/Clear Data

```tsx
const { resetOnboarding } = useOnboarding();

// Clear all data (use with caution)
resetOnboarding();
```

This removes:
- localStorage entry
- In-memory state

It does NOT remove Supabase profile data (by design).

## Future Enhancements

- [ ] Versioning (track changes over time)
- [ ] Export data as JSON
- [ ] Import/restore from backup
- [ ] Analytics dashboard (admin)
- [ ] A/B test different questions
- [ ] Conditional question flows based on answers
