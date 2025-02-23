import { useMutation, useQuery } from '@tanstack/react-query'
import { APIVersion1CreatePost, APIVersion1FetchAllPosts, APIVersion1FetchTrendingPosts } from '../http/v1'

export const useCreatePost = () => {
    return useMutation({
        mutationFn: (data) => APIVersion1CreatePost(data)
    })
}

export const useFetchAllPosts = () => {
    return useQuery({
        queryFn: () => APIVersion1FetchAllPosts(),
        queryKey: ["all-posts"],
        // retry: 3,
    })
}

export const useFetchTrendingPosts = (data) => {
    return useQuery({
        queryFn: () => APIVersion1FetchTrendingPosts(data),
        queryKey: ["trending-posts"],
    })
}