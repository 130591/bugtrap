import type { NextAuthOptions, SessionStrategy, User, EventCallbacks } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const user = await res.json()

          if (!res.ok) {
            return null
          }

          if (!user || !user.userId || !user.accessToken || !user.email) {
            return null
          }

          return {
            id: user.userId,
            email: user.email,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          }
        } catch (error: any) {
          // Return null instead of throwing error to prevent redirect
          return null
        }
      },
    }),
  ],
  
  secret: process.env.NEXTAUTH_SECRET,
  
  pages: {
    signIn: '/login',
  },
  
  events: {
    async signIn() {
      // Log opcional para debug
      console.log('Usuário autenticado com sucesso');
    },
    async signOut() {
      // Limpa os cookies ao fazer logout
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    },
  } as Partial<EventCallbacks>,
  
  // Callbacks para controle do fluxo de autenticação
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Sempre retorna true para evitar redirects automáticos
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Força sempre retornar para login em caso de erro
      if (url.includes('/api/auth/error') || url.includes('error')) {
        return `${baseUrl}/login`;
      }
      // Para URLs de callback após login bem-sucedido
      if (url.startsWith('/dashboard') || url.startsWith('/app')) {
        return `${baseUrl}${url}`;
      }
      // Permite redirecionamentos relativos
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Permite URLs absolutas do mesmo domínio
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Se URL for inválida, retorna para login
        return `${baseUrl}/login`;
      }
      return `${baseUrl}/login`;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        (session as any).accessToken = token.accessToken as string;
        (session as any).refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  
  // Desativa o debug em produção
  debug: process.env.NODE_ENV === 'development',
}
