export const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5002'
  : (process.env.REACT_APP_BACKEND_URL || 'https://oyeee-backend.onrender.com');

export async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const res = await fetch(`${BACKEND_URL}${url}`, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);

    const contentType = res.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      if (res.ok) return data;
      throw new Error(data.error || data.message || `Server Error: ${res.status}`);
    } else {
      if (res.ok) return await res.text();
      const text = await res.text(); // Get the HTML/Text error body
      throw new Error(`Server Error: ${res.status}. ${text.substring(0, 100)}`);
    }
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Void Connection Timed Out (15s). The signals are too weak.');
    throw err;
  }
}
