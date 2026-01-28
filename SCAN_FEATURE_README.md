# New Scan Feature Implementation

## Database Setup

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the SQL in `SCAN_SETUP.sql`
4. Verify the `scans` table is created

## Features Implemented

### 1. New Scan Flow
- **Route:** `/scan/new`
- **Button:** Dashboard "New scan" button navigates to this route
- **Component:** Reuses `ScanFlow` with `mode="newScan"`
- **Save:** After scan completion, saves to Supabase and redirects to dashboard

### 2. Scan History
- **Location:** Dashboard page
- **Data:** Fetched from Supabase `scans` table
- **Display:** Shows last 3 scans with date and score
- **Click:** Clickable items navigate to scan details

### 3. Scan Results View
- **Route:** `/scan/:scanId`
- **Display:** Shows historical scan data (scores, images, date)
- **Back button:** Returns to dashboard
- **Read-only:** Cannot edit past scans

### 4. Shared Scan Flow
- **Component:** `ScanFlow.tsx`
- **Modes:**
  - `"onboarding"` → navigates to `/paywall` after completion
  - `"newScan"` → saves scan and navigates to `/dashboard`

## How It Works

### User Flow
1. User clicks "New scan" on dashboard
2. Opens camera flow at `/scan/new`
3. Captures front photo → confirms
4. Captures side photo → confirms
5. Analysis screen (3s loading)
6. Scan is saved to database
7. Redirects to dashboard
8. Scan appears in history
9. Click history item to view full results

### Authentication
- New scans require login
- Only logged-in users can save scans
- Each user sees only their own scans
- RLS policies enforce data isolation

## Data Structure

```typescript
interface Scan {
  id: string;                // UUID
  user_id: string;           // Auth user ID
  created_at: string;        // ISO timestamp
  front_image_url: string;   // Base64 image data (or URL)
  side_image_url: string;    // Base64 image data (or URL)
  scores_json: {             // JSON object
    overall: number;
    skinQuality: number;
    jawline: number;
    cheekbones: number;
    symmetry: number;
    eyeArea: number;
    potential: number;
  };
}
```

## Testing

1. Ensure Supabase credentials are in `.env.local`:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Run SQL setup in Supabase:
   - Go to Supabase Dashboard → SQL Editor
   - Copy and run the entire `SCAN_SETUP.sql` file
   - Verify the `scans` table exists in Table Editor

3. Start dev server: `npm run dev`

4. Navigate to dashboard: http://localhost:8081/dashboard

5. Create an account (required for saving scans)

6. Click "New scan" button

7. Complete scan flow:
   - Front photo → confirm
   - Side photo → confirm
   - Wait for analysis

8. Verify:
   - Redirects to dashboard
   - New scan appears in history section
   - Click the scan to view results
   - Refresh page - history persists

9. Check Supabase:
   - Go to Table Editor → scans
   - Verify new row exists with your user_id

## Future Enhancements

- [ ] Image optimization (compress before save)
- [ ] Pagination for scan history
- [ ] Delete scan functionality
- [ ] Export scan results
- [ ] Compare scans side-by-side
- [ ] Scan trends graph
