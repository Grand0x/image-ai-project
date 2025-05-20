"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Home } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, error, isAuthenticated, user } = useAuth()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage("Tentative de connexion...")
    await login(username, password)
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      setStatusMessage(`Authentifié en tant que ${user.username}. Redirection en cours...`)
    }
  }, [isAuthenticated, user])

  // Function to navigate manually
  const goToDashboard = () => {
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-primary animate-glow neon-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center neon-text">Image AI Dashboard</CardTitle>
            <CardDescription className="text-center">Connectez-vous pour accéder à votre dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {statusMessage && !error && (
                <Alert variant="default" className="bg-primary/20 border-primary">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{statusMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-primary focus:ring-primary"
                />
              </div>

              {isAuthenticated && user && (
                <div className="mt-4">
                  <Alert variant="default" className="bg-green-500/20 border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      Vous êtes connecté en tant que <strong>{user.username}</strong>. Si vous n&apos;êtes pas
                      automatiquement redirigé, cliquez sur le bouton ci-dessous.
                    </AlertDescription>
                  </Alert>
                  <Button type="button" className="w-full mt-4 neon-button" onClick={goToDashboard}>
                    <Home className="mr-2 h-4 w-4" />
                    Aller au Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full neon-button" disabled={isLoading || isAuthenticated}>
                {isLoading ? "Connexion en cours..." : isAuthenticated ? "Connecté" : "Se connecter"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
