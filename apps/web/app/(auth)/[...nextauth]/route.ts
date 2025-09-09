import NextAuth from 'next-auth'
import { authOptions } from '../auth.config'
import type { EventCallbacks } from 'next-auth'


const handler = NextAuth({
  ...authOptions,
  events: {
    ...authOptions.events,
    signIn: async ({ user, account, profile, isNewUser }) => {
      console.log('Usuário autenticado com sucesso:', user.email)
    },
    signOut: async (message) => {
      console.log('Usuário deslogado')
    },
  } as EventCallbacks,
  pages: {
    signIn: '/login',
    // Completely remove error page to prevent redirects
  },
})

export { handler as GET, handler as POST }