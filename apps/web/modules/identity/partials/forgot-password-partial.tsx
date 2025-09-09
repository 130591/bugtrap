"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bug, ArrowLeft, Mail, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [countdown, setCountdown] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsEmailSent(true)
    setResendCount(1)
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setResendCount((prev) => prev + 1)

    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Bug className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-100">BugTrap</span>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>

            <h1 className="text-xl font-semibold text-gray-100 mb-2">Check your email</h1>
            <p className="text-sm text-gray-400 mb-6">
              We've sent a password reset link to <span className="text-gray-200 font-medium break-all">{email}</span>
            </p>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                disabled={isLoading || countdown > 0}
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? "Resending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend email"}
              </Button>

              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full text-gray-400 hover:text-gray-100 hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>

            {resendCount > 1 && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-blue-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">Email sent {resendCount} times</span>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-200 mb-2">Didn't receive the email?</h3>
              <ul className="text-xs text-gray-500 space-y-1 text-left">
                <li>• Check your spam or junk folder</li>
                <li>• Make sure {email} is correct</li>
                <li>• Wait a few minutes for the email to arrive</li>
                <li>• Try resending the email</li>
              </ul>
            </div>

            {/* Support Link */}
            <div className="mt-4">
              <p className="text-xs text-gray-500">
                Still having trouble?{" "}
                <Link href="/support" className="text-blue-400 hover:text-blue-300 hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Bug className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-100">BugTrap</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-100 mb-2">Forgot your password?</h1>
          <p className="text-sm text-gray-400">No worries, we'll send you reset instructions</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500">Enter the email address associated with your account</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send reset link
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-400 hover:text-gray-100 hover:bg-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-gray-900/50 rounded-lg border border-gray-800/50 p-4">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Need help?</h3>
          <p className="text-xs text-gray-500 mb-3">
            If you're having trouble accessing your account, our support team is here to help.
          </p>
          <Link href="/support">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
            >
              Contact Support
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Remember your password?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
              Sign in
            </Link>{" "}
            or{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
