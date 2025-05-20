"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import MainLayout from "@/components/layout/main-layout"
import ImageList from "@/components/image-list"
import type { ImageOut } from "@/types/image"
import { normalizeImageData } from "@/types/image"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const [images, setImages] = useState<ImageOut[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const isFetchingRef = useRef(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch images function with protection against multiple calls
  const fetchImages = useCallback(async () => {
    if (!token || isFetchingRef.current) return

    isFetchingRef.current = true
    setIsLoading(true)

    try {
      console.log("Fetching all images...")
      const response = await fetch("/api/images", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch images")
      }

      const data = await response.json()
      console.log("API response received with", Array.isArray(data) ? data.length : 0, "images")

      // Normaliser les données pour gérer les tags comme chaîne de caractères
      const normalizedImages = Array.isArray(data) ? data.map(normalizeImageData) : []

      setImages(normalizedImages)
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les images",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [token, toast])

  // Search images function with protection against multiple calls
  const searchImages = useCallback(
    async (query: string) => {
      if (!token || isFetchingRef.current) return

      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // If query is empty, fetch all images
      if (!query.trim()) {
        return fetchImages()
      }

      // Set a timeout to prevent immediate API call
      searchTimeoutRef.current = setTimeout(async () => {
        isFetchingRef.current = true
        setIsLoading(true)

        try {
          console.log("Searching images with query:", query)
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (!response.ok) {
            throw new Error("Search failed")
          }

          const data = await response.json()
          console.log("Search API response received with", Array.isArray(data) ? data.length : 0, "results")

          // Normaliser les données pour gérer les tags comme chaîne de caractères
          const normalizedImages = Array.isArray(data) ? data.map(normalizeImageData) : []

          setImages(normalizedImages)
        } catch (error) {
          console.error("Search error:", error)
          toast({
            title: "Erreur de recherche",
            description: "Impossible d'effectuer la recherche",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
          isFetchingRef.current = false
        }
      }, 500) // 500ms delay
    },
    [token, toast, fetchImages],
  )

  // Fetch all images on initial load - only once
  useEffect(() => {
    if (token && mounted && !isFetchingRef.current) {
      fetchImages()
    }
  }, [token, fetchImages, mounted])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Listen for search events from the header
  useEffect(() => {
    const handleSearch = (event: CustomEvent<string>) => {
      searchImages(event.detail)
    }

    const handleImageUploaded = (event: CustomEvent<ImageOut>) => {
      // Add the new image to the list
      setImages((prevImages) => [normalizeImageData(event.detail), ...prevImages])
    }

    // Add event listeners
    window.addEventListener("search", handleSearch as EventListener)
    window.addEventListener("imageUploaded", handleImageUploaded as EventListener)

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener("search", handleSearch as EventListener)
      window.removeEventListener("imageUploaded", handleImageUploaded as EventListener)

      // Clear any pending search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchImages]) // Only re-add listeners if searchImages changes

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⟳</div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold neon-text">Galerie d&apos;images</h1>
          <p className="text-muted-foreground">Explorez et gérez votre collection d&apos;images</p>
        </div>

        <ImageList images={images} isLoading={isLoading} />
      </div>
    </MainLayout>
  )
}
