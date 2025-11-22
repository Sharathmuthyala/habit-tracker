# Navigation Reorganization Plan

## Overview
This document outlines the plan to reorganize the habit tracker from a single-page view to a 3-tab navigation structure with Atoms-inspired Analytics.

## Current State Analysis
- **Structure**: Single container with all content
- **Navigation**: FAB button for adding habits, no bottom nav
- **Data**: `habitData = { "date": { "habitId": true } }`
- **Functions**: `getHabitCompletionCount(habitId)` exists

## Implementation Steps

### Step 1: Add Bottom Navigation (NEXT)
Location: After closing `.container` div, before FAB button

```html
<!-- Bottom Navigation -->
<nav class="bottom-navigation">
  <button class="nav-tab active" data-tab="habits" onclick="switchTab('habits')">
    <span class="material-symbols-outlined">check_circle</span>
    <span class="nav-label">Habits</span>
  </button>

  <button class="nav-tab" data-tab="analytics" onclick="switchTab('analytics')">
    <span class="material-symbols-outlined">bar_chart</span>
    <span class="nav-label">Analytics</span>
  </button>

  <button class="nav-tab" data-tab="profile" onclick="switchTab('profile')">
    <span class="material-symbols-outlined">person</span>
    <span class="nav-label">Profile</span>
  </button>
</nav>
```

### Step 2: Wrap Existing Content in Tabs
Current `.container` content becomes "Habits" tab content.

### Step 3: Create Analytics Tab Structure
- Sub-tabs: Progress | Analytics
- Progress view: Atoms-inspired design
- Analytics view: Move existing charts here

### Step 4: Create Profile Tab
- User info
- Settings (theme toggle, export CSV)
- Logout button

### Step 5: Add JavaScript Functions
- `switchTab(tabName)`
- `calculateTotalReps()`
- `renderProgressView()`
- `renderMilestoneCards()`
- `exportDataAsCSV()`

## CSS Classes Needed
See full CSS in the original prompt. Key classes:
- `.bottom-navigation`
- `.nav-tab`
- `.tab-content`
- `.sub-tabs`
- `.progress-hero`
- `.total-reps-card`
- `.milestone-card`

## Data Structure Notes
- Habits array: Use existing `habits` global
- Completion data: Use existing `habitData` object
- Calculate totals by iterating `habitData` and counting completions per habit

## Testing Checklist
- [ ] All 3 tabs clickable and switch correctly
- [ ] Habits tab shows all existing features
- [ ] Analytics Progress shows total reps correctly
- [ ] Milestones calculate properly
- [ ] Profile tab functional
- [ ] No existing features broken
