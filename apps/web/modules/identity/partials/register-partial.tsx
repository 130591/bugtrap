"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Bug } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setIsError(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate success - redirect to login
      router.push("/login")
    } catch (error) {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex justify-center items-center p-4">
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Bug className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-100">BugTrap</span>
        </div>
      </div>

      <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-xl">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-100">Sign Up</h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username (Company Name)"
              value={form.username}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 p-3 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />

            {isError && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                Erro ao registrar usuário
              </p>
            )}

            <div className="text-sm text-gray-400 mt-2 space-y-1">
              <p>Must be between 8 and 128 characters</p>
              <p>No common words (e.g., "password")</p>
              <p>Cannot include your name, username, or email</p>
            </div>

            <div className="text-sm text-gray-400 mt-4 space-y-3">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span className="leading-relaxed">
                  I authorize BugTrap to contact me by email or phone about its products, services, or events.
                </span>
              </label>

              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span className="leading-relaxed">
                  By clicking Continue or registering through a third party, you accept BugTrap's{" "}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                    Terms of Use
                  </Link>{" "}
                  and acknowledge the{" "}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                    Privacy Statement
                  </Link>{" "}
                  and{" "}
                  <Link href="/cookies" className="text-blue-400 hover:text-blue-300 underline">
                    Cookie Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center">
          <p className="text-sm text-gray-400 w-full">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
