/**
 * Application Configuration
 * Centralized point for environment-aware API endpoints.
 */

// Deployment Tip: On Vercel/Netlify, add REACT_APP_BACKEND_URL to your environment variables
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

// Helper for socket connection
export const SOCKET_URL = BACKEND_URL;
