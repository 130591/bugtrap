'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import { FaGithub } from 'react-icons/fa'

import { signIn } from 'next-auth/react'

export default function Login() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		signIn("credentials", { email, password, callbackUrl: "/dashboard" })
	}

	return (
		<div className="flex justify-center items-center h-screen">
		<Card className="w-96 p-6 shadow-xl">
			<CardHeader className="text-center text-xl font-bold">BugTrap</CardHeader>
			<CardContent>
				<form onSubmit={handleLogin} className="flex flex-col space-y-4">
					<Input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<Input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
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
					onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
				>
					<FcGoogle className="mr-2" /> Log in with Google
				</Button>
				<Button
					variant="outline"
					className="w-full flex items-center justify-center"
					onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
				>
					<FaGithub className="mr-2" /> Log in with GitHub
				</Button>
			</CardFooter>
		</Card>
	</div>
	)
}
