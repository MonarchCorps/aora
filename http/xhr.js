import { CONFIGS } from "../configs/index";
import { getAccessToken, storeAccessToken, getRefreshToken, clearStorage } from "../helper/tokens";
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
                const newAccessToken = await refreshAuthLogic();
                // if (!newAccessToken) console.error("Failed to refresh token");

                await storeAccessToken(newAccessToken);
                prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return $http(prevRequest);
            } catch (refreshError) {
                if (refreshError.response?.status === 401) {
                    replace('/sign-in');
                    await clearStorage()
                }
            }
        } else if (error?.response?.status === 401) {
            replace('/sign-in');
            await clearStorage()
        }

        return Promise.reject(error);
    }
);


const refreshAuthLogic = async () => {
    try {
        const response = await axios.post(
            `${baseURL}/auth/${CONFIGS.URL.API_VERSION}/refresh`,
            {
                refreshToken: await getRefreshToken()
            },
            {
                withCredentials: true
            });

        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            console.error("Refresh token expired or invalid");
        }
    }
}

export { $http };