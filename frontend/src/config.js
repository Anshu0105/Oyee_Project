export const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5002'
  : (process.env.REACT_APP_BACKEND_URL || 'https://oyeee-backend.onrender.com');

export async function safeFetch(url, options = {}) {
  const res = await fetch(`${BACKEND_URL}${url}`, options);
  const contentType = res.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await res.json();
    if (res.ok) return data;
    throw new Error(data.error || data.message || `Server Error: ${res.status}`);
  } else {
    if (res.ok) return await res.text();
    throw new Error(`Server Error: ${res.status}. Expected JSON, got ${contentType}`);
  }
}
