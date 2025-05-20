export interface ImageOut {
  hash: string
  description: string | null
  tags: string[] | string
  id?: number
}

// Fonction utilitaire pour normaliser les données d'image
export function normalizeImageData(data: any): ImageOut {
  // Si tags est une chaîne, la diviser en tableau
  let tags = data.tags || []
  if (typeof tags === "string") {
    tags = tags.split(",").map((tag) => tag.trim())
  } else if (!Array.isArray(tags)) {
    tags = []
  }

  return {
    hash: data.hash || "",
    description: data.description || null,
    tags: tags,
    id: data.id,
  }
}
