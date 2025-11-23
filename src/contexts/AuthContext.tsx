import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

 interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    // Both expiry times are in the response; we only need one
    refreshTokenExpireTime: string; 
    refreshTokenExpiryTime: string;
    appUserId: number;
}
// Define the shape of the user data returned by your API
interface UserData {
   appUserId: number;
    username: string; // Assuming you get this from decoding the token or a separate call
    accessToken: string; 
    refreshToken: string;
    refreshTokenExpiryTime: string; // Store the expiry time as a string
}
// Define the shape of the AuthContext value
interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<UserData>;
    logout: () => void;
}
// Initialize the context with the correct type (or undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//Create an Authentication Context, Add type for the children prop
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize user state from storage on load
    //Add type for user state
    const [user, setUser] = useState<UserData | null>(JSON.parse(localStorage.getItem('user') || 'null'));
    const [loading, setLoading] = useState(true);

     // Function to store the user object and token in local storage
    // [CHANGE 6] Add type for the saveUserData parameter
    const saveUserData = (userData: UserData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Check auth status on app load
    useEffect(() => {
        setLoading(false);
    }, []);

    // [CHANGE 7] Add types for login parameters and return value
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

              // Explicitly type the result from the API call
            const apiResponse: AuthResponse = await response.json(); 

            // Map the AuthResponse to our internal UserData structure
            const userData: UserData = {
                appUserId: apiResponse.appUserId,
                // NOTE: 'username' is not in the response provided. 
                // We typically use the input usercode or decode the JWT token 
                // to populate this field. For this example, we use the input `usercode`.
                username: usercode,
                accessToken: apiResponse.accessToken,
                refreshToken: apiResponse.refreshToken,
                // Store the primary expiry time field
                refreshTokenExpiryTime: apiResponse.refreshTokenExpiryTime, 
            };
            saveUserData(userData);
            return userData;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };
    
    // Ensure the value provided matches the AuthContextType interface
    const value = { user, loading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext safely
export const useAuth = () => {
    // Add a check to ensure context is defined before returning it
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context; // TypeScript now knows this is of type AuthContextType
};