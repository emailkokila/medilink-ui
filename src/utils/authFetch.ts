export function authFetch(url: string, options: RequestInit = {}) {
  // Get the access token from localStorage
  const token = localStorage.getItem("accessToken");

  // Call fetch with the Authorization header
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": `Bearer ${token}`, // Attach token
      "Content-Type": "application/json"
    }
  });
}
//It automatically retrieves the access token.
//It attaches it to the request headers as Bearer <token>.