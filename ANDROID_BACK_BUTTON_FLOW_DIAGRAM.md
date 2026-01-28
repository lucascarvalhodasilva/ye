# FloatingScheduleCard Back Button Flow Diagram

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           User Actions                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
              Swipe Item    Press Back    Open Form/Receipt
                    │             │             │
                    ▼             │             │
┌──────────────────────────┐     │             │
│    EquipmentList         │     │             │
│  setScheduleOpen(true)   │     │             │
└──────────────────────────┘     │             │
            │                     │             │
            │  useEffect          │             │
            ▼                     │             │
┌──────────────────────────┐     │             │
│       UIContext          │     │             │
│  openScheduleCard()      │     │             │
│  scheduleCardOpen=true   │     │             │
└──────────────────────────┘     │             │
            │                     │             │
            └─────────────────────┤             │
                                  │             │
                            ▼─────▼             │
                    ┌──────────────────────┐    │
                    │  BackButtonHandler   │    │
                    │   scheduleCardOpen   │    │
                    │   = true            │    │
                    └──────────────────────┘    │
                                  │             │
                      Press Back  │             │
                                  ▼             │
                    ┌──────────────────────┐    │
                    │   useBackButton      │    │
                    │  Priority 1: Close   │    │
                    │  Schedule Card       │    │
                    └──────────────────────┘    │
                                  │             │
                                  ▼             │
                    ┌──────────────────────┐    │
                    │    UIContext         │    │
                    │ closeScheduleCard()  │    │
                    └──────────────────────┘    │
                                  │             │
                                  ▼             │
                    ┌──────────────────────┐    │
                    │   EquipmentList      │    │
                    │ setScheduleOpen(     │    │
                    │     false)           │◄───┘
                    └──────────────────────┘  Auto-close
                                  │          on overlay
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │ FloatingScheduleCard │
                    │   Slide down (300ms) │
                    └──────────────────────┘
```

## Priority Chain Flow

```
                    Android Back Button Pressed
                              │
                              ▼
            ┌─────────────────────────────────┐
            │   Is Schedule Card Open?        │
            │   (scheduleCardOpen === true)   │
            └─────────────────────────────────┘
                     │                  │
                   YES                 NO
                     │                  │
                     ▼                  ▼
        ┌────────────────────┐    ┌─────────────────────┐
        │ Close Schedule Card│    │ Has Open Modals?    │
        │   (Priority 1)     │    │ (modalStack.length) │
        └────────────────────┘    └─────────────────────┘
                                       │              │
                                     YES             NO
                                       │              │
                                       ▼              ▼
                            ┌───────────────┐   ┌───────────────┐
                            │ Close Modal   │   │ Sidebar Open? │
                            │ (Priority 2)  │   └───────────────┘
                            └───────────────┘        │        │
                                                   YES       NO
                                                     │        │
                                                     ▼        ▼
                                          ┌──────────────┐ ┌─────────┐
                                          │Close Sidebar │ │Exit App │
                                          │(Priority 3)  │ │  (P4)   │
                                          └──────────────┘ └─────────┘
```

## Integration with Issue #56 (Auto-Close)

```
Schedule Card Open
         │
         │  User clicks "Edit" or "View Receipt"
         │
         ▼
┌─────────────────────┐
│   onEdit() or       │
│   onViewReceipt()   │
└─────────────────────┘
         │
         │  Check: if (scheduleOpen)
         │
         ▼
┌─────────────────────┐
│ Auto-close schedule │
│  setScheduleOpen(   │
│      false)         │
│  setTimeout(300ms)  │
└─────────────────────┘
         │
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌──────────────┐   ┌──────────────────┐
│ Open Form    │   │ Open Receipt     │
│  Modal       │   │  Viewer          │
└──────────────┘   └──────────────────┘
         │                  │
         │                  │
         │  Press Back      │
         │                  │
         ▼                  ▼
┌──────────────┐   ┌──────────────────┐
│ Close Modal  │   │ Close Viewer     │
│ (Priority 2) │   │ (Priority 2)     │
└──────────────┘   └──────────────────┘
         │                  │
         │                  │
         │  Press Back      │
         │                  │
         └──────┬───────────┘
                │
                ▼
         ┌─────────────┐
         │  Exit App   │
         │ (Priority 4)│
         └─────────────┘
