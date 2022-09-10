/**
 * Container for a securely generated token with its hashed representation.
 */
export interface RandomTokenContainer {
  /**
   * Token in plaintext
   */
  token: string;

  /**
   * Hashed token
   */
  tokenHash: string;
}
