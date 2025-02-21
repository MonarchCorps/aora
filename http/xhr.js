import { CONFIGS } from "../configs/index";
import { getAccessToken, storeAccessToken, removeAccessToken, removeRefreshToken } from "../helper/tokens";
import { replace } from "../helper/navigate";
import axios from "axios";

const baseURL = CONFIGS.URL.CLIENT_URL;

export const axiosPrivate = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'multipart/form-data'
    },
    withCredentials: true,
});

const $http = axiosPrivate;
let interceptorsSet = false;

const setupInterceptors = (setAuth, refresh) => {
    if (interceptorsSet) return;

    $http.interceptors.request.use(
        async (config) => {
            let token = await getAccessToken();

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
                        setAuth({});
                        await removeAccessToken();
                        await removeRefreshToken();
                        replace('/sign-in');
                    }
                }
            }
            return Promise.reject(error);
        }
    );

    interceptorsSet = true;
}

export { $http, setupInterceptors };
