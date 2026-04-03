/**
 * Frontend Content Detection Utility
 * Communicates with the backend /api/detect endpoint
 */

import { BACKEND_URL, safeFetch } from '../config';
export const detectContent = async (message) => {
  if (!message || message.trim().length === 0) {
    return { isSafe: true, issues: [] };
  }

  try {
    const data = await safeFetch('/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    return data;
  } catch (error) {
    console.error('Content Detection Failed:', error);
    // On failure, we'll fail-safe and allow the message but log the error
    return { isSafe: true, issues: [], error: error.message };
  }
};
