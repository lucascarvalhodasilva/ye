"use client";
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle Android back button with priority chain:
 * 1. Close FloatingScheduleCard (if open)
 * 2. Close open modals/dialogs (LIFO stack)
 * 3. Close sidebar
 * 4. Exit app
 * 
 * @param {Object} options
 * @param {boolean} options.scheduleCardOpen - Whether FloatingScheduleCard is open
 * @param {Function} options.closeScheduleCard - Function to close the schedule card
 * @param {boolean} options.hasOpenModals - Whether there are open modals
 * @param {Function} options.closeTopModal - Function to close the top modal
 * @param {boolean} options.sidebarOpen - Whether sidebar is open
 * @param {Function} options.closeSidebar - Function to close sidebar
 */
export function useBackButton({ 
  scheduleCardOpen, 
  closeScheduleCard, 
  hasOpenModals, 
  closeTopModal, 
  sidebarOpen, 
  closeSidebar 
}) {
  useEffect(() => {
    // Only register handler on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      return;
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
