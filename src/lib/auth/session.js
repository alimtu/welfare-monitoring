/**
 * Client-side mock authentication for the welfare app (no backend).
 *
 * The user enters a phone number then an OTP; the OTP is hardcoded to MOCK_OTP.
 * On success we store a flag in localStorage and gate routes against it in
 * LayoutShell. No web service is involved.
 */
export const AUTH_KEY = 'auth_token';
export const MOCK_OTP = '8080';

/** Mark the session as authenticated (stores the phone as the token). */
export function setAuthed(phone) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, phone || '1');
  }
}

/** Whether the user is currently authenticated. */
export function isAuthed() {
  return typeof window !== 'undefined' && !!localStorage.getItem(AUTH_KEY);
}

/** Clear the session (logout). */
export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}
