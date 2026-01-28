"use client";
import { useBackButton } from '@/hooks/useBackButton';
import { useUIContext } from '@/context/UIContext';

/**
 * Component to handle Android back button navigation
 * Must be used within UIProvider
 */
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

  // This component doesn't render anything
  return null;
}
