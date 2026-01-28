# Bi-Directional Swipe Gestures Implementation

## Overview
This document describes the implementation of bi-directional swipe gestures for list items in the YE expense tracking application.

## Component: SwipeableListItem

**Location:** `/src/components/shared/SwipeableListItem.js`

### Features
- ✅ **Swipe LEFT**: Reveals Edit and Delete action buttons
- ✅ **Swipe RIGHT**: Reveals Receipt preview button (only if item has receipt)
- ✅ **Touch & Mouse Support**: Works on mobile devices and desktop browsers
- ✅ **Smooth Animations**: 200ms CSS transitions
- ✅ **Swipe Threshold**: 50px minimum swipe distance to trigger
- ✅ **Auto-close**: Click anywhere outside to close swipe state

### Props

```javascript
{
  children: React.ReactNode,      // Main content of the list item
  onEdit: Function,               // Callback when edit button is clicked
  onDelete: Function,             // Callback when delete button is clicked
  onViewReceipt: Function,        // Callback when receipt button is clicked
  hasReceipt: boolean,            // Whether the item has a receipt (enables right swipe)
  itemId: string,                 // Unique identifier for the item
  className: string               // Additional CSS classes for the container
}
```

### Usage Example

```javascript
import SwipeableListItem from '@/components/shared/SwipeableListItem';

function MyList({ items }) {
  return items.map(item => (
    <SwipeableListItem
      key={item.id}
      itemId={item.id}
      className="rounded-2xl bg-card border border-border"
      hasReceipt={!!item.receiptFileName}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
      onViewReceipt={() => handleViewReceipt(item)}
    >
      <div className="p-4">
        {/* Your item content here */}
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </SwipeableListItem>
  ));
}
```

## Integration

The component has been integrated into three main list components:

### 1. TripList (`/src/app/trips/_features/components/TripList.js`)
- Shows receipt button for trips with public transport receipts
- Receipt appears if any related mileage entry has a receipt

### 2. ExpenseList (`/src/app/expenses/_features/components/ExpenseList.js`)
- Shows receipt button for expenses with attached receipts
- Directly checks `entry.receiptFileName`

### 3. EquipmentList (`/src/app/equipment/_features/components/EquipmentList.js`)
- Shows receipt button for equipment with purchase receipts
- Directly checks `entry.receiptFileName`

## Visual Design

### Swipe LEFT (Actions)
```
┌────────────────────────────┬────┬────┐
│ Item Content               │ ✏️ │🗑️ │
│                            │Edit│Del │
└────────────────────────────┴────┴────┘
```

**Action Buttons:**
- **Edit Button**: Primary color background, white icon
- **Delete Button**: Red background, white icon
- **Width**: 10 (40px) each, total 120px for both + padding

### Swipe RIGHT (Receipt)
```
┌────────┬────────────────────────────┐
│   📄   │ Item Content               │
│ Beleg  │                            │
└────────┴────────────────────────────┘
```

**Receipt Button:**
- **Background**: Blue gradient (`from-blue-500 to-blue-600`)
- **Icon**: Document icon (white)
- **Label**: "Beleg" (German for "receipt")
- **Width**: 80px
- **Hover**: Darker blue gradient (`from-blue-600 to-blue-700`)

## Technical Details

### Swipe Detection
1. **Pointer Down**: Record starting X position
2. **Pointer Move**: Calculate delta from start position
3. **Pointer Up**: Determine if threshold (50px) was met

### Direction Logic
```javascript
if (delta < -50) {
  // Swipe LEFT → Show Edit/Delete
  setSwipeDirection('left');
} else if (delta > 50 && hasReceipt) {
  // Swipe RIGHT → Show Receipt
  setSwipeDirection('right');
} else {
  // Below threshold → Reset
  setSwipeDirection(null);
}
```

### Animation
- **Transition**: `transform 200ms cubic-bezier(0.4, 0, 0.2, 1)`
- **Transform**: `translateX()` based on swipe direction
  - Left: `-120px` (width of actions)
  - Right: `80px` (width of receipt button)
  - None: `0px` (centered)

### Event Handling
```javascript
// Supports both touch and mouse events
onMouseDown={handlePointerDown}
onTouchStart={handlePointerDown}
onMouseMove={handlePointerMove}
onTouchMove={handlePointerMove}
onMouseUp={handlePointerUp}
onTouchEnd={handlePointerUp}
```

## Code Reduction

### Before
- Each list component had ~70 lines of swipe handling code
- Total: ~210 lines across 3 components

### After
- Shared component: ~150 lines
- Integration per component: ~3 lines
- Total: ~150 + 9 = ~159 lines
- **Net savings**: ~51 lines (~24% reduction)

## Benefits

### User Experience
1. **Larger Touch Target**: Swipe right reveals 80px button vs. 24px icon
2. **More Discoverable**: Swipe gestures are intuitive on mobile
3. **Consistent Pattern**: Same behavior across all list views
4. **Fast Access**: One swipe instead of precise tap on small icon

### Developer Experience
1. **Reusable Component**: Single source of truth for swipe behavior
2. **Easy Integration**: Just wrap content and pass props
3. **Maintainable**: Changes to swipe logic only need one file edit
4. **Type-Safe**: Clear prop interface with JSDoc comments

## Future Enhancements

Potential improvements that could be added:

1. **Haptic Feedback**: Add vibration on mobile when swipe threshold is met
2. **Swipe Progress**: Show partial reveal during swipe (before threshold)
3. **Multiple Swipe States**: Allow custom buttons for different swipe directions
4. **Accessibility**: Keyboard navigation (Tab + Enter to access actions)
5. **Tutorial**: Show first-time user hint "Swipe right to view receipt"
6. **Animation Options**: Allow customizing transition duration and easing

## Browser Support

- ✅ **Mobile Safari** (iOS 12+)
- ✅ **Chrome Mobile** (Android 5+)
- ✅ **Desktop Chrome** (v80+)
- ✅ **Desktop Firefox** (v75+)
- ✅ **Desktop Safari** (v13+)
- ✅ **Desktop Edge** (v80+)

## Testing Checklist

- [x] Swipe LEFT reveals Edit/Delete buttons
- [x] Swipe RIGHT reveals Receipt button (when receipt exists)
- [x] Swipe RIGHT does nothing when no receipt
- [x] Click outside closes swipe state
- [x] Touch events work on mobile
- [x] Mouse events work on desktop
- [x] Smooth 200ms animation
- [x] 50px threshold prevents accidental swipes
- [x] Multiple items can be swiped (closes previous)
- [x] Buttons trigger correct callbacks
- [x] No console errors or warnings

## Notes

- The component uses CSS transforms for smooth performance
- Click handlers stop propagation to prevent item clicks when buttons are visible
- The backdrop element (`position: fixed`) ensures click-outside closes the swipe
- Receipt button only renders if `hasReceipt` is true (conditional rendering for performance)
