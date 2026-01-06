/**
 * =============================================================================
 * USE DISCLAIMER - Composable for Disclaimer Modal State Management
 * =============================================================================
 * 
 * Manages the disclaimer acceptance state, localStorage persistence, and
 * centralized scroll lock. Scroll is locked when status is PENDING or DECLINED
 * to prevent users from bypassing the disclaimer or scrolling past farewell.
 */

import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue';
import { useScrollLock } from '@vueuse/core';

type DisclaimerStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

interface UseDisclaimerReturn {
  disclaimerStatus: Ref<DisclaimerStatus>;
  handleAcceptDisclaimer: () => void;
  handleDeclineDisclaimer: () => void;
  handleReturnToDisclaimer: () => void;
}

const DISCLAIMER_STORAGE_KEY = 'neurofight_disclaimer_accepted';

export const useDisclaimer = (): UseDisclaimerReturn => {
  const disclaimerStatus = ref<DisclaimerStatus>('PENDING');

  // Store body ref directly (not computed) to avoid timing issues with useScrollLock
  const bodyRef = ref<HTMLElement | null>(null);

  // Initialize body ref only on client
  if (process.client) {
    bodyRef.value = document.body;
  }

  // Centralized scroll lock - uses direct ref to body element
  const scrollLock = useScrollLock(bodyRef);

  // Function to update scroll lock based on status
  const updateScrollLock = (status: DisclaimerStatus) => {
    if (!process.client) return;

    // Ensure body ref is set
    if (!bodyRef.value) {
      bodyRef.value = document.body;
    }

    const shouldLock = status !== 'ACCEPTED';
    scrollLock.value = shouldLock;

    // Explicit fallback: directly set body overflow as safety net
    // This ensures scroll is properly unlocked even if useScrollLock has issues
    if (!shouldLock && document.body) {
      // Use nextTick-like delay to ensure useScrollLock has time to clean up
      requestAnimationFrame(() => {
        if (disclaimerStatus.value === 'ACCEPTED') {
          // Only clear if we're still in ACCEPTED state
          document.body.style.overflow = '';
        }
      });
    }
  };

  // Watch status and update scroll lock accordingly
  watch(disclaimerStatus, updateScrollLock, { immediate: true });

  onMounted(() => {
    if (process.client) {
      // Ensure body ref is set on mount
      bodyRef.value = document.body;

      const accepted = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
      if (accepted === 'true') {
        disclaimerStatus.value = 'ACCEPTED';
        // Explicitly unlock on mount if already accepted
        scrollLock.value = false;
        document.body.style.overflow = '';
      } else {
        // Lock on mount if not accepted
        scrollLock.value = true;
      }
    }
  });

  // Safety: ensure scroll is unlocked when composable is destroyed
  onUnmounted(() => {
    if (process.client) {
      scrollLock.value = false;
      // Explicit cleanup
      if (document.body) {
        document.body.style.overflow = '';
      }
    }
  });

  const handleAcceptDisclaimer = () => {
    if (process.client) {
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    }
    disclaimerStatus.value = 'ACCEPTED';
    // Watcher handles scroll unlock
  };

  const handleDeclineDisclaimer = () => {
    disclaimerStatus.value = 'DECLINED';
    // Watcher handles scroll lock
  };

  const handleReturnToDisclaimer = () => {
    disclaimerStatus.value = 'PENDING';
    // Watcher handles scroll lock
  };

  return {
    disclaimerStatus,
    handleAcceptDisclaimer,
    handleDeclineDisclaimer,
    handleReturnToDisclaimer
  };
};
