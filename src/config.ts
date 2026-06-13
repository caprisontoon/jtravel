/**
 * Backend connection.
 *
 * - Leave API_BASE_URL empty ('') to run on built-in MOCK data (always Tokyo sample).
 * - Set it to your analysis server to get REAL YouTube analysis.
 *
 * ⚠️ On a physical iPhone (Expo Go), `localhost` points at the PHONE, not your
 * laptop. Use your laptop's LAN IP — the same address Expo prints, e.g.
 * exp://192.168.0.3:8081  → here put  http://192.168.0.3:8787
 *
 * (8787 is the server port; 8081 is Expo's. They are different.)
 */
export const API_BASE_URL = '';

export const USE_MOCK = API_BASE_URL.trim() === '';

export const API_BASE_URL = 'http://192.168.0.3:8787';
