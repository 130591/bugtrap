import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@auth0/nextjs-auth0"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const { accessToken } = await getAccessToken()

    
    if (!accessToken) {
      return NextResponse.redirect(new URL("/api/auth/login", req.url))
    }
    
    return res
  } catch (error) {
    return NextResponse.redirect(new URL("/api/auth/login", req.url))
  }
}

export const config = {
  matcher: [ "/profile/:path*"], // "/dashboard/:path*",
}
