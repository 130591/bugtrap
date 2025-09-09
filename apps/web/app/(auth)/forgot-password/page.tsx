'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'

import { ForgotPasswordForm } from '@/modules/identity';

export default function ForgotPassword() {
	return (
		<ForgotPasswordForm />
	)
}
