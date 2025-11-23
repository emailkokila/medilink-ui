import { useAuth } from '../contexts/AuthContext'; // Adjust import path

interface User {
  username: string;
  accessToken: string;
  appUserId: number;
}

interface LoginPayload {
  username: string;
  accessToken: string;
  appUserId?: number;
}

interface AuthContextType {
  user: User | null;
  login: (payload: LoginPayload) => void; // must match exactly
  logout: () => void;
}
export const useApi = () => {
    const { user, logout } = useAuth();
    const token = user?.accessToken;
    const BASE_API_URL = 'https://localhost:7179/api/v1/'; 
    const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
        if (!token) {
            // Handle cases where there is no token (e.g., redirect to login)
            logout(); // Log out the user as they aren't authenticated
            throw new Error('No access token found. Logging out.');
        }

        const headers = {
            ...(options.headers || {}),
            'Authorization': `Bearer ${token}`, // Attach the token here
            'Content-Type': 'application/json',
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Handle token expiration/unauthorized access (e.g., silent refresh or logout)
                logout(); 
                throw new Error('Unauthorized or token expired. Please log in again.');
            }
            throw new Error('An API error occurred.');
        }

        return response;
    };

    return { authenticatedFetch };
};