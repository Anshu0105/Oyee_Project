/**
 * Utility function to validate chat messages against the backend content detector
 * @param {string} message - The message written by the user
 * @returns {Promise<{ isSafe: boolean, issues: string[] }>} 
 */
export const detectContent = async (message) => {
  try {
    const response = await fetch('http://localhost:5002/api/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to validate content:', error);
    // In case of a network error, we default to safe to not break the app for the user,
    // though this could be adjusted based on strictness requirements.
    return { isSafe: true, issues: [] };
  }
};
