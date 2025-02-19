import { CONFIGS } from '@/configs';
import axios from 'axios'

const baseURL = CONFIGS.URL.CLIENT_URL

export default axios.create({
    baseURL
});