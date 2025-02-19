import axios from 'axios'
import { CONFIGS } from '../../configs'
import { $http } from '../xhr'

export const APIVersion1Register = async (data) =>
    axios.post(`/register/${CONFIGS.URL.API_VERSION}/`, data).then((res) => res.data)

export const APIVersion1Login = async (data) =>
    axios.post(`/auth/${CONFIGS.URL.API_VERSION}/login`, data, { withCredentials: true })
        .then((res) => res.data)