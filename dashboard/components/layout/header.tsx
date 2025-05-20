"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import SearchBar from "@/components/search-bar"
import UserMenu from "@/components/user-menu"
import { Upload } from "lucide-react"
import UploadModal from "@/components/upload-modal"
import type { ImageOut } from "@/types/image"

export default function Header() {
  const { user, logout } = useAuth()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Use useCallback to prevent unnecessary re-renders
  const handleSearch = useCallback((query: string) => {
    console.log("Search triggered in header with:", query)
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent("search", { detail: query }))
  }, [])

  const handleUploadSuccess = useCallback((newImage: ImageOut) => {
    // Notify parent component about new image
    window.dispatchEvent(new CustomEvent("imageUploaded", { detail: newImage }))
    setIsUploadModalOpen(false)
  }, [])

  return (
    <header className="border-b border-primary bg-background py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold neon-text">Image AI</span>
          </Link>

          <div className="flex-1 mx-4 max-w-xl">
            <SearchBar onSearch={handleSearch} placeholder="Rechercher des images..." />
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={() => setIsUploadModalOpen(true)} className="neon-button" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>

            {user && <UserMenu username={user.username} onLogout={logout} />}
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </header>
  )
}
