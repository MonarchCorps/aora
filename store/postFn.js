import { useMutation } from '@tanstack/react-query'
import { APIVersion1CreatePost } from '../http/v1'

export const useCreatePost = () => {
    return useMutation({
        mutationFn: (data) => APIVersion1CreatePost(data)
    })
}