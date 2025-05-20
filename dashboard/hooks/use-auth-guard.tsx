"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export function useAuthGuard() {
  const { user, token, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/login") {
      // If user is already logged in, redirect to home
      if (isAuthenticated && user && token) {
        console.log("User already authenticated, redirecting to home...")
        router.push("/")
      }
      setIsChecking(false)
      return
    }

    // For all other pages, check if user is authenticated
    if (!isAuthenticated || !user || !token) {
      console.log("User not authenticated, redirecting to login...")
      router.push("/login")
    } else {
      console.log("User authenticated, staying on current page")
    }

    setIsChecking(false)
  }, [user, token, router, pathname, isAuthenticated])

  return { isAuthenticated: !!user && !!token, isChecking }
}
