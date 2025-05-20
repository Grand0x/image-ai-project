"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { ImageOut } from "@/types/image"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadSuccess: (newImage: ImageOut) => void
}

export default function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { token } = useAuth()
  const uploadTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check if file is an image
      if (!selectedFile.type.startsWith("image/")) {
        toast({
          title: "Type de fichier non supporté",
          description: "Veuillez sélectionner une image.",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
      setUploadError(null)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file || !token) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Set a timeout to abort the request if it takes too long
      const controller = new AbortController()
      const signal = controller.signal

      // Set a longer timeout (30 seconds)
      uploadTimeoutRef.current = setTimeout(() => {
        controller.abort()
      }, 30000) // 30 seconds timeout

      console.log("Starting image upload...")
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal,
      })

      // Clear the timeout
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current)
        uploadTimeoutRef.current = null
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(errorData.error || "Upload failed")
      }

      const data: ImageOut = await response.json()
      console.log("Upload successful:", data)

      toast({
        title: "Upload réussi",
        description: "Votre image a été téléchargée avec succès.",
      })

      onUploadSuccess(data)
      resetForm()
    } catch (error) {
      console.error("Upload error:", error)

      // Handle AbortError specifically
      if (error instanceof DOMException && error.name === "AbortError") {
        setUploadError("L'upload a pris trop de temps. Veuillez réessayer.")
      } else {
        setUploadError(`Erreur lors de l'upload: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
      }

      toast({
        title: "Erreur d'upload",
        description: "Une erreur est survenue lors du téléchargement de l'image. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setPreview(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClose = () => {
    // Clear any pending timeout
    if (uploadTimeoutRef.current) {
      clearTimeout(uploadTimeoutRef.current)
      uploadTimeoutRef.current = null
    }

    resetForm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md neon-border">
        <DialogHeader>
          <DialogTitle className="neon-text">Télécharger une image</DialogTitle>
          <DialogDescription>Sélectionnez une image à télécharger et analyser</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {!preview ? (
            <div
              className="border-2 border-dashed border-primary rounded-lg p-12 text-center cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner une image ou glissez-déposez ici
                </p>
              </div>
              <Input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>
          ) : (
            <div className="relative">
              <img
                src={preview || "/placeholder.svg"}
                alt="Preview"
                className="w-full h-auto max-h-64 object-contain rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {file && (
            <div className="text-sm">
              <p className="font-medium">{file.name}</p>
              <p className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Annuler
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading} className="neon-button">
            {isUploading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⟳</span>
                Téléchargement...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Télécharger
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
