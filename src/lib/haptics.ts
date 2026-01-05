/**
 * Haptic feedback utility for mobile devices
 * Provides tactile feedback when buttons are pressed
 */

export const haptics = {
  /**
   * Light impact feedback (for subtle interactions)
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium impact feedback (for standard button presses)
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy impact feedback (for important actions)
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  },

  /**
   * Success feedback pattern
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 10]);
    }
  },

  /**
   * Error feedback pattern
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([20, 50, 20, 50, 20]);
    }
  },

  /**
   * Selection feedback (for toggles, switches)
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },
};

