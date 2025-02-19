import { useMutation } from "@tanstack/react-query"
import { APIVersion1Login, APIVersion1Register } from "../http/v1"

export const useRegister = () => {
    return useMutation({
        mutationFn: (data) => APIVersion1Register(data)
    })
}

export const useLogin = () => {
    return useMutation({
        mutationFn: (data) => APIVersion1Login(data)
    })
}