'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      setError('Registration failed. Try again.')
      return
    }

    router.push('/login')
  }

  return (
		<div className="flex justify-center items-center h-screen">
			<Card className="w-2/5 p-8 shadow-xl">
				<CardHeader className="text-center text-2xl font-bold">Sign Up</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
						<input
							type="text"
							name="firstName"
							placeholder="First Name"
							value={form.firstName}
							onChange={handleChange}
							className="border p-2 rounded text-sm"
							required
						/>
						<input
							type="text"
							name="lastName"
							placeholder="Last Name"
							value={form.lastName}
							onChange={handleChange}
							className="border p-2 rounded text-sm"
							required
						/>
						<input
							type="text"
							name="username"
							placeholder="Username (Company Name)"
							value={form.username}
							onChange={handleChange}
							className="border p-2 rounded text-sm"
							required
						/>
						<input
							type="email"
							name="email"
							placeholder="Email"
							value={form.email}
							onChange={handleChange}
							className="border p-2 rounded text-sm"
							required
						/>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={form.password}
							onChange={handleChange}
							className="border p-2 rounded text-sm"
							required
						/>
						{error && <p className="text-red-500 text-xs">{error}</p>}

						<div className="text-sm text-gray-500 mt-2">
							<p>Must be between 8 and 128 characters</p>
							<p>No common words (e.g., "password")</p>
							<p>Cannot include your name, username, or email</p>
						</div>

						<div className="text-sm text-gray-500 mt-4">
							<label className="flex items-center">
								<input type="checkbox" required />
								<span className="ml-2">
									I authorize GitLab to contact me by email or phone about its products, services, or events.
								</span>
							</label>
							<label className="flex items-center mt-2">
								<input type="checkbox" required />
								<span className="ml-2">
									By clicking Continue or registering through a third party, you accept GitLab's Terms of Use and acknowledge the Privacy Statement and Cookie Policy.
								</span>
							</label>
						</div>

						<Button type="submit" className="w-full mt-4 text-sm">Register</Button>
					</form>
				</CardContent>
				<CardFooter className="text-center">
					<p className="text-sm text-gray-500">
						Already have an account? <a href="/login" className="text-blue-500 underline">Log in</a>
					</p>
				</CardFooter>
			</Card>
		</div>

  )
}
