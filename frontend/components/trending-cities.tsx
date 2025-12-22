"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapPin, TrendingUp } from "lucide-react"
import { TRENDING_CITIES } from "@/lib/types"

export function TrendingCities() {
  const router = useRouter()

  const handleCityClick = (city: string) => {
    router.push(`/dashboard/${encodeURIComponent(city)}`)
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <TrendingUp className="w-4 h-4" />
        <span className="text-sm font-medium">Trending Cities</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {TRENDING_CITIES.map((city, index) => (
          <motion.button
            key={city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCityClick(city)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 dark:bg-transparent backdrop-blur-md border border-gray-200 dark:border-white/20 hover:bg-gradient-to-r hover:from-amber-50 hover:to-sky-50 dark:hover:bg-white/10 hover:border-primary/30 dark:hover:border-white/30 transition-all duration-300 shadow-sm dark:shadow-none group"
          >
            <MapPin className="w-4 h-4 text-amber-500 dark:text-white/50 group-hover:text-primary dark:group-hover:text-white/80 transition-colors" />
            <span className="text-sm font-medium text-gray-700 dark:text-white/60 group-hover:text-gray-900 dark:group-hover:text-white/90 transition-colors">
              {city}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
