/**
 * =============================================================================
 * TOAST NOTIFICATIONS - User Feedback System
 * =============================================================================
 * 
 * This module provides a toast notification system for displaying
 * temporary messages to the user (success, error, info messages).
 * 
 * FEATURES:
 * - Three message types: success, error, info
 * - Auto-dismiss after 3 seconds
 * - Slide-in/slide-out animations
 * - Stacked display for multiple toasts
 * - Max 3 toasts visible at once
 * 
 * USAGE:
 * ```tsx
 * // In your component:
 * const { toasts, addToast, removeToast } = useToast();
 * 
 * // Show a toast:
 * addToast('success', 'Weights exported!');
 * 
 * // Render toasts:
 * <Toast toasts={toasts} removeToast={removeToast} />
 * ```
 * 
 * =============================================================================
 */

import React, { useEffect, useState } from 'react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * ToastMessage - Represents a single toast notification
 */
export interface ToastMessage {
  id: string;                           // Unique ID for React key
  type: 'success' | 'error' | 'info';   // Message type (affects color/icon)
  message: string;                       // Text content
}

/**
 * Props for the Toast container component
 */
interface ToastProps {
  toasts: ToastMessage[];            // Array of active toasts
  removeToast: (id: string) => void; // Callback to remove a toast
}

// =============================================================================
// TOAST CONTAINER COMPONENT
// =============================================================================

/**
 * Toast - Container for displaying toast notifications
 * 
 * Positioned fixed in the bottom-right corner.
 * Toasts stack vertically with the newest on bottom.
 */
const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// =============================================================================
// TOAST ITEM COMPONENT
// =============================================================================

/**
 * ToastItem - Individual toast notification
 * 
 * Handles its own animation state and auto-dismiss timer.
 * 
 * ANIMATION FLOW:
 * 1. Mounts hidden (off-screen right)
 * 2. Animates in (slide left + fade in)
 * 3. Waits 3 seconds
 * 4. Animates out (slide right + fade out)
 * 5. Calls onRemove after animation completes
 */
const ToastItem: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  // Animation states
  const [isVisible, setIsVisible] = useState(false);   // Controls slide-in
  const [isLeaving, setIsLeaving] = useState(false);   // Controls slide-out

  useEffect(() => {
    // Trigger slide-in animation on next frame
    requestAnimationFrame(() => setIsVisible(true));

    // Set auto-dismiss timer (3 seconds)
    const timer = setTimeout(() => {
      setIsLeaving(true);  // Start exit animation
      setTimeout(onRemove, 300);  // Remove after animation (300ms)
    }, 3000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  // === STYLING BY TYPE ===
  // Each type has different background/border colors
  const bgColor = {
    success: 'bg-green-600 border-green-400',
    error: 'bg-red-600 border-red-400',
    info: 'bg-blue-600 border-blue-400'
  }[toast.type];

  // === ICONS BY TYPE ===
  // Each type has a different icon
  const icon = {
    success: (
      // Checkmark icon
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      // X icon
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      // Info circle icon
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }[toast.type];

  return (
    <div
      className={`
        ${bgColor} 
        px-4 py-3 rounded-lg shadow-lg border
        text-white font-medium text-sm
        flex items-center gap-3
        pointer-events-auto
        transform transition-all duration-300
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {icon}
      <span>{toast.message}</span>

      {/* Manual dismiss button */}
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(onRemove, 300);
        }}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// =============================================================================
// USE TOAST HOOK
// =============================================================================

/**
 * useToast - Custom hook for managing toast notifications
 * 
 * Provides state and functions for adding/removing toasts.
 * Automatically limits to 3 visible toasts (removes oldest).
 * 
 * USAGE:
 * ```tsx
 * const { toasts, addToast, removeToast } = useToast();
 * 
 * addToast('success', 'Operation completed!');
 * addToast('error', 'Something went wrong');
 * addToast('info', 'Did you know...');
 * ```
 * 
 * @returns Object with toasts array and management functions
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * Adds a new toast notification
   * 
   * @param type - 'success', 'error', or 'info'
   * @param message - Text to display
   */
  const addToast = (type: ToastMessage['type'], message: string) => {
    // Generate unique ID using timestamp + random string
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    setToasts(prev => {
      // Special handling for match results: replace instead of stack
      // This prevents rapid stacking of "You Win!" / "AI Wins!" messages
      const isMatchResult = message === 'You Win!' || message === 'AI Wins!';
      if (isMatchResult) {
        const filtered = prev.filter(t => t.message !== 'You Win!' && t.message !== 'AI Wins!');
        return [...filtered.slice(-2), { id, type, message }];
      }

      // Keep only the last 3 toasts (remove oldest if over limit)
      return [...prev.slice(-2), { id, type, message }];
    });
  };

  /**
   * Removes a toast by its ID
   * 
   * @param id - The toast ID to remove
   */
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export default Toast;
