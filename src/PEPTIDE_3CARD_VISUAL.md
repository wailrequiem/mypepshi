# 🎨 Peptide 3-Card Row - Visual Reference

## Desktop Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                  AI-Picked Peptides for Your Goals                  │
│                   Matched to your scan and answers                   │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  GHK-Cu       [92%]  │  │  BPC-157      [88%]  │  │  Epithalon    [85%]  │
│                      │  │                      │  │                      │
│ [Skin] [Anti-aging]  │  │ [Recovery] [Joint]   │  │ [Sleep] [Longevity]  │
│ [Collagen]           │  │ [Healing]            │  │ [Anti-aging]         │
│                      │  │                      │  │                      │
│ Promotes collagen    │  │ Accelerates healing  │  │ Regulates circadian  │
│ production and skin  │  │ of muscles, tendons  │  │ rhythm and supports  │
│ regeneration...      │  │ and ligaments...     │  │ healthy sleep...     │
│                      │  │                      │  │                      │
│  ✨ Click for details│  │  ✨ Click for details│  │  ✨ Click for details│
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

## Mobile Layout (Swipeable)

```
┌─────────────────────────────────────────────┐
│   AI-Picked Peptides for Your Goals         │
│   Matched to your scan and answers           │
└─────────────────────────────────────────────┘

     ┌───────────────────────────┐
     │  GHK-Cu          [92%]    │
     │                           │  ← Swipe left/right
     │ [Skin] [Anti-aging]       │
     │ [Collagen]                │
     │                           │
     │ Promotes collagen         │
     │ production and skin       │
     │ regeneration...           │
     │                           │
     │  ✨ Tap for details       │
     └───────────────────────────┘
     
            ● ○ ○  (indicators)
```

## Card States

### Normal State
```
┌──────────────────────────────────┐
│  Peptide Name          [XX%]     │ ← Name + Gradient Badge
│                                  │
│ [Tag1] [Tag2] [Tag3]             │ ← Category Pills
│                                  │
│ Summary text here that spans     │ ← 2-line summary
│ two lines max with truncation    │   (line-clamp-2)
│                                  │
│  ✨ Click for details            │ ← Hover indicator
└──────────────────────────────────┘
```

### Hover State (Desktop)
```
┌══════════════════════════════════┐
║  Peptide Name          [XX%]     ║ ← Brighter border
║                                  ║   Subtle gradient BG
║ [Tag1] [Tag2] [Tag3]             ║
║                                  ║
║ Summary text here that spans     ║
║ two lines max with truncation    ║
║                                  ║
║  ✨ Click for details            ║ ← Visible
╚══════════════════════════════════╝
```

### Loading State (Skeleton)
```
┌──────────────────────────────────┐
│  ████████          ███████       │ ← Animated pulse
│                                  │
│ ████ ██████ █████                │
│                                  │
│ ████████████████████████████     │
│ ██████████████                   │
└──────────────────────────────────┘
```

## Modal Layout

```
╔════════════════════════════════════════╗
║  GHK-Cu                          [×]   ║ ← Name + Close
║                                        ║
║  [92% match for your goals]            ║ ← Gradient badge
║                                        ║
║  [Skin] [Anti-aging] [Collagen]        ║ ← All tags
╟────────────────────────────────────────╢
║  ABOUT                                 ║
║  GHK-Cu (Copper Peptide) is a         ║
║  naturally occurring peptide that...   ║
║  [Full description paragraph]          ║
╟────────────────────────────────────────╢
║  KEY BENEFITS                          ║
║  ✨ Stimulates collagen synthesis      ║
║  ✨ Improves skin firmness             ║
║  ✨ Reduces fine lines                 ║
║  ✨ Promotes wound healing             ║
║  ✨ Provides antioxidant protection    ║
╟────────────────────────────────────────╢
║  ⚠️ Disclaimer: This peptide is for   ║
║     research purposes only. Consult    ║
║     healthcare professional...         ║
╟────────────────────────────────────────╢
║        [      Got it      ]            ║
╚════════════════════════════════════════╝
```

## Color Scheme

