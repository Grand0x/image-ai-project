"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { AuthContextType, TokenResponse, MeResponse, User } from "@/types/auth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if token exists in localStorage on initial load
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      fetchUserInfo(storedToken)
    }
  }, [])

  // Effect to handle redirection after authentication
  useEffect(() => {
    if (isAuthenticated && user && token) {
      console.log("User authenticated, redirecting to home page...")

      // Try multiple approaches to navigation
      try {
        // Approach 1: Next.js router
        router.push("/")

        // Approach 2: setTimeout to give router time to work
        setTimeout(() => {
          if (window.location.pathname === "/login") {
            console.log("Router navigation delayed, trying direct navigation...")
            window.location.href = "/"
          }
        }, 500)
      } catch (err) {
        console.error("Navigation error:", err)
        // Fallback to direct navigation
        window.location.href = "/"
      }
    }
  }, [isAuthenticated, user, token, router])

  const fetchUserInfo = async (accessToken: string) => {
    try {
      console.log("Fetching user info...")
      const response = await fetch("/api/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user info")
      }

      const userData: MeResponse = await response.json()
      console.log("User info fetched successfully:", userData)

      setUser({
        username: userData.username,
        roles: userData.roles,
      })

      setIsAuthenticated(true)
    } catch (err) {
      console.error("Error fetching user info:", err)
      setError("Failed to fetch user information")
      logout()
    }
  }

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting login...")
      const response = await fetch("/api/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const data: TokenResponse = await response.json()
      console.log("Login successful, token received")

      // Store token in localStorage
      localStorage.setItem("token", data.access_token)
      setToken(data.access_token)

      // Fetch user info
      await fetchUserInfo(data.access_token)
    } catch (err) {
      console.error("Login error:", err)
      setError("Authentication failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("Logging out...")
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)

    // Use direct navigation for logout as well
    try {
      router.push("/login")
    } catch (err) {
      window.location.href = "/login"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading,
        error,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
