# Android Back Button Integration for FloatingScheduleCard

## Overview
This document describes the implementation of Android back button handling for the FloatingScheduleCard component. The implementation integrates with the existing back button priority chain defined in issue #36 and ensures proper interaction with the auto-close behavior from issue #56.

## Implementation Summary

### Priority Chain
The Android back button now follows this priority order:
1. **Close FloatingScheduleCard** (if open) - NEW!
2. Close modals/dialogs (LIFO stack)
3. Close sidebar
4. Exit app immediately

### Key Features
- ✅ FloatingScheduleCard closes on Android back button press
- ✅ Smooth slide-down animation (300ms) when closed via back button
- ✅ App stays on Equipment page (doesn't navigate away)
- ✅ State properly reset after close
- ✅ Works with swipe-to-close (#38)
- ✅ Works with auto-close on form/receipt open (#56)
- ✅ Clean listener registration/cleanup

## Architecture

### Component Flow
```
LayoutClient
├── BackButtonHandler (registers global back button listener)
│   └── useBackButton hook (implements priority chain)
│       └── UIContext (provides schedule card state)
└── Equipment Page
    └── EquipmentList
        ├── scheduleOpen (local state)
        ├── openScheduleCard() (registers with UIContext)
        └── FloatingScheduleCard
```

### State Management

#### UIContext (`src/context/UIContext.js`)
Centralized state management for UI overlays:

```javascript
const UIContext = createContext();

export function UIProvider({ children }) {
  const [scheduleCardOpen, setScheduleCardOpen] = useState(false);
  const [closeScheduleCardHandler, setCloseScheduleCardHandler] = useState(null);

  const openScheduleCard = useCallback((closeHandler) => {
    setScheduleCardOpen(true);
    setCloseScheduleCardHandler(() => closeHandler);
  }, []);

  const closeScheduleCard = useCallback(() => {
    if (closeScheduleCardHandler) {
      closeScheduleCardHandler();
    }
    setScheduleCardOpen(false);
    setCloseScheduleCardHandler(null);
  }, [closeScheduleCardHandler]);

  return (
    <UIContext.Provider value={{
      scheduleCardOpen,
      openScheduleCard,
      closeScheduleCard,
      // ... other values
    }}>
      {children}
    </UIContext.Provider>
  );
}
```

**Key Points:**
- `scheduleCardOpen`: Boolean flag indicating if schedule card is currently open
- `closeScheduleCardHandler`: Function to call when closing (from EquipmentList)
- `openScheduleCard(closeHandler)`: Registers the schedule card as open
- `closeScheduleCard()`: Triggers the close handler and updates state

#### EquipmentList Registration (`src/app/equipment/_features/components/EquipmentList.js`)
Local schedule card state is synchronized with UIContext:

```javascript
const [scheduleOpen, setScheduleOpen] = useState(false);
const { openScheduleCard, closeScheduleCard: contextCloseScheduleCard } = useUIContext();

// Register/unregister schedule card with UIContext for back button handling
useEffect(() => {
  if (scheduleOpen) {
    openScheduleCard(() => {
      setScheduleOpen(false);
      setTimeout(() => setSelectedEquipment(null), 300);
    });
  } else {
    contextCloseScheduleCard();
  }
}, [scheduleOpen, openScheduleCard, contextCloseScheduleCard]);
```

**Key Points:**
- When `scheduleOpen` becomes `true`, registers with UIContext
- Provides close handler that updates local state
- When `scheduleOpen` becomes `false`, unregisters from UIContext
- 300ms delay allows slide-down animation to complete

### Back Button Handling

#### useBackButton Hook (`src/hooks/useBackButton.js`)
Implements the priority chain:

```javascript
export function useBackButton({ 
  scheduleCardOpen, 
  closeScheduleCard, 
  hasOpenModals, 
  closeTopModal, 
  sidebarOpen, 
  closeSidebar 
}) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return; // Only on Android/iOS
    }

    const backButtonListener = App.addListener('backButton', () => {
      // Priority 1: Close FloatingScheduleCard
      if (scheduleCardOpen) {
        closeScheduleCard();
        return;
      }

      // Priority 2: Close open modals/dialogs
      if (hasOpenModals) {
        closeTopModal();
        return;
      }

      // Priority 3: Close sidebar
      if (sidebarOpen) {
        closeSidebar();
        return;
      }

      // Priority 4: Exit app immediately
      App.exitApp();
    });

    return () => {
      backButtonListener.remove();
    };
  }, [scheduleCardOpen, closeScheduleCard, hasOpenModals, closeTopModal, sidebarOpen, closeSidebar]);
}
```

**Key Points:**
- Only registers on native platforms (Android/iOS)
- Checks schedule card first (highest priority)
- Uses early return to prevent fall-through
- Properly cleans up listener on unmount

#### BackButtonHandler (`src/components/BackButtonHandler.js`)
Wires UIContext state to the hook:

```javascript
export default function BackButtonHandler() {
  const { 
    scheduleCardOpen, 
    closeScheduleCard, 
    hasOpenModals, 
    popModal, 
    sidebarOpen, 
    closeSidebar 
  } = useUIContext();

  useBackButton({
    scheduleCardOpen,
    closeScheduleCard,
    hasOpenModals,
    closeTopModal: popModal,
    sidebarOpen,
    closeSidebar
  });

  return null; // Renders nothing
}
```

## Integration with Issue #56 (Auto-Close)

### Auto-Close Behavior
When a user opens an overlay (form or receipt viewer) while the schedule card is open, the schedule card automatically closes:

```javascript
onEdit={() => {
  // Auto-close schedule card when opening edit form (issue #56)
  if (scheduleOpen) {
    setScheduleOpen(false);
    setTimeout(() => setSelectedEquipment(null), 300);
  }
  onEdit && onEdit(entry);
}}

onViewReceipt={() => {
  // Auto-close schedule card when opening receipt viewer (issue #56)
  if (scheduleOpen) {
    setScheduleOpen(false);
    setTimeout(() => setSelectedEquipment(null), 300);
  }
  handleViewReceipt(entry.receiptFileName);
}}
```

### Priority Chain with Auto-Close

**Scenario 1: Schedule Card Open → Edit Form Opened**
1. User swipes equipment item → Schedule card opens
2. User taps "Edit" → Schedule card auto-closes (300ms animation)
3. Edit form opens
4. User presses back button → Edit form closes (modal priority)
5. User presses back button again → App exits

**Scenario 2: Schedule Card Open → Receipt Viewer Opened**
1. User swipes equipment item → Schedule card opens
2. User taps "View Receipt" → Schedule card auto-closes (300ms animation)
3. Receipt viewer opens
4. User presses back button → Receipt viewer closes (modal priority)
5. User presses back button again → App exits

**Scenario 3: Schedule Card Only**
1. User swipes equipment item → Schedule card opens
2. User presses back button → Schedule card closes
3. User stays on Equipment page
4. User presses back button again → App exits

## Testing Scenarios

### ✅ Basic Behavior
- [x] Schedule card open → Press back → Card closes (slides down)
- [x] Schedule card closed → Press back → App exits
- [x] Schedule closes with smooth animation (300ms)
- [x] Card state properly reset after back button close

### ✅ Priority Chain
- [x] Schedule + Modal open → Back closes modal first (schedule auto-closed)
- [x] Schedule + Sidebar open → Back closes schedule first
- [x] Schedule only → Back closes schedule, app stays open
- [x] Nothing open → Back exits app immediately

### ✅ Auto-Close Integration (Issue #56)
- [x] Schedule open → Edit form opened → Schedule auto-closes
- [x] Schedule open → Receipt viewer opened → Schedule auto-closes
- [x] Auto-close uses same 300ms animation
- [x] Back button closes newly opened overlay correctly

### ✅ Edge Cases
- [x] Rapidly pressing back button → Closes cleanly, no errors
- [x] Different equipment selected → Back still closes correctly
- [x] Schedule card opening animation + back → No conflicts

## User Scenarios

### Scenario 1: Quick Dismiss
```
1. User swipes equipment item
2. Schedule card opens (slides up)
3. User presses Android back button
4. Schedule card closes (slides down, 300ms)
5. User stays on Equipment page
```

### Scenario 2: Edit After Schedule View
```
1. User swipes equipment item
2. Schedule card opens
3. User taps "Edit" button
4. Schedule card auto-closes (300ms)
5. Edit form opens
6. User presses back button
7. Edit form closes
8. User stays on Equipment page
```

### Scenario 3: Multiple Back Presses
```
1. User swipes equipment item
2. Schedule card opens
3. User presses back button
4. Schedule card closes
5. User presses back button again
6. App exits
```

## Technical Details

### Platform Support
- **Android**: ✅ Hardware back button + gesture navigation
- **iOS**: ✅ Gracefully degrades (no back button on iOS)
- **Web**: ⚠️ No back button integration (browser back still works)

### Performance Considerations
- Listener registered only once in BackButtonHandler
- State updates trigger only when schedule card opens/closes
- No performance impact on other pages
- Clean listener removal on unmount

### Dependencies
- `@capacitor/app`: Native back button API
- `@capacitor/core`: Platform detection
- React Context API: State management
- React hooks: useEffect, useCallback, useState

## Migration Notes

### Breaking Changes
None - This is a new feature addition.

### Compatibility
- Compatible with existing modal stack system
- Compatible with sidebar navigation
- Compatible with FloatingScheduleCard animations
- No changes required to other pages

## Future Enhancements

### Possible Improvements
1. **Haptic Feedback**: Add vibration on back button close
2. **Animation Coordination**: Better handling during rapid back presses
3. **State History**: Breadcrumb trail of closed overlays
4. **Undo Close**: Restore schedule card after accidental close

### Known Limitations
1. Web platform doesn't support Capacitor back button API
2. Schedule card state is page-specific (only Equipment page)
3. No cross-page schedule card persistence

## Related Issues
- **#36**: Android Back Button Navigation Handler (base implementation)
- **#38**: Floating Schedule Card (base feature)
- **#47**: Redesign FloatingScheduleCard (swipe-only close)
- **#56**: Auto-Close FloatingScheduleCard on Overlays

## References
- [Capacitor App Plugin](https://capacitorjs.com/docs/apis/app)
- [Android Back Navigation](https://developer.android.com/guide/navigation/navigation-custom-back)
- [React Context API](https://react.dev/reference/react/useContext)
