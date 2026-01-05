// Security Features

export interface SecuritySettings {
  biometricEnabled: boolean;
  autoLockMinutes: number;
  transactionLimit: number; // MMK
  pinRequired: boolean;
  pinHash?: string;
}

const SECURITY_STORAGE_KEY = 'kyatflow_security_settings';

export const securityStorage = {
  get: (): SecuritySettings => {
    try {
      const data = localStorage.getItem(SECURITY_STORAGE_KEY);
      if (!data) {
        return {
          biometricEnabled: false,
          autoLockMinutes: 5,
          transactionLimit: 1000000,
          pinRequired: false,
        };
      }
      return JSON.parse(data);
    } catch {
      return {
        biometricEnabled: false,
        autoLockMinutes: 5,
        transactionLimit: 1000000,
        pinRequired: false,
      };
    }
  },

  save: (settings: SecuritySettings): void => {
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(settings));
  },
};

// Simple PIN hash (in production, use proper hashing)
export function hashPin(pin: string): string {
  // This is a simple hash - in production, use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

export function verifyPin(pin: string, hash: string): boolean {
  return hashPin(pin) === hash;
}

// Check if transaction requires PIN
export function requiresPin(amount: number, settings: SecuritySettings): boolean {
  return settings.pinRequired && amount >= settings.transactionLimit;
}

// Biometric authentication (mock - in production, use WebAuthn API)
export async function authenticateBiometric(): Promise<boolean> {
  // Mock implementation - in production, use WebAuthn or device-specific APIs
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate biometric check
      resolve(true);
    }, 500);
  });
}

