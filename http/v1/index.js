import { CONFIGS } from '../../configs'
import axios from '@/api/axios'
import { $http } from '../xhr'

const version = CONFIGS.URL.API_VERSION

export const APIVersion1Register = async (data) =>
    axios.post(`/register/${version}/`, data).then((res) => res.data)

export const APIVersion1Login = async (data) =>
    axios.post(`/auth/${version}/login`, data, { withCredentials: true })
        .then((res) => res.data)

export const APIVersion1CreatePost = async (data) =>
    $http.post(`/posts/create-post`, data).then((res) => res.data)

export const APIVersion1FetchAllPosts = async () =>
    $http.get(`/posts/fetch-all-post`).then((res) => res.data)

export const APIVersion1FetchTrendingPosts = async (data) =>
    $http.get(`/posts/trending-post/${data}`).then((res) => res.data)