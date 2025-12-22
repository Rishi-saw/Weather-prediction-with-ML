"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, CloudSun } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { ThemeToggle } from "@/components/theme-toggle"
import { LastUpdated } from "@/components/last-updated"
import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  city: string
  lastUpdated: string
  onRefresh: () => void
  isLoading?: boolean
}

export function DashboardHeader({ city, lastUpdated, onRefresh, isLoading }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Logo and back button */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <CloudSun className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold">WeatherAI</span>
            </Link>
          </div>

          {/* Search bar - hidden on mobile, shown on larger screens */}
          <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
            <SearchBar className="w-full" />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4 ml-auto">
            <LastUpdated timestamp={lastUpdated} onRefresh={onRefresh} isLoading={isLoading} />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden mt-4">
          <SearchBar className="w-full" />
        </div>
      </div>
    </motion.header>
  )
}
