/**
 * =============================================================================
 * USE DISCLAIMER - Composable for Disclaimer Modal State Management
 * =============================================================================
 * 
 * Manages the disclaimer acceptance state and localStorage persistence.
 */

import { ref, onMounted, type Ref } from 'vue';

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

  onMounted(() => {
    if (process.client) {
      const accepted = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
      if (accepted === 'true') {
        disclaimerStatus.value = 'ACCEPTED';
      }
    }
  });

  const handleAcceptDisclaimer = () => {
    if (process.client) {
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    }
    disclaimerStatus.value = 'ACCEPTED';
  };

  const handleDeclineDisclaimer = () => {
    disclaimerStatus.value = 'DECLINED';
  };

  const handleReturnToDisclaimer = () => {
    disclaimerStatus.value = 'PENDING';
  };

  return {
    disclaimerStatus,
    handleAcceptDisclaimer,
    handleDeclineDisclaimer,
    handleReturnToDisclaimer
  };
};
