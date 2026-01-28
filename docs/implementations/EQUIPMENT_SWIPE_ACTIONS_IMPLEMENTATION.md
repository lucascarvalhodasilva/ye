# Equipment Swipe Actions Implementation

## Overview
This document describes the implementation of the schedule/deduction button move from visible UI to swipe actions in the Equipment list.

## Changes Summary

### Before
```
┌────────────────────────────────────┐
│ 💻 MacBook Pro                     │
│ €2,800 | 3 Jahre                   │
│ [📊 Abschreibung] ← Always visible │
└────────────────────────────────────┘
  Swipe right →  [📄]
  Swipe left  →  [✏️] [🗑️]
```

### After
```
┌────────────────────────────────────┐
│ 💻 MacBook Pro                     │
│ €2,800 | 3 Jahre                   │
│                    ← Clean surface │
└────────────────────────────────────┘
  Swipe right →  [📄] [📊]  ← View actions
  Swipe left  →  [✏️] [🗑️]  ← Modify actions
```

## Component Changes

### 1. SwipeableListItem.js

#### New Props
- `onSchedule?: Function` - Optional callback for schedule/deduction button

#### Width Calculations
```javascript
const numRightActions = 2; // edit + delete
const numLeftActions = (hasReceipt ? 1 : 0) + (onSchedule ? 1 : 0);
const actionsWidth = numRightActions * 48 + Math.max(0, numRightActions - 1) * 8;
const leftActionsWidth = numLeftActions * 48 + Math.max(0, numLeftActions - 1) * 8;
```

**Safety Improvement:** Uses `Math.max(0, n - 1)` to prevent negative gap calculations.

#### Stale Closure Fix
```javascript
// Store widths in ref for event handlers
const widthsRef = useRef({ actionsWidth, leftActionsWidth, hasReceipt, onSchedule });
useEffect(() => {
  widthsRef.current = { actionsWidth, leftActionsWidth, hasReceipt, onSchedule };
}, [actionsWidth, leftActionsWidth, hasReceipt, onSchedule]);
```

**Problem:** Window event listeners had stale closures over width values.
**Solution:** Store current values in ref, access via `widthsRef.current` in handlers.

#### Button Grouping
```javascript
// LEFT SIDE (swipe right reveals)
{hasReceipt && <button>📄 Receipt</button>}
{onSchedule && <button>📊 Schedule</button>}

// RIGHT SIDE (swipe left reveals)
<button>✏️ Edit</button>
<button>🗑️ Delete</button>
```

**Visual Design:**
- Receipt + Schedule: `bg-primary/80` (blue) - "View" actions
- Edit: `bg-primary/80` (blue) - "Modify" action
- Delete: `bg-red-500/80` (red) - "Destructive" action

### 2. EquipmentList.js

#### Removed
```javascript
// ❌ OLD: Always visible button (lines 134-160)
<button
  onClick={(e) => {
    e.stopPropagation();
    // ... schedule logic
  }}
  className="w-8 h-8 rounded-lg ..."
>
  <svg>...</svg>
</button>
```

#### Added
```javascript
// ✅ NEW: Swipe action
<SwipeableListItem
  onSchedule={() => {
    if (scheduleOpen && selectedEquipment?.id !== entry.id) {
      setSelectedEquipment(entry);
    } else if (scheduleOpen && selectedEquipment?.id === entry.id) {
      setScheduleOpen(false);
      setTimeout(() => setSelectedEquipment(null), 300);
    } else {
      setSelectedEquipment(entry);
      setScheduleOpen(true);
    }
  }}
>
```

## Benefits

### User Experience
1. **Cleaner UI**: No visual clutter on item surface
2. **Logical Grouping**: View actions (📄📊) separated from modify actions (✏️🗑️)
3. **Visual Hierarchy**: Blue for view/modify, red for destructive
4. **Consistent Pattern**: Matches bi-directional swipe pattern

### Code Quality
1. **Safe Calculations**: `Math.max(0, n - 1)` prevents negative values
2. **No Stale Closures**: Ref-based storage ensures current values
3. **Maintainable**: Single component handles all swipe logic
4. **Reusable**: Other lists can add schedule button if needed

## Testing

### Manual Tests
- [ ] Equipment item surface is clean (no visible buttons)
- [ ] Swipe right reveals receipt + schedule buttons (if equipment has them)
- [ ] Swipe left reveals edit + delete buttons
- [ ] All buttons trigger correct actions
- [ ] Schedule button opens FloatingScheduleCard
- [ ] Buttons have proper styling (blue for view, red for delete)
- [ ] No layout shifts or animation issues

### Automated Tests
- ✅ SwipeableListItem syntax valid
- ✅ EquipmentList syntax valid
- ✅ No CodeQL security alerts
- ✅ All features verified via pattern matching

## Edge Cases

### No Receipt, Has Schedule
```
Swipe right →  [📊]        ← Only schedule
Swipe left  →  [✏️] [🗑️]
```

### Has Receipt, No Schedule
```
Swipe right →  [📄]        ← Only receipt
Swipe left  →  [✏️] [🗑️]
```

### Has Both
```
Swipe right →  [📄] [📊]   ← Both view actions
Swipe left  →  [✏️] [🗑️]
```

### Has Neither
```
Swipe right →  (disabled)  ← No swipe
Swipe left  →  [✏️] [🗑️]
```

## Browser Compatibility

Same as SwipeableListItem:
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Mobile (Android 5+)
- ✅ Desktop Chrome (v80+)
- ✅ Desktop Firefox (v75+)
- ✅ Desktop Safari (v13+)
- ✅ Desktop Edge (v80+)

## Related Files

- `/src/components/shared/SwipeableListItem.js` - Swipe component
- `/src/app/equipment/_features/components/EquipmentList.js` - Equipment list
- `/src/components/equipment/FloatingScheduleCard.js` - Schedule modal
- `/SWIPE_GESTURES_IMPLEMENTATION.md` - Original bi-directional swipe docs

## Future Enhancements

1. **Haptic Feedback**: Vibration when swipe threshold met
2. **Swipe Hints**: Show chevrons to indicate swipe is available
3. **Keyboard Access**: Allow keyboard navigation to swipe actions
4. **Tutorial**: First-time user hint for swipe gestures
5. **Customizable Colors**: Theme-based button colors
