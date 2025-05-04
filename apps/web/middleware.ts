import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isAuthRoute = req.nextUrl.pathname.startsWith("/api/auth")


  if (isAuthRoute) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*"], //  "/dashboard/:path*"
}
