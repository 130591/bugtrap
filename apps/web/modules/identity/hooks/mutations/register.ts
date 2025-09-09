import api from "@/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export type InputRegister = {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
}

export async function register(input: InputRegister): Promise<void> {
  await api.post('/api/account/register', input)
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InputRegister) => register(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['user', 1] })
      console.log('Usuário registrado com sucesso:', input.email)
    },
    onError: (error: unknown) => {
      console.error('Erro ao registrar usuário:', error)
    },
  })
}