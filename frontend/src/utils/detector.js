/**
 * Frontend Content Detection Utility
 * Communicates with the backend /api/detect endpoint
 */

const BACKEND_URL = window.location.hostname === 'localhost' 
  ? (process.env.REACT_APP_BACKEND_URL || "http://localhost:5002")
  : 'https://oyeee-backend.onrender.com';

export const detectContent = async (message) => {
  if (!message || message.trim().length === 0) {
    return { isSafe: true, issues: [] };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Content Detection Failed:', error);
    // On failure, we'll fail-safe and allow the message but log the error
    return { isSafe: true, issues: [], error: error.message };
  }
};