### Fit Score Gradients
```
92% → from-emerald-500 to-green-400     (Bright green)
88% → from-cyan-500 to-blue-400         (Cyan-blue)
85% → from-blue-500 to-indigo-400       (Blue-indigo)
<70 → from-indigo-500 to-purple-400     (Purple)
```

### Card Styling
```
Background:    bg-card/50 backdrop-blur-sm
Border:        border border-primary/20
Hover Border:  border-primary/40
Gradient:      bg-gradient-to-br from-primary/5
Shadow:        0 0 20px rgba(6, 182, 212, 0.1)
Corners:       rounded-2xl
```

### Tags
```
Background:    bg-card
Border:        border-border/50
Text:          text-muted-foreground
Size:          text-xs
Padding:       px-2 py-0.5
Corners:       rounded-full
```

## Responsive Breakpoints

```
Mobile (< 768px):
├── Horizontal scroll carousel
├── Cards: w-[85vw] (85% viewport width)
├── Shows ~1.1 cards at once
├── Snap scrolling
└── Dot indicators (3 dots)

Tablet/Desktop (≥ 768px):
├── Grid layout
├── 3 equal columns
├── Cards: auto width (1/3 each)
├── No scrolling needed
└── All 3 visible at once
```

## Spacing

```
Section Header:
  - Title: text-xl font-semibold
  - Gap: gap-2
  - Icon: w-5 h-5

Cards:
  - Gap between cards: gap-4
  - Internal padding: p-5
  - Elements spacing: space-y-4

Modal:
  - Sections: space-y-6
  - Benefits list: space-y-2
  - Button: py-3
```

## Animation Timing

```
Cards Fade In:
  Card 1: delay: 0ms
  Card 2: delay: 100ms
  Card 3: delay: 200ms

Modal Open:
  Duration: default (~300ms)
  Type: scale + opacity

Skeleton Pulse:
  Animation: animate-pulse (native)
```

## Data Structure

```typescript
Peptide {
  name: string              // "GHK-Cu"
  fit_score: number         // 92
  tags: string[]            // ["Skin", "Anti-aging", "Collagen"]
  summary: string           // Short description (2 lines)
  full_description: string  // Long description (modal)
  benefits: string[]        // Bullet points (modal)
  disclaimer: string        // Warning text (modal)
}
```

## Integration Points

```
PaymentSuccessScreen.tsx
├── Results Card (Overall + Sub-scores)
├── [NEW] Peptide 3-Card Row ← Inserted here
├── Scan Photos (Front + Side)
├── Glow-Up Plan Section
├── Peptide AI Coach Section
└── Scan History
```

## Error States (All Safe)

```
API Returns Empty:
  → Shows fallback peptides (GHK-Cu, BPC-157, Epithalon)
  → No error message displayed
  → User doesn't notice difference

API Fails:
  → Shows fallback peptides
  → No crash
  → No red error box

Loading:
  → Shows 3 skeleton cards
  → Animated pulse effect
  → Same size as real cards

No Data in Modal Fields:
  → Uses summary as full_description
  → Hides benefits section if empty
  → Hides disclaimer if empty
  → Never shows "undefined"
```

## User Interactions

```
Desktop:
1. Hover over card → Border brightens, BG gradient appears
2. Click card → Modal opens with smooth scale animation
3. Click "Got it" or X → Modal closes
4. ESC key → Modal closes (built-in DialogContent)

Mobile:
1. Swipe left/right → Cards scroll smoothly
2. Cards snap to center
3. Tap card → Modal opens
4. Tap "Got it" or outside modal → Modal closes
5. Swipe up on modal → Scrolls modal content
```

## Accessibility

```
✅ Semantic HTML (button elements)
✅ Keyboard navigable (Tab, Enter, ESC)
✅ Focus visible (default browser styles)
✅ Screen reader friendly (proper labels)
✅ Color contrast (WCAG AA compliant)
✅ Touch targets (min 44×44px on mobile)
```

## Performance

```
✅ Lazy modal rendering (AnimatePresence)
✅ Small component size (~300 lines)
✅ Minimal re-renders (useState only)
✅ CSS animations (GPU accelerated)
✅ No heavy computations
✅ Efficient data handling
```

---

**Result:** A beautiful, responsive, safe 3-card peptide row! 🎉
