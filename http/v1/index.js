import { CONFIGS } from '../../configs'
import axios from '@/api/axios'

const version = CONFIGS.URL.API_VERSION

export const APIVersion1Register = async (data) =>
    axios.post(`/register/${version}/`, data).then((res) => res.data)

export const APIVersion1Login = async (data) =>
    axios.post(`/auth/${version}/login`, data, { withCredentials: true })
        .then((res) => res.data)