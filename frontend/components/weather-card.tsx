"use client"

import type React from "react"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherCardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  iconColor?: string
  gradient?: string
  delay?: number
  children?: React.ReactNode
}

export function WeatherCard({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = "text-primary",
  gradient = "from-primary/10 to-accent/10",
  delay = 0,
  children,
}: WeatherCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-white/80 dark:bg-card/70 backdrop-blur-xl border border-white/60 dark:border-border/50",
        "shadow-lg shadow-gray-200/50 dark:shadow-black/20 hover:shadow-xl transition-all duration-300",
      )}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40 dark:opacity-50", gradient)} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={cn("p-2 rounded-xl bg-white/60 dark:bg-background/50 backdrop-blur-sm shadow-sm", iconColor)}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{value}</span>
          {unit && <span className="text-xl text-muted-foreground font-medium">{unit}</span>}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  )
}
