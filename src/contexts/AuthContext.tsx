import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

 interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    refreshTokenExpireTime: string; 
    refreshTokenExpiryTime: string;
    appUserId: number;
}
interface RefreshTokenResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    refreshToken?: string;
    refreshTokenExpiryTime?: string; // Change to string for simplicity with fetch/JSON
}
interface UserData {
   appUserId: number;
    username: string; 
    accessToken: string; 
    refreshToken: string;
    refreshTokenExpiryTime: string; 
}

interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<UserData>;
    logout: () => void;
    refreshToken: () => Promise<string | null>; 
}
// responsible for managing the user's authentication state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize user state from SESSION storage on load
    const [user, setUser] = useState<UserData | null>(
        JSON.parse(sessionStorage.getItem('user') || 'null')
    );
    const [loading, setLoading] = useState(true);

     // Function to store the user object and token in SESSION storage
    const saveUserData = (userData: UserData) => {
        setUser(userData);
        // Use sessionStorage.setItem()
        sessionStorage.setItem('user', JSON.stringify(userData));
    };
    const logout = () => {
        sessionStorage.removeItem('user');
        setUser(null);
    };
    // function to call the Refresh Token API
    const refreshToken = async (): Promise<string | null> => {
        const REFRESH_URL = 'https://localhost:7179/api/v1/Auth/Refresh'; // Replace with your actual URL
        const currentUser = JSON.parse(sessionStorage.getItem('user') || 'null');

        if (!currentUser || !currentUser.refreshToken || !currentUser.appUserId) {
            console.log("Missing user ID or refresh token, logging out.");
            logout(); // Log out if no refresh token is available
            return null;
        }

        try {
            const response = await fetch(REFRESH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    UserId: currentUser.appUserId,
                    RefreshToken: currentUser.refreshToken,
                }),
            });

            if (!response.ok) {
                console.error("Refresh API returned non-OK status.");
                logout(); // Log out if refresh fails
                throw new Error('Failed to refresh token');
            }

            const apiResponse: RefreshTokenResponse  = await response.json(); 

            if (!apiResponse.success || !apiResponse.accessToken || !apiResponse.refreshToken || !apiResponse.refreshTokenExpiryTime) {
                console.error("Refresh API response indicated failure or missing data.");
                logout();
                return null;
            }

            const updatedUserData: UserData = {
                ...currentUser,
                accessToken: apiResponse.accessToken,
                refreshToken: apiResponse.refreshToken,
                refreshTokenExpiryTime: apiResponse.refreshTokenExpiryTime, 
            };
            saveUserData(updatedUserData);
            return updatedUserData.accessToken;

        } catch (error) {
            console.error("Token refresh error caught in fetch:", error);
            logout();
            return null;
        }
    };
    /* End updated refresh token */

    useEffect(() => {
        setLoading(false);
    }, []);

    const login = async (usercode: string, password: string): Promise<UserData> => {
        const LOGIN_URL = 'https://localhost:7179/api/v1/Auth/login';
        try {
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ UserCode: usercode, Password: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed.');
            }

            const apiResponse: AuthResponse = await response.json(); 

            const userData: UserData = {
                appUserId: apiResponse.appUserId,
                username: usercode,
                accessToken: apiResponse.accessToken,
                refreshToken: apiResponse.refreshToken,
                refreshTokenExpiryTime: apiResponse.refreshTokenExpiryTime, 
            };
            saveUserData(userData);
            return userData;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };
    
    const value = { user, loading, login, logout, refreshToken };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context; 
};