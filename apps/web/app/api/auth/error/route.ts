import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')
  
  console.log('NextAuth error intercepted:', error)
  
  return NextResponse.redirect(new URL('/login', request.url))
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/login', request.url))
}
