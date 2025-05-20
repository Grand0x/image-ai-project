"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = "Rechercher..." }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isFirstRenderRef = useRef(true)

  // Improved debounce implementation
  const debouncedSearch = useCallback(
    (value: string) => {
      // Clear any existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Set a new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        console.log("Debounced search triggered with:", value)
        onSearch(value)
      }, 500) // 500ms delay
    },
    [onSearch],
  )

  // Call the debounced function when query changes, but not on first render
  useEffect(() => {
    // Skip the first render to avoid unnecessary API calls
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }

    debouncedSearch(query)

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query, debouncedSearch])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 border-primary focus:ring-primary neon-border"
      />
    </div>
  )
}
