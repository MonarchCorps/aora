import * as SecureStore from "expo-secure-store";
import { useState, useEffect } from "react";
import { createContext } from "react";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuthState] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedAuth = await SecureStore.getItemAsync("user_details");
                if (storedAuth) {
                    setAuthState(JSON.parse(storedAuth));
                } else {
                    setAuthState({});
                }
            } catch (error) {
                console.error("Error loading auth data: ", error);
            } finally {
                setLoading(false);
            }
        };

        loadAuthData();
    }, []);


    const setAuth = async (newAuth) => {
        const updatedAuth = { ...auth, ...newAuth };
        await SecureStore.setItemAsync("user_details", JSON.stringify(updatedAuth));
        setAuthState(updatedAuth);
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
