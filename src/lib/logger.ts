// Production-ready logger utility
// Only logs in development, silent in production

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but format them properly
    if (isDevelopment) {
      console.error('[ERROR]', ...args);
    } else {
      // In production, you might want to send to error tracking service
      // Example: Sentry, LogRocket, etc.
      console.error('[ERROR]', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },
};

