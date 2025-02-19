import * as SecureStore from "expo-secure-store";

export const getRefreshToken = async () => {
    try {
        const storedData = await SecureStore.getItemAsync("aora_refreshToken");
        return storedData ? JSON.parse(storedData).refreshToken : null;
    } catch (error) {
        console.error("Error retrieving refresh token:", error);
        return null;
    }
};

export const getAccessToken = async () => {
    try {
        const storedData = await SecureStore.getItemAsync("aora_accessToken");
        return storedData ? JSON.parse(storedData).accessToken : null;
    } catch (error) {
        console.error("Error retrieving access token:", error);
        return null;
    }
};

export const storeRefreshToken = async (refreshToken) => {
    try {
        await SecureStore.setItemAsync(
            "aora_refreshToken",
            JSON.stringify({ refreshToken })
        );
    } catch (error) {
        console.error("Error storing refresh token:", error);
    }
};

export const storeAccessToken = async (accessToken) => {
    try {
        await SecureStore.setItemAsync(
            "aora_accessToken",
            JSON.stringify({ accessToken })
        );
    } catch (error) {
        console.error("Error storing access token:", error);
    }
};

export const removeRefreshToken = async () => {
    try {
        await SecureStore.deleteItemAsync("aora_refreshToken");
    } catch (error) {
        console.error("Error removing refresh token:", error);
    }
};

export const removeAccessToken = async () => {
    try {
        await SecureStore.deleteItemAsync("aora_accessToken");
    } catch (error) {
        console.error("Error removing access token:", error);
    }
};
