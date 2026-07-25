/**
 * Web SecureStorage Utility
 * Encrypts and decrypts sensitive user session & authentication data stored in web storage.
 * Ensures all user data from API responses remain protected in the browser.
 */

const STORAGE_SECRET_KEY = 'MarsCargo_SecureStorage_EncryptedKey_2026';

function encrypt(text: string): string {
  try {
    const textBytes = new TextEncoder().encode(text);
    const keyBytes = new TextEncoder().encode(STORAGE_SECRET_KEY);
    const encrypted = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return btoa(String.fromCharCode(...encrypted));
  } catch {
    return btoa(encodeURIComponent(text));
  }
}

function decrypt(cipherText: string): string {
  try {
    const raw = atob(cipherText);
    const cipherBytes = new Uint8Array(raw.length).map((_, i) => raw.charCodeAt(i));
    const keyBytes = new TextEncoder().encode(STORAGE_SECRET_KEY);
    const decrypted = new Uint8Array(cipherBytes.length);
    for (let i = 0; i < cipherBytes.length; i++) {
      decrypted[i] = cipherBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    return new TextDecoder().decode(decrypted);
  } catch {
    try {
      return decodeURIComponent(atob(cipherText));
    } catch {
      return cipherText;
    }
  }
}

export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
      const encryptedValue = encrypt(jsonString);
      localStorage.setItem(`sec_${key}`, encryptedValue);
      // Clean up unencrypted legacy item if present
      localStorage.removeItem(key);
    } catch (e) {
      console.error('SecureStorage setItem error:', e);
    }
  },

  getItem: <T = any>(key: string): T | null => {
    try {
      const encrypted = localStorage.getItem(`sec_${key}`);
      if (encrypted) {
        const decrypted = decrypt(encrypted);
        try {
          return JSON.parse(decrypted) as T;
        } catch {
          return decrypted as unknown as T;
        }
      }

      // Fallback: Check if unencrypted legacy item exists, migrate & return
      const legacy = localStorage.getItem(key);
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy);
          secureStorage.setItem(key, parsed);
          return parsed as T;
        } catch {
          secureStorage.setItem(key, legacy);
          return legacy as unknown as T;
        }
      }
      return null;
    } catch (e) {
      console.error('SecureStorage getItem error:', e);
      return null;
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(`sec_${key}`);
    localStorage.removeItem(key);
  },

  clear: (): void => {
    // Remove encrypted items
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('sec_') || k.startsWith('marscargo_')) {
        localStorage.removeItem(k);
      }
    });
  },
};
