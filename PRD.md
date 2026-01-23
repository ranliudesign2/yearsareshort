# Product Requirements Document
## Years Are Short — Chrome New Tab Extension

**Version:** 1.0  
**Author:** Ran  
**Last Updated:** January 2026

---

## Overview

**Years Are Short** is a Chrome extension that replaces the new tab page with a mindful productivity experience. It combines daily intention-setting (inspired by Anthony Neves' One Day Method) with a mortality visualization (Memento Mori calendar) to help users focus on what matters most.

### Vision Statement

Every new tab becomes a moment of reflection—a reminder that while days feel long, years pass quickly. This extension helps users identify their daily priorities while maintaining perspective on the finite nature of time.

### Target User

Intentional professionals who want to:
- Start each browser session with clarity on their priorities
- Break the cycle of reactive, unfocused work
- Maintain perspective on what truly matters
- Build consistent daily habits around their non-negotiables

---

## Core Features

### 1. Hero Quote

**Location:** Top center of the screen  
**Content:** "days are long years are short"  
**Behavior:** Static, always visible  

**Design Notes:**
- Large, elegant typography (serif or refined sans-serif)
- Subtle, contemplative presence—not overwhelming
- Sets the philosophical tone for the entire experience

---

### 2. Daily Focus Panel (Left Side)

A task management system inspired by Anthony Neves' One Day Method, designed for daily intention-setting rather than endless task lists.

#### 2.1 Daily Highlight

**Location:** Top of the left panel  
**Purpose:** The ONE thing that would make today successful  

| Attribute | Specification |
|-----------|---------------|
| Default state | Empty text input with placeholder |
| Persistence | Resets to empty at midnight local time |
| Checkbox | Single checkbox to mark complete |
| Visual distinction | Visually differentiated from recurring items (larger, highlighted, or bordered) |

**User Flow:**
1. User opens new tab
2. If no highlight set for today, sees empty input: "What's your highlight for today?"
3. User types their highlight
4. Can check off when complete
5. Tomorrow: field resets to empty

#### 2.2 Non-Negotiables Checklist

**Location:** Below the Daily Highlight  
**Purpose:** Recurring daily commitments that reset each day  

| Attribute | Specification |
|-----------|---------------|
| Default count | 5 items |
| Customization | User can edit labels, add items (up to 10), remove items (minimum 1) |
| Persistence | Labels persist indefinitely; check states reset at midnight |
| Default labels | Placeholder suggestions (e.g., "Morning routine," "Exercise," "Deep work," "Connect with loved one," "Evening reflection") |

**Interactions:**
- Click checkbox to toggle complete/incomplete
- Click text to edit label
- Hover reveals delete button (if more than 1 item)
- "Add item" button appears below list (if under 10 items)

#### 2.3 Date Navigation

**Location:** Header of left panel  
**Purpose:** Review past days and plan future days  

| Element | Behavior |
|---------|----------|
| Left arrow | Navigate to previous day |
| Right arrow | Navigate to next day |
| Date display | Shows current viewing date (e.g., "Wednesday, Jan 8") |
| Today indicator | Visual cue when viewing today vs. other dates |

**Date Navigation Rules:**
- Past dates: Read-only view of what was checked off (historical record)
- Today: Fully editable
- Future dates: Can pre-set highlight and pre-check items for planning
- Limit: Can navigate up to 30 days in past, 7 days in future

---

### 3. Memento Mori Panel (Right Side)

A visualization of life in weeks, showing time lived and time remaining. Inspired by Tim Urban's "Life in Weeks" and the Stoic practice of memento mori.

#### 3.1 Life Statistics

**Location:** Top of right panel  
**Display:** Key metrics about user's life timeline  

| Statistic | Calculation |
|-----------|-------------|
| Age | Current age in years |
| Weeks lived | Total weeks from birth to today |
| Weeks remaining | Estimated weeks until life expectancy |
| Percentage | Percentage of estimated life completed |

#### 3.2 Week Grid Visualization

**Location:** Main area of right panel  
**Structure:** Grid where each cell = 1 week of life  

| Visual State | Meaning | Appearance |
|--------------|---------|------------|
| Filled/Lived | Weeks already passed | Filled or darker color |
| Current | This week | Highlighted/glowing |
| Remaining | Future weeks | Empty or lighter color |

**Grid Layout:**
- 52 columns (weeks per year)
- Rows = years of expected lifespan
- Scrollable if needed to show full lifespan

#### 3.3 Configuration (One-Time Setup)

**Triggered:** On first use, modal appears  
**Required inputs:**
- Birth date (date picker)
- Life expectancy assumption (default: 80 years, adjustable 60-100)

**Storage:** Saved locally, editable via settings

#### 3.4 Interaction Model

| Interaction | Behavior |
|-------------|----------|
| View | Display only—no direct manipulation |
| Hover (optional) | Show tooltip with week/year info |
| Click | No action (intentionally non-interactive) |

**Rationale:** The Mori panel is for contemplation, not interaction. Its purpose is perspective, not productivity.

---

## Data Architecture

### Storage Model

All data stored in Chrome's local storage (`chrome.storage.local`).

```
{
  "settings": {
    "birthDate": "1990-05-15",
    "lifeExpectancy": 80,
    "setupComplete": true
  },
  "nonNegotiables": [
    { "id": "uuid-1", "label": "Morning routine", "order": 0 },
    { "id": "uuid-2", "label": "Exercise", "order": 1 },
    ...
  ],
  "dailyData": {
    "2026-01-07": {
      "highlight": { "text": "Finish PRD review", "completed": false },
      "checklist": {
        "uuid-1": true,
        "uuid-2": false,
        ...
      }
    },
    ...
  }
}
```

### Reset Logic

| Data Type | Reset Behavior |
|-----------|----------------|
| Highlight text | Clears to empty at midnight |
| Highlight completion | Resets to unchecked |
| Non-negotiable labels | Never resets |
| Non-negotiable checks | Reset to unchecked at midnight |

**Midnight Definition:** Local device time (12:00 AM)

---

## Design Requirements

### Aesthetic Direction

**Inspiration:** Momentum Chrome extension  
**Tone:** Calm, contemplative, sophisticated  
**Style:** Clean minimalism with warmth  

### Visual Principles

| Principle | Implementation |
|-----------|----------------|
| Calm presence | Muted color palette, no harsh contrasts |
| Breathing room | Generous whitespace, unhurried layouts |
| Subtle depth | Soft shadows, gentle gradients |
| Typography-first | Beautiful, readable type as primary design element |
| Dark mode default | Easier on eyes, more contemplative mood |

### Color Palette (Suggested)

| Role | Color | Usage |
|------|-------|-------|
| Background | Deep warm gray (#1a1915) | Primary background |
| Surface | Slightly lighter (#242119) | Cards, panels |
| Text primary | Warm white (#fffcf5) | Headlines, important text |
| Text secondary | 60% opacity white | Labels, descriptions |
| Accent | Warm gold (#c9a66b) | Highlights, current week, interactive elements |
| Muted | 35% opacity white | Placeholders, disabled states |

### Typography

| Element | Specification |
|---------|---------------|
| Quote | Serif, large (3-4rem), light weight, tracked spacing |
| Panel headers | Small caps, generous letter-spacing |
| Body text | Clean sans-serif, comfortable reading size |
| Numbers/Stats | Serif or display font for elegance |

### Layout

| Viewport | Behavior |
|----------|----------|
| Desktop (>1200px) | Full split-screen, both panels visible |
| Tablet (768-1200px) | Stacked layout or reduced Mori grid |
| Mobile | Not applicable (new tab extension) |

---

## User Flows

### First-Time Setup

```
1. User installs extension
2. Opens new tab → sees onboarding modal
3. Modal asks for:
   - Birth date (required)
   - Life expectancy (optional, default 80)
4. User submits → modal closes
5. Full interface appears with:
   - Empty highlight field
   - Default non-negotiables (editable)
   - Populated Mori calendar
```

### Daily Usage

```
1. User opens new tab
2. Sees yesterday's checked items (if viewing yesterday)
3. Navigates to today (if not already)
4. Sets daily highlight (if not set)
5. Works through day, checking items as completed
6. Glances at Mori calendar for perspective
7. Next day: starts fresh
```

### Reviewing Past Days

```
1. User clicks left arrow on date nav
2. View shifts to previous day
3. User sees historical checklist state (read-only)
4. User can navigate further back (up to 30 days)
5. User clicks "Today" or navigates forward to return
```

---

## Technical Requirements

### Platform

| Requirement | Specification |
|-------------|---------------|
| Browser | Chrome (primary), Edge (compatible) |
| Manifest | Version 3 |
| Permissions | `storage` only |

### Performance

| Metric | Target |
|--------|--------|
| Initial load | < 500ms to interactive |
| Storage reads | < 50ms |
| Memory footprint | < 50MB |

### Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Full tab support, arrow keys for date nav |
| Screen readers | ARIA labels on all interactive elements |
| Color contrast | Minimum 4.5:1 for text |
| Focus indicators | Visible focus states |

---

## Future Considerations (Out of Scope for V1)

| Feature | Description | Priority |
|---------|-------------|----------|
| Sync across devices | Chrome sync integration | Medium |
| Background images | Momentum-style nature photos | Low |
| Quotes rotation | Daily rotating inspirational quotes | Low |
| Weekly review | Summary of week's completion rates | Medium |
| Custom themes | Light mode, alternate color schemes | Low |
| Export data | Download history as CSV/JSON | Low |
| Streaks | Track consecutive days of completion | Medium |

---

## Success Metrics

### Qualitative

- Users report feeling more focused when opening new tabs
- Users appreciate the mortality reminder as motivating (not depressing)
- The interface feels calm rather than anxiety-inducing

### Quantitative

| Metric | Target |
|--------|--------|
| Daily active usage | 5+ new tabs opened per day |
| Highlight set rate | >70% of days have a highlight |
| Non-negotiables completion | >50% items checked daily |
| Retention (30-day) | >40% of installers still active |

---

## Open Questions

1. **Data portability:** Should users be able to export/import their data?
2. **Onboarding friction:** Is asking for birth date too personal for first interaction? Consider allowing skip with default values.
3. **Mori calendar interactivity:** Should hovering on a week show what happened that week (if past) or goals (if future)?
4. **Sound/haptics:** Any subtle audio feedback when checking items?
5. **Motivational messaging:** Should there be encouraging messages based on completion rates?

---

## Appendix

### Anthony Neves' One Day Method (Reference)

The One Day Method focuses on identifying 3-5 non-negotiable daily actions that compound over time. The philosophy emphasizes:
- Consistency over intensity
- Daily resets (fresh start each day)
- Non-negotiables are commitments, not tasks
- Focus on inputs (actions) not outputs (results)

### Memento Mori Philosophy

"Memento mori" (Latin: "remember you will die") is a Stoic practice of reflecting on mortality to:
- Prioritize what truly matters
- Reduce anxiety about trivial concerns
- Motivate action on important goals
- Cultivate gratitude for present moments

---

*"You could leave life right now. Let that determine what you do and say and think." — Marcus Aurelius*
