'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn as nextAuthSignIn, signIn } from 'next-auth/react'
import api from "@/lib/api"
import { GET_FRIENDLY_MESSAGE } from '@/lib/utils'

// export async function signIn(payload: { email: string, password: string }) {
// 	return await api.post('/api/user/signin', { payload }, {
// 		withCredentials: true,
// 		headers: {
// 			'Content-Type': 'application/json',
// 		},
// 	})
// }


export function useLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError("")
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
 
      if (result?.error) {
        const message = GET_FRIENDLY_MESSAGE(result.error)
        setError(message || "Erro desconhecido ao fazer login.")
        return
      }

      if (result?.ok) {
        router.push("/dashboard")
      } else {
        setError("Erro inesperado durante o login.")
      }
  }

  return { login, loading, error }
}