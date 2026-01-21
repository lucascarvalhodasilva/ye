/**
 * useSwipeActions Hook
 * Reusable swipe-to-reveal actions logic
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { SWIPE_CONFIG } from '@/constants';

/**
 * Custom hook for swipe-to-reveal actions
 * @param {number} actionsWidth - Width of the actions panel (default: 120)
 * @returns {Object} Swipe state and handlers
 */
export function useSwipeActions(actionsWidth = SWIPE_CONFIG.ACTIONS_WIDTH) {
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const swipeState = useRef({ 
    id: null, 
    startX: 0, 
    translateX: 0, 
    dragging: false 
  });

  const handlePointerDown = useCallback((e, id) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    swipeState.current = { 
      id, 
      startX: clientX, 
      translateX: 0, 
      dragging: true 
    };
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!swipeState.current.dragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let delta = clientX - swipeState.current.startX;
    
    // Only allow left swipe
    if (delta > 0) delta = 0;
    
    // Limit swipe distance
    const maxSwipe = -actionsWidth;
    if (delta < maxSwipe) delta = maxSwipe;
    
    swipeState.current.translateX = delta;
    
    const el = document.getElementById(`swipe-inner-${swipeState.current.id}`);
    if (el) {
      el.style.transform = `translateX(${delta}px)`;
    }
  }, [actionsWidth]);

  const handlePointerUp = useCallback(() => {
    if (!swipeState.current.dragging) return;
    
    const shouldOpen = swipeState.current.translateX < -(actionsWidth * SWIPE_CONFIG.TRIGGER_THRESHOLD);
    const id = swipeState.current.id;
    
    setOpenSwipeId(shouldOpen ? id : null);
    
    const el = document.getElementById(`swipe-inner-${id}`);
    if (el) {
      el.style.transform = `translateX(${shouldOpen ? -actionsWidth : 0}px)`;
    }
    
    swipeState.current = { 
      id: null, 
      startX: 0, 
      translateX: 0, 
      dragging: false 
    };
  }, [actionsWidth]);

  // Close swipe on click outside
  const closeSwipe = useCallback(() => {
    if (openSwipeId) {
      const el = document.getElementById(`swipe-inner-${openSwipeId}`);
      if (el) {
        el.style.transform = 'translateX(0)';
      }
      setOpenSwipeId(null);
    }
  }, [openSwipeId]);

  // Global event listeners for pointer up
  useEffect(() => {
    const onPointerUp = () => handlePointerUp();
    
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    
    return () => {
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [handlePointerUp]);

  return {
    openSwipeId,
    setOpenSwipeId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    closeSwipe,
    actionsWidth
  };
}

export default useSwipeActions;
