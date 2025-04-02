'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { Geist_Mono } from 'next/font/google'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { signIn } from 'next-auth/react'

const geistSans = Geist_Mono({
  subsets: ["latin"],
  weight: ["700"],
})

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)

	const handleLoginWithAuth0 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    signIn("auth0", { callbackUrl: "/callback" })
  }

  return (
		<div className="flex justify-center items-center h-screen relative">
			<div className={`${geistSans.className} absolute top-6 left-8 text-1xl font-bold`}>
        BugTrap
      </div>

      {/* 🔹 CAIXA DE LOGIN */}
      <Card className="w-2/5 p-8 shadow-xl">
        <CardContent>
          <form onSubmit={handleLoginWithAuth0} className="flex flex-col space-y-6">
            <Button type="submit" className="w-full">Log In</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            By logging in, you accept the{" "}
            <a href="/terms" className="text-blue-500 underline">Terms of Use</a> and acknowledge the{" "}
            <a href="/privacy" className="text-blue-500 underline">Privacy Statement</a> and{" "}
            <a href="/cookies" className="text-blue-500 underline">Cookie Policy</a>.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm text-gray-500">Or log in with</p>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => window.location.href = "/api/auth/login"}
          >
            <FcGoogle className="mr-2" /> Log in with Google
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <FaGithub className="mr-2" /> Log in with GitHub
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
