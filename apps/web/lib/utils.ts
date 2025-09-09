import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const queryKeys = {
  projects: "projects",
  members: "members",
  issues: "issues",
  user: "user",
}

export function GET_FRIENDLY_MESSAGE(apiError: any): string {
  const statusCode = apiError?.error?.statusCode

  switch (statusCode) {
    case 401:
      return 'You need to be logged in to continue.'
    case 403:
      return 'You do not have permission to access this resource.'
    case 404:
      return 'The requested resource was not found.'
    case 500:
      return 'Internal server error. Please try again later.'
    default:
      return (
        apiError?.error?.message ||
        apiError?.message ||
        'Ocorreu um erro inesperado. Tente novamente.'
      )
  }
}

