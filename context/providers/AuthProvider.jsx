import * as SecureStore from "expo-secure-store";
import { useState, useEffect } from "react";
import useRefreshToken from "@/hooks/useRefreshToken";
import { setupInterceptors } from "@/http/xhr";
import { AuthContext } from "../AuthContext";

export const AuthProvider = ({ children }) => {
    const [auth, setAuthState] = useState({});
    const refresh = useRefreshToken();

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedAuth = await SecureStore.getItemAsync("user_details");
                if (storedAuth) {
                    setAuthState(JSON.parse(storedAuth));
                } else {
                    setAuthState({})
                }
            } catch (error) {
                console.error("Error loading auth data: ", error);
            }
        };

        loadAuthData();
    }, []);

    useEffect(() => {
        if (auth) {
            setupInterceptors(setAuthState, refresh);
        }
    }, [auth, refresh]);

    const setAuth = async (newAuth) => {
        const updatedAuth = { ...auth, ...newAuth };
        await SecureStore.setItemAsync("user_details", JSON.stringify(updatedAuth));
        setAuthState(updatedAuth);
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};