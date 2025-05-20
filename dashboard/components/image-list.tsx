"use client"

import type { ImageOut } from "@/types/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface ImageListProps {
  images: ImageOut[]
  isLoading?: boolean
}

// Fonction utilitaire pour obtenir un tableau de tags, quelle que soit la forme d'entrée
function getTags(tags: string[] | string): string[] {
  if (Array.isArray(tags)) {
    return tags
  }
  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim())
  }
  return []
}

export default function ImageList({ images, isLoading = false }: ImageListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden neon-border">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-12" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">Aucune image trouvée</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => {
        // Obtenir les tags sous forme de tableau
        const tagArray = getTags(image.tags)

        return (
          <Card key={image.hash} className="overflow-hidden neon-border hover:animate-glow transition-all">
            <div className="h-48 bg-secondary/50 relative">
              <img
                src={`/api/image/${image.hash}`}
                alt={"Image"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <CardContent className="p-4">
              <p className="font-medium line-clamp-2">{image.description || "Sans description"}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 p-4 pt-0">
              {tagArray.length > 0 ? (
                tagArray.map((tag) => (
                  <Badge key={tag} variant="outline" className="neon-border">
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="neon-border">
                  Aucun tag
                </Badge>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
