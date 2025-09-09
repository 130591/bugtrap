"use client"

import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style jsx global>{`
          :root {
            --font-geist-sans: ${GeistSans.style.fontFamily};
            --font-geist-mono: ${GeistMono.style.fontFamily};
          }
          body {
            font-family: ${GeistSans.style.fontFamily};
            background-color: #0a0a0a;
            color: #f5f5f5;
          }
        `}</style>
      </head>
      <body>
        <div className="flex h-screen bg-gray-950 text-gray-100">{children}</div>
      </body>
    </html>
  )
}
