import axios from "axios";
import { CONFIGS } from "../configs/index";
import { getAccessToken, storeAccessToken, removeAccessToken, removeRefreshToken } from "../helper/tokens";
import { replace } from "../helper/navigate";

const baseURL = CONFIGS.URL.CLIENT_URL;

const $http = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json"
    }
});

const setupInterceptors = (setAuth, refresh) => {
    $http.interceptors.request.use(
        async (config) => {
            let token = await getAccessToken();
            console.log(`Token: ${token}`)

            if (token && !config.headers["Authorization"]) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    $http.interceptors.response.use(
        (response) => response,
        async (error) => {
            const prevRequest = error?.config;

            if (error?.response?.status === 403 && !prevRequest?.sent) {
                prevRequest.sent = true;
                try {
                    const newAccessToken = await refresh();
                    await storeAccessToken(newAccessToken);

                    prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                    return $http(prevRequest);
                } catch (refreshError) {
                    console.error("Refresh token expired:", refreshError);

                    if (refreshError.response?.status === 401) {
                        // 🚨 Refresh token expired! Log the user out and redirect
                        setAuth({});
                        await removeAccessToken();
                        await removeRefreshToken();
                        replace('sign-in');
                    }
                }
            }
            return Promise.reject(error);
        }
    );
};

export { $http, setupInterceptors };
