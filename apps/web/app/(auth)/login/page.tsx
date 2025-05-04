'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLoginWithCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await signIn("Credentials", {
      email,
      password,
			method: "POST",
      redirect: false,
    });

    if (res?.error) {
			alert(`Erro: ${res?.error}`)
			console.log('res?.error', res?.error)
      setError("Email ou senha inválidos.")
      setLoading(false);
    } else {
      window.location.href = "/dashboard"
    }
  }

  return (
		<div className="flex justify-center items-center h-screen bg-gray-100">
		<Card className="w-[40%] max-w-lg p-8 shadow-xl bg-white">
			<CardHeader className="text-center text-xl font-bold">BugTrap</CardHeader>
			<CardContent>
				<form onSubmit={handleLoginWithCredentials} className="flex flex-col space-y-4">
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="border p-2 rounded"
						required
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="border p-2 rounded"
						required
					/>
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Signing in..." : "Sign In"}
					</Button>
				</form>
				<div className="text-center text-sm text-gray-500 mt-4">
					<Link href="/forgot-password" className="text-blue-500 hover:underline">
						Forgot your password?
					</Link>
				</div>
			</CardContent>
			<CardFooter className="flex flex-col space-y-2">
				<p className="text-center text-sm text-gray-500">Or sign in with</p>
				<Button
					variant="outline"
					className="w-full flex items-center justify-center"
					onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
				>
					<FcGoogle className="mr-2" /> Sign in with Google
				</Button>
				<Button
					variant="outline"
					className="w-full flex items-center justify-center"
					onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
				>
					<FaGithub className="mr-2" /> Sign in with GitHub
				</Button>
				<div className="text-center text-sm text-gray-500 mt-4">
					<span>Don't have an account? </span>
					<Link href="/register" className="text-blue-500 hover:underline">
						Create one
					</Link>
				</div>
			</CardFooter>
		</Card>
	</div>
  )
}
