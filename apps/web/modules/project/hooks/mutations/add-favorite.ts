import api from '@/lib/api'
import { InputAddFavorite } from '../../service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export async function addFavorite(input: InputAddFavorite): Promise<void> {
  await api.post('/api/project/favorites', input)
}

export function useAddFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: InputAddFavorite) => addFavorite(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['project', input.projectId] })
    },
    onError: (error: unknown) => {
      // opcional: tratamento de erro específico
      console.error(error)
    },
  })
}