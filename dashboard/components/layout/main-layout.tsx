"use client"

import type { ReactNode } from "react"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import Header from "./header"
import Footer from "./footer"

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  // This will redirect to login if not authenticated
  const { isAuthenticated, isChecking } = useAuthGuard()

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⟳</div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Don't render anything while redirecting to login
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
      <Footer />
    </div>
  )
}
