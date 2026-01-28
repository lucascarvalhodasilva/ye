import React, { useState, useRef, useEffect } from 'react';

/**
 * SwipeableListItem - A bi-directional swipeable list item component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content of the list item
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {Function} props.onViewReceipt - Callback when receipt button is clicked
 * @param {Function} props.onSchedule - Callback when schedule button is clicked (optional)
 * @param {boolean} props.hasReceipt - Whether the item has a receipt
 * @param {string} props.itemId - Unique identifier for the item
 * @param {string} props.className - Additional CSS classes for the container
 */
export default function SwipeableListItem({
  children,
  onEdit,
  onDelete,
  onViewReceipt,
  onSchedule,
  hasReceipt = false,
  itemId,
  className = ''
}) {
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left', 'right', or null
  const swipeState = useRef({ id: null, startX: 0, translateX: 0, dragging: false });
  
  // Calculate actions width based on number of buttons
  const numRightActions = 2; // edit + delete
  const numLeftActions = (hasReceipt ? 1 : 0) + (onSchedule ? 1 : 0); // receipt + optional schedule
  const actionsWidth = numRightActions * 48 + Math.max(0, numRightActions - 1) * 8; // 48px per button + 8px gap
  const leftActionsWidth = numLeftActions * 48 + Math.max(0, numLeftActions - 1) * 8; // Left side actions width
  
  // Store widths in ref for event handlers
  const widthsRef = useRef({ actionsWidth, leftActionsWidth, hasReceipt, onSchedule });
  useEffect(() => {
    widthsRef.current = { actionsWidth, leftActionsWidth, hasReceipt, onSchedule };
  }, [actionsWidth, leftActionsWidth, hasReceipt, onSchedule]);

  const handlePointerDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    swipeState.current = { id: itemId, startX: clientX, translateX: 0, dragging: true };
  };

  const handlePointerMove = (e) => {
    if (!swipeState.current.dragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let delta = clientX - swipeState.current.startX;
    
    const { actionsWidth: currentActionsWidth, leftActionsWidth: currentLeftActionsWidth, hasReceipt: currentHasReceipt, onSchedule: currentOnSchedule } = widthsRef.current;
    
    // Limit swipe range
    if (delta < 0) {
      // Swipe left - show actions
      const maxSwipe = -currentActionsWidth;
      if (delta < maxSwipe) delta = maxSwipe;
    } else {
      // Swipe right - show receipt/schedule (only if has receipt or schedule)
      if (!currentHasReceipt && !currentOnSchedule) {
        delta = 0;
      } else {
        const maxSwipe = currentLeftActionsWidth;
        if (delta > maxSwipe) delta = maxSwipe;
      }
    }
    
    swipeState.current.translateX = delta;
    const el = document.getElementById(`swipe-inner-${itemId}`);
    if (el) {
      el.style.transform = `translateX(${delta}px)`;
    }
  };

  const handlePointerUp = () => {
    if (!swipeState.current.dragging) return;
    
    const delta = swipeState.current.translateX;
    let newDirection = null;
    
    const { actionsWidth: currentActionsWidth, leftActionsWidth: currentLeftActionsWidth, hasReceipt: currentHasReceipt, onSchedule: currentOnSchedule } = widthsRef.current;
    
    // Determine if swipe threshold was met (50px)
    if (delta < -50) {
      // Swipe left - show actions
      newDirection = 'left';
    } else if (delta > 50 && (currentHasReceipt || currentOnSchedule)) {
      // Swipe right - show receipt/schedule
      newDirection = 'right';
    }
    
    setSwipeDirection(newDirection);
    
    // Animate to final position
    const el = document.getElementById(`swipe-inner-${itemId}`);
    if (el) {
      const targetX = newDirection === 'left' ? -currentActionsWidth : newDirection === 'right' ? currentLeftActionsWidth : 0;
      el.style.transform = `translateX(${targetX}px)`;
    }
    
    swipeState.current = { id: null, startX: 0, translateX: 0, dragging: false };
  };

  const closeSwipe = () => {
    setSwipeDirection(null);
    const el = document.getElementById(`swipe-inner-${itemId}`);
    if (el) {
      el.style.transform = 'translateX(0px)';
    }
  };

  const handleActionClick = (action, e) => {
    e.stopPropagation();
    closeSwipe();
    if (action === 'edit' && onEdit) onEdit();
    if (action === 'delete' && onDelete) onDelete();
    if (action === 'receipt' && onViewReceipt) onViewReceipt();
    if (action === 'schedule' && onSchedule) onSchedule();
  };

  useEffect(() => {
    const onPointerUp = () => handlePointerUp();
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, []);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onMouseMove={handlePointerMove}
      onTouchMove={handlePointerMove}
    >
      {/* Receipt and Schedule Buttons (Left side - revealed on swipe right) */}
      {(hasReceipt || onSchedule) && (
        <div 
          className={`absolute left-0 top-0 h-full flex items-center justify-start gap-2 pl-3 z-0 transition-opacity duration-200 ${
            swipeDirection === 'right' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: `${leftActionsWidth}px` }}
        >
          {hasReceipt && (
            <button
              onClick={(e) => handleActionClick('receipt', e)}
              className="w-10 h-10 bg-yellow-500/80 hover:bg-yellow-500/90 text-white transition-all flex items-center justify-center active:scale-95 rounded-xl"
              aria-label="Beleg ansehen"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
          {onSchedule && (
            <button
              onClick={(e) => handleActionClick('schedule', e)}
              className="w-10 h-10 bg-primary/80 hover:bg-primary/90 text-white transition-all flex items-center justify-center active:scale-95 rounded-xl"
              aria-label="Abschreibungsplan"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Main Content (slides on swipe) */}
      <div
        id={`swipe-inner-${itemId}`}
        className="relative transition-transform duration-200 bg-card z-10"
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
      >
        {children}
      </div>

      {/* Action Buttons (Right side - revealed on swipe left) */}
      <div 
        className={`absolute top-0 right-0 h-full flex items-center justify-end gap-2 pr-3 z-0 transition-opacity duration-200 ${
          swipeDirection === 'left' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: `${actionsWidth}px` }}
      >
        <button
          onClick={(e) => handleActionClick('edit', e)}
          className="w-10 h-10 bg-primary/80 hover:bg-primary/90 text-white transition-all flex items-center justify-center active:scale-95 rounded-xl"
          aria-label="Bearbeiten"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => handleActionClick('delete', e)}
          className="w-10 h-10 bg-red-500/80 hover:bg-red-500/90 text-white transition-all flex items-center justify-center active:scale-95 rounded-xl"
          aria-label="Löschen"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Backdrop (click to close) */}
      {swipeDirection && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={closeSwipe}
        />
      )}
    </div>
  );
}
