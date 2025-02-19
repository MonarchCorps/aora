import { CONFIGS } from "@/configs";
import useAuth from "./useAuth";
import { getRefreshToken, removeAccessToken } from "@/helper/tokens";
import axios from "axios";

const baseURL = CONFIGS.URL.CLIENT_URL;

function useRefreshToken() {
    const { setAuth } = useAuth();

    const refresh = async () => {
        try {
            const response = await axios.get(
                `${baseURL}/auth/${CONFIGS.URL.API_VERSION}/refresh`,
                {
                    refreshToken: await getRefreshToken()
                },
                {
                    withCredentials: true
                });

            setAuth((prev) => ({
                ...prev,
                _id: response.data?.userDetails?._id,
                name: response.data?.userDetails?.name,
                email: response.data?.userDetails?.email
            }));

            return response.data.accessToken;
        } catch (error) {
            if (error.response?.status === 401) {
                setAuth({});
                await removeAccessToken()
                console.error("Refresh token expired or invalid");
            }
            throw error;
        }
    };

    return refresh;
}

export default useRefreshToken