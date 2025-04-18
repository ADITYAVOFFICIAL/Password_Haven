// src/utils/hashing.ts
import CryptoJS from 'crypto-js';

/**
 * Calculates the MD5 hash of a given string.
 * @param text The string to hash.
 * @returns The MD5 hash as a lowercase hexadecimal string.
 */
export function calculateMD5(text: string): string {
  if (!text) {
    return ''; // Return empty string for empty input
  }
  return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex);
}

// You could add other hashing functions here if needed (SHA1, etc.)