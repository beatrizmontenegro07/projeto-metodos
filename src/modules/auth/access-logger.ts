/** Business logging port: receives no credentials or personal data beyond the user id. */
export interface AccessLogger {
  recordSignIn(userId: number): void;
}
