import { CONFIGS } from '@/configs';
import axios from 'axios'

const baseURL = CONFIGS.URL.API_BASE_URL

export default axios.create({
    baseURL
});