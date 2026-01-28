"use client";
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const UIContext = createContext();

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalStack, setModalStack] = useState([]);
  const [scheduleCardOpen, setScheduleCardOpen] = useState(false);
  const [closeScheduleCardHandler, setCloseScheduleCardHandler] = useState(null);
  const modalIdCounter = useRef(0);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const pushModal = useCallback((modalId, closeHandler) => {
    setModalStack(prev => {
      // Prevent duplicate modal IDs
      if (prev.some(item => item.id === modalId)) {
        console.warn(`Modal with ID ${modalId} is already in the stack`);
        return prev;
      }
      return [...prev, { id: modalId, close: closeHandler }];
    });
  }, []);

  const popModal = useCallback(() => {
    setModalStack(prev => {
      if (prev.length === 0) return prev;
      const topModal = prev[prev.length - 1];
      // Call the close handler for the top modal
      if (topModal.close) {
        topModal.close();
      }
      return prev.slice(0, -1);
    });
  }, []);

  const removeModal = useCallback((modalId) => {
    setModalStack(prev => {
      const filtered = prev.filter(item => item.id !== modalId);
      // Only return new array if something was actually removed
      if (filtered.length === prev.length) {
        return prev;
      }
      return filtered;
    });
  }, []);

  const generateModalId = useCallback((prefix) => {
    modalIdCounter.current += 1;
    return `${prefix}-${modalIdCounter.current}-${Date.now()}`;
  }, []);

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

  const clearScheduleCardState = useCallback(() => {
    setScheduleCardOpen(false);
    setCloseScheduleCardHandler(null);
  }, []);

  const hasOpenModals = modalStack.length > 0;

  return (
    <UIContext.Provider value={{
      sidebarOpen,
      openSidebar,
      closeSidebar,
      modalStack,
      pushModal,
      popModal,
      removeModal,
      generateModalId,
      hasOpenModals,
      scheduleCardOpen,
      openScheduleCard,
      closeScheduleCard,
      clearScheduleCardState
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
}
