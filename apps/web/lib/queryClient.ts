import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientConfig,
} from "@tanstack/react-query"
import { AxiosError } from "axios"

import { toast } from 'react-toastify'
import { GET_FRIENDLY_MESSAGE } from "./utils"

const toastId = 'react-query-toast'

function createTitle(errorMsg: string, actionType: "query" | "mutation") {
  const action = actionType === "query" ? "fetch" : "update"
  return `could not ${action} data: ${
    errorMsg ?? "error connecting to server"
  }`
}

function errorHandler(title: string) {
  // https://chakra-ui.com/docs/components/toast#preventing-duplicate-toast
  // one message per page load, not one message per query
  // the user doesn't care that there were three failed queries on the staff page
  //    (staff, treatments, user)
  const id = "react-query-toast"

  if (!toast.isActive(toastId)) {
    toast.error(title, {
      toastId,
      autoClose: 5000,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }
}


export const queryClientOptions: QueryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: 600000, // 10 minutes
      gcTime: 900000, // 15 minutes
      refetchOnWindowFocus: false,
      retry: false,
      // Se quiser capturar erros para lançar no ErrorBoundary:
      // throwOnError: true, // ou uma função que retorna boolean
    },
  },
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if (error && (error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError
        const apiError = axiosError.response?.data?.error
        const rawMessage = apiError?.code?.message || apiError?.message || 'Erro inesperado.'
        const friendlyMessage = GET_FRIENDLY_MESSAGE(rawMessage)
        toast.error(friendlyMessage)
      } else {
        toast.error('Erro inesperado.')
      }

      const title = createTitle((error as Error).message, 'query')
      errorHandler(title)
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: unknown) => {
      const title = createTitle((error as Error).message, 'mutation')
      errorHandler(title)
    },
  }),
}

export const queryClient = new QueryClient()