```

## Component Interaction

```
┌────────────────────────────────────────────────────────────┐
│                      LayoutClient                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    UIProvider                        │  │
│  │                                                      │  │
│  │  State:                                              │  │
│  │  • scheduleCardOpen: false                           │  │
│  │  • closeScheduleCardHandler: null                    │  │
│  │  • modalStack: []                                    │  │
│  │  • sidebarOpen: false                                │  │
│  │                                                      │  │
│  │  Methods:                                            │  │
│  │  • openScheduleCard(handler)                         │  │
│  │  • closeScheduleCard()                               │  │
│  │  • pushModal(id, handler)                            │  │
│  │  • popModal()                                        │  │
│  │  • openSidebar()                                     │  │
│  │  • closeSidebar()                                    │  │
│  │                                                      │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │       BackButtonHandler                     │    │  │
│  │  │                                             │    │  │
│  │  │  useBackButton({                            │    │  │
│  │  │    scheduleCardOpen,                        │    │  │
│  │  │    closeScheduleCard,                       │    │  │
│  │  │    hasOpenModals,                           │    │  │
│  │  │    closeTopModal: popModal,                 │    │  │
│  │  │    sidebarOpen,                             │    │  │
│  │  │    closeSidebar                             │    │  │
│  │  │  })                                         │    │  │
│  │  │                                             │    │  │
│  │  │  ┌────────────────────────────────┐         │    │  │
│  │  │  │   Capacitor.App.addListener   │         │    │  │
│  │  │  │      ('backButton', ...)      │         │    │  │
│  │  │  └────────────────────────────────┘         │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │                                                      │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │         Equipment Page                      │    │  │
│  │  │                                             │    │  │
│  │  │  ┌─────────────────────────────────────┐    │    │  │
│  │  │  │      EquipmentList                  │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  Local State:                       │    │    │  │
│  │  │  │  • scheduleOpen: false              │    │    │  │
│  │  │  │  • selectedEquipment: null          │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  useEffect(() => {                  │    │    │  │
│  │  │  │    if (scheduleOpen) {              │    │    │  │
│  │  │  │      openScheduleCard(() => {       │    │    │  │
│  │  │  │        setScheduleOpen(false)       │    │    │  │
│  │  │  │      })                             │    │    │  │
│  │  │  │    } else {                         │    │    │  │
│  │  │  │      contextCloseScheduleCard()     │    │    │  │
│  │  │  │    }                                │    │    │  │
│  │  │  │  }, [scheduleOpen])                 │    │    │  │
│  │  │  │                                     │    │    │  │
│  │  │  │  ┌──────────────────────────────┐   │    │    │  │
│  │  │  │  │  FloatingScheduleCard        │   │    │    │  │
│  │  │  │  │  • open={scheduleOpen}       │   │    │    │  │
│  │  │  │  │  • onClose={handleClose}     │   │    │    │  │
│  │  │  │  │  • Escape key handler        │   │    │    │  │
│  │  │  │  │  • Swipe handler             │   │    │    │  │
│  │  │  │  └──────────────────────────────┘   │    │    │  │
│  │  │  └─────────────────────────────────────┘    │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Event Sequence Timeline

```
Time │ Event                           │ scheduleOpen │ scheduleCardOpen
─────┼─────────────────────────────────┼──────────────┼─────────────────
  0  │ User swipes equipment item      │    false     │     false
  1  │ setScheduleOpen(true)           │    true      │     false
  2  │ useEffect triggers              │    true      │     false
  3  │ openScheduleCard() called       │    true      │     true
  4  │ Schedule card slides up         │    true      │     true
─────┼─────────────────────────────────┼──────────────┼─────────────────
 10  │ User presses back button        │    true      │     true
 11  │ useBackButton checks priority   │    true      │     true
 12  │ closeScheduleCard() called      │    true      │     true
 13  │ Handler executes:               │              │
     │   setScheduleOpen(false)        │    false     │     true
 14  │ useEffect triggers              │    false     │     true
 15  │ contextCloseScheduleCard()      │    false     │     false
 16  │ Schedule card slides down       │    false     │     false
─────┴─────────────────────────────────┴──────────────┴─────────────────
```

## Legend

```
┌──────┐  Component/Module
│      │
└──────┘

┌──────┐  Decision Point
│      │?
└──────┘

    │     Flow Direction
    ▼

═══════   State Change

───────   Method Call
```
