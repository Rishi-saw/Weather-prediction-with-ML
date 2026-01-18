"use client"

import { motion } from "framer-motion"
import { CloudSun } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { AnimatedBackground } from "@/components/animated-background"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrendingCities } from "@/components/trending-cities"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      <AnimatedBackground />

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero content */}
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        {/* Logo and title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-sky-100 dark:from-primary/20 dark:to-accent/20 backdrop-blur-sm border border-white/60 dark:border-border/50 shadow-lg shadow-amber-200/30 dark:shadow-none"
          >
            <CloudSun className="w-16 h-16 md:w-20 md:h-20 text-primary" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 dark:from-primary dark:via-accent dark:to-primary bg-clip-text text-transparent">
              WeatherAI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-md text-pretty">
            ML-powered weather predictions for Indian cities. Get accurate forecasts instantly.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full flex justify-center"
        >
          <SearchBar size="large" autoFocus />
        </motion.div>

        {/* Trending cities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full flex justify-center"
        >
          <TrendingCities />
        </motion.div>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4 mt-4"
        >
          {["7-Day Forecast", "ML Predictions", "Real-time Updates"].map((feature, index) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="px-4 py-1.5 text-sm rounded-full bg-white/70 dark:bg-transparent backdrop-blur-sm border border-white/50 dark:border-white/20 text-foreground/70 dark:text-white/60 shadow-sm dark:shadow-none"
            >
              {feature}
            </motion.span>
          ))}
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}
