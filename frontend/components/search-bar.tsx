"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MapPin, Loader2 } from "lucide-react"
import { INDIAN_CITIES } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  size?: "default" | "large"
  autoFocus?: boolean
}

export function SearchBar({ className, size = "default", autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filteredCities = query
    ? INDIAN_CITIES.filter((city) => city.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSelect = async (city: string) => {
    setIsLoading(true)
    setQuery(city)
    setIsOpen(false)
    router.push(`/dashboard/${encodeURIComponent(city)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filteredCities.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handleSelect(filteredCities[selectedIndex])
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const isLarge = size === "large"

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <div
        className={cn(
          "relative flex items-center gap-3 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg transition-all duration-300",
          isLarge ? "px-6 py-4" : "px-4 py-3",
          isOpen && filteredCities.length > 0 && "rounded-b-none border-b-0",
        )}
      >
        {isLoading ? (
          <Loader2 className={cn("text-primary animate-spin", isLarge ? "w-6 h-6" : "w-5 h-5")} />
        ) : (
          <Search className={cn("text-muted-foreground", isLarge ? "w-6 h-6" : "w-5 h-5")} />
        )}
        <input
          type="text"
          id="search-input"
          name="search"
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search Indian City Weather..."
          className={cn(
            "flex-1 bg-transparent outline-none placeholder:text-muted-foreground/60",
            isLarge ? "text-xl" : "text-base",
          )}
        />
      </div>

      <AnimatePresence>
        {isOpen && filteredCities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border border-t-0 border-border/50 rounded-b-2xl shadow-xl overflow-hidden z-50"
          >
            {filteredCities.map((city, index) => (
              <motion.button
                key={city}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(city)}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-3 text-left transition-colors",
                  selectedIndex === index ? "bg-primary/10 text-primary" : "hover:bg-muted/50",
                )}
              >
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{city}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
