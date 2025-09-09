import api from '@/lib/api'
import { queryKeys } from '@/lib/utils'
import { ApiResponse, Project } from '@/types'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  const response = await api.get<ApiResponse<Project[]>>('/api/project')
  return response.data
}

export const useProject = () => {
  const queryClient = useQueryClient()
  const fallback: Project[] = []

  const { data: response, error } = useQuery<ApiResponse<Project[]>, AxiosError>({
    queryKey: [queryKeys.projects],
    queryFn: getProjects,
  })
  
  const projects = response?.data ?? fallback

  return { projects, error, meta: response }
}

export const useProjectByIdQuery = (id: number) => {
	return useQuery({
		queryKey: [queryKeys.projects, id],
		queryFn: async () => {
      const response = await api.get(`/project/${id}`)
      return response.data
    },
	})
}