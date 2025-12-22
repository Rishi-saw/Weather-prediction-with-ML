"use client"

import { motion } from "framer-motion"
import { Sun, Cloud, CloudRain, CloudLightning, CloudSun } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WeatherPrediction } from "@/lib/types"

interface WeatherConditionCardProps {
  condition: WeatherPrediction["condition"]
  temperature: number
  city: string
  delay?: number
}

const conditionConfig = {
  Sunny: {
    icon: Sun,
    gradient: "from-yellow-400/20 to-orange-400/20",
    iconColor: "text-yellow-500",
    bgClass: "bg-gradient-to-br from-yellow-500/10 to-orange-500/10",
  },
  Cloudy: {
    icon: Cloud,
    gradient: "from-slate-400/20 to-slate-500/20",
    iconColor: "text-slate-500",
    bgClass: "bg-gradient-to-br from-slate-500/10 to-slate-600/10",
  },
  Rainy: {
    icon: CloudRain,
    gradient: "from-blue-400/20 to-cyan-400/20",
    iconColor: "text-blue-500",
    bgClass: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
  },
  Stormy: {
    icon: CloudLightning,
    gradient: "from-purple-400/20 to-slate-500/20",
    iconColor: "text-purple-500",
    bgClass: "bg-gradient-to-br from-purple-500/10 to-slate-600/10",
  },
  "Partly Cloudy": {
    icon: CloudSun,
    gradient: "from-blue-400/20 to-yellow-400/20",
    iconColor: "text-blue-400",
    bgClass: "bg-gradient-to-br from-blue-400/10 to-yellow-400/10",
  },
}

export function WeatherConditionCard({ condition, temperature, city, delay = 0 }: WeatherConditionCardProps) {
  const config = conditionConfig[condition] || conditionConfig["Sunny"]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-8",
        "bg-card/70 backdrop-blur-xl border border-border/50",
        "shadow-lg col-span-full lg:col-span-2",
      )}
    >
      {/* Background */}
      <div className={cn("absolute inset-0 opacity-50", config.bgClass)} />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-lg text-muted-foreground font-medium">{city}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl md:text-8xl font-bold tracking-tight">{temperature}</span>
            <span className="text-3xl md:text-4xl text-muted-foreground">°C</span>
          </div>
          <span className="text-xl font-medium text-muted-foreground">{condition}</span>
        </div>

        <motion.div
          animate={{
            rotate: condition === "Sunny" ? [0, 10, -10, 0] : [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: condition === "Sunny" ? 8 : 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className={cn("p-6 rounded-3xl", config.bgClass)}
        >
          <Icon className={cn("w-24 h-24 md:w-32 md:h-32", config.iconColor)} />
        </motion.div>
      </div>
    </motion.div>
  )
}
