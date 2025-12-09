import { useAuth } from '../contexts/AuthContext';
// making actual requests to my backend services
//Manages authenticated fetching/interception
// this depends on useAuth to get the token, refreshtoken
export const useApi = () => {
    const { user, logout, refreshToken } = useAuth();
    const token = user?.accessToken;
    const BASE_API_URL = 'https://medilink-api-bfahgceqd2eyaxbg.uksouth-01.azurewebsites.net';//https://localhost:7179';

    const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
        let finalUrl = url;
        // Check if the provided URL is a relative path (doesn't start with http/https)
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = `${BASE_API_URL}/${url.startsWith('/') ? url.substring(1) : url}`;
        }
        // Function to create standard headers with the current token
        const getHeaders = (currentAccessToken: string) => ({
            ...options.headers,
            'Authorization': `Bearer ${currentAccessToken   }`,
            'Content-Type': 'application/json',
        });
        if (!token) {
            // Handle cases where there is no token (e.g., redirect to login)
            logout(); // Log out the user as they aren't authenticated
            throw new Error('No access token found. Logging out.');
        }
        // Apply initial headers
        let fetchOptions = {
            ...options,
            headers: getHeaders(token),
        };
        let response = await fetch(finalUrl, fetchOptions);
        
        if (response.status === 401) { 
            try{
                const newAccessToken = await refreshToken();

                if (newAccessToken) {
                    console.log("Token refreshed successfully, retrying request...");

                    // Update the fetch options with the new token
                    fetchOptions.headers = getHeaders(newAccessToken);

                    // Retry the original request with the new token
                    response = await fetch(finalUrl, fetchOptions);
                } else {
                    // Refresh failed (e.g., refresh token expired)
                    console.error("Token refresh failed. Logging out user.");
                    logout(); 
                    throw new Error('Session expired. Please log in again.');
                }
            }catch (error) {
            // Catches errors during the *refresh* process itself
            logout(); 
            throw new Error('An error occurred during token refresh.');
        }
                
        }
        // Handle other non-ok responses
        if (!response.ok) {
           if (response.status === 403) {
                 // Handle Forbidden errors specifically if needed
                 throw new Error('You do not have permission to access this resource.');
            }
            // For all other errors (400, 404, 500, etc.)
            throw new Error('An API error occurred.');
        }

        return response;
    };

    return { authenticatedFetch };
};