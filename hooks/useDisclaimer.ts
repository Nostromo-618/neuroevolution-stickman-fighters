/**
 * =============================================================================
 * USE DISCLAIMER - Hook for Disclaimer Modal State Management
 * =============================================================================
 * 
 * Manages the disclaimer acceptance state and localStorage persistence.
 */

import { useState, useEffect } from 'react';

type DisclaimerStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

interface UseDisclaimerReturn {
  disclaimerStatus: DisclaimerStatus;
  handleAcceptDisclaimer: () => void;
  handleDeclineDisclaimer: () => void;
  handleReturnToDisclaimer: () => void;
}

const DISCLAIMER_STORAGE_KEY = 'neurofight_disclaimer_accepted';

export const useDisclaimer = (): UseDisclaimerReturn => {
  const [disclaimerStatus, setDisclaimerStatus] = useState<DisclaimerStatus>('PENDING');

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
    if (accepted === 'true') {
      setDisclaimerStatus('ACCEPTED');
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
    setDisclaimerStatus('ACCEPTED');
  };

  const handleDeclineDisclaimer = () => {
    setDisclaimerStatus('DECLINED');
  };

  const handleReturnToDisclaimer = () => {
    setDisclaimerStatus('PENDING');
  };

  return {
    disclaimerStatus,
    handleAcceptDisclaimer,
    handleDeclineDisclaimer,
    handleReturnToDisclaimer
  };
};

