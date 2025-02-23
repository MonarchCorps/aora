import { useMutation, useQuery } from '@tanstack/react-query'
import { APIVersion1CreatePost, APIVersion1FetchAllPosts } from '../http/v1'

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