"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Cloud, Sun, CloudRain, Wind, Snowflake, CloudLightning, CloudFog } from "lucide-react"
import type { WeatherCondition } from "@/lib/types"

const weatherThemes = {
  Sunny: {
    gradient: "from-amber-200/70 via-orange-100/50 to-yellow-100/60",
    darkGradient: "from-amber-500/15 via-orange-400/10 to-yellow-500/10",
    orb1: "from-yellow-300/50 to-orange-300/40",
    orb2: "from-amber-200/40 to-yellow-200/30",
    orb3: "from-orange-200/35 to-red-200/25",
    darkOrb1: "from-yellow-500/20 to-orange-500/15",
    darkOrb2: "from-amber-400/15 to-yellow-400/10",
    icons: [Sun, Sun, Cloud, Wind],
    iconOpacity: "text-amber-500/25 dark:text-yellow-400/15",
  },
  Cloudy: {
    gradient: "from-slate-200/70 via-gray-100/50 to-blue-100/40",
    darkGradient: "from-slate-500/15 via-gray-500/10 to-blue-500/10",
    orb1: "from-slate-300/50 to-gray-300/40",
    orb2: "from-blue-200/40 to-slate-200/30",
    orb3: "from-gray-200/35 to-slate-200/25",
    darkOrb1: "from-slate-500/20 to-gray-500/15",
    darkOrb2: "from-blue-400/15 to-slate-400/10",
    icons: [Cloud, Cloud, Cloud, Wind],
    iconOpacity: "text-slate-400/25 dark:text-slate-400/15",
  },
  Rainy: {
    gradient: "from-blue-300/70 via-indigo-200/50 to-slate-200/60",
    darkGradient: "from-blue-600/20 via-indigo-500/15 to-slate-500/10",
    orb1: "from-blue-400/50 to-indigo-400/40",
    orb2: "from-cyan-300/40 to-blue-300/30",
    orb3: "from-indigo-300/35 to-violet-200/25",
    darkOrb1: "from-blue-500/25 to-indigo-500/20",
    darkOrb2: "from-cyan-400/20 to-blue-400/15",
    icons: [CloudRain, CloudRain, Cloud, Snowflake],
    iconOpacity: "text-blue-500/25 dark:text-blue-400/15",
  },
  Stormy: {
    gradient: "from-slate-400/70 via-purple-200/50 to-indigo-200/60",
    darkGradient: "from-slate-600/25 via-purple-600/15 to-indigo-600/15",
    orb1: "from-purple-400/50 to-slate-400/40",
    orb2: "from-indigo-400/40 to-violet-300/30",
    orb3: "from-slate-400/35 to-purple-300/25",
    darkOrb1: "from-purple-500/25 to-slate-500/20",
    darkOrb2: "from-indigo-400/20 to-violet-400/15",
    icons: [CloudLightning, CloudRain, Cloud, Wind],
    iconOpacity: "text-purple-500/25 dark:text-purple-400/15",
  },
  Snowy: {
    gradient: "from-sky-100/70 via-white/50 to-blue-50/60",
    darkGradient: "from-sky-500/15 via-slate-400/10 to-blue-500/10",
    orb1: "from-white/60 to-sky-200/40",
    orb2: "from-blue-100/50 to-white/30",
    orb3: "from-sky-200/35 to-blue-100/25",
    darkOrb1: "from-sky-400/20 to-white/15",
    darkOrb2: "from-blue-300/15 to-sky-300/10",
    icons: [Snowflake, Snowflake, Cloud, Wind],
    iconOpacity: "text-sky-400/30 dark:text-sky-300/20",
  },
  Foggy: {
    gradient: "from-gray-200/80 via-slate-100/60 to-zinc-100/70",
    darkGradient: "from-gray-500/20 via-slate-500/15 to-zinc-500/15",
    orb1: "from-gray-300/60 to-slate-300/50",
    orb2: "from-zinc-200/50 to-gray-200/40",
    orb3: "from-slate-200/45 to-zinc-200/35",
    darkOrb1: "from-gray-500/25 to-slate-500/20",
    darkOrb2: "from-zinc-400/20 to-gray-400/15",
    icons: [CloudFog, Cloud, CloudFog, Wind],
    iconOpacity: "text-gray-400/30 dark:text-gray-400/20",
  },
  default: {
    gradient: "from-amber-100/60 via-background via-50% to-sky-100/60",
    darkGradient: "from-primary/5 via-background to-accent/5",
    orb1: "from-amber-300/30 to-orange-200/20",
    orb2: "from-sky-300/30 to-indigo-200/20",
    orb3: "from-rose-200/25 to-pink-100/15",
    darkOrb1: "from-primary/10 to-primary/5",
    darkOrb2: "from-accent/10 to-accent/5",
    icons: [Sun, Cloud, CloudRain, Wind],
    iconOpacity: "text-primary/15 dark:text-primary/5",
  },
}

function getTemperatureOverlay(temperature?: number) {
  if (!temperature) return ""
  if (temperature >= 40) return "bg-gradient-to-t from-red-500/10 to-transparent"
  if (temperature >= 35) return "bg-gradient-to-t from-orange-500/10 to-transparent"
  if (temperature >= 30) return "bg-gradient-to-t from-amber-400/5 to-transparent"
  if (temperature <= 10) return "bg-gradient-to-t from-blue-500/15 to-transparent"
  if (temperature <= 15) return "bg-gradient-to-t from-cyan-400/10 to-transparent"
  return ""
}

interface AnimatedBackgroundProps {
  condition?: WeatherCondition
  temperature?: number
}

export function AnimatedBackground({ condition, temperature }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false)
  const [rainPositions, setRainPositions] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([])
  const [snowPositions, setSnowPositions] = useState<Array<{ left: number; top: number; duration: number; delay: number; x: number }>>([])

  useEffect(() => {
    setMounted(true)
    // Generate stable random positions only on client
    if (condition === "Rainy" || condition === "Stormy") {
      setRainPositions(
        Array.from({ length: 20 }, (_, i) => ({
          left: (i * 37.5) % 100, // Deterministic based on index
          top: -(i * 7) % 20,
          duration: 1 + (i % 3) * 0.5,
          delay: (i % 4) * 0.5,
        }))
      )
    }
    if (condition === "Snowy") {
      setSnowPositions(
        Array.from({ length: 30 }, (_, i) => ({
          left: (i * 23.33) % 100, // Deterministic based on index
          top: -(i * 3.33) % 10,
          duration: 4 + (i % 4) * 3,
          delay: (i % 5) * 0.6,
          x: Math.sin(i) * 50,
        }))
      )
    }
  }, [condition])

  const theme = condition && weatherThemes[condition] ? weatherThemes[condition] : weatherThemes.default
  const tempOverlay = getTemperatureOverlay(temperature)

  const floatingIcons = theme.icons.map((Icon, index) => ({
    Icon,
    delay: index * 2,
    duration: 18 + index * 2,
    x: [0, (index % 2 === 0 ? 1 : -1) * (60 + index * 20), 0],
    y: [0, (index % 2 === 0 ? -1 : 1) * (40 + index * 10), 0],
  }))

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} dark:${theme.darkGradient}`} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} dark:${theme.darkGradient} transition-colors duration-1000`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {tempOverlay && (
        <motion.div
          className={`absolute inset-0 ${tempOverlay}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
      )}

      {floatingIcons.map(({ Icon, delay, duration, x, y }, index) => (
        <motion.div
          key={`${condition}-${index}`}
          className={`absolute ${theme.iconOpacity}`}
          style={{
            left: `${10 + ((index * 20) % 70)}%`,
            top: `${15 + ((index * 25) % 60)}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            x,
            y,
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 },
            x: { duration, delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            y: { duration, delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            rotate: { duration, delay, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Icon className="w-16 h-16 md:w-24 md:h-24" />
        </motion.div>
      ))}

      <motion.div
        key={`orb1-${condition}`}
        className={`absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br ${theme.orb1} dark:${theme.darkOrb1} blur-3xl transition-colors duration-1000`}
        style={{ top: "5%", left: "5%" }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        key={`orb2-${condition}`}
        className={`absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br ${theme.orb2} dark:${theme.darkOrb2} blur-3xl transition-colors duration-1000`}
        style={{ bottom: "5%", right: "5%" }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        key={`orb3-${condition}`}
        className={`absolute w-[300px] h-[300px] rounded-full bg-gradient-to-br ${theme.orb3} dark:from-pink-500/5 dark:to-rose-500/5 blur-3xl transition-colors duration-1000`}
        style={{ top: "50%", right: "20%" }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {(condition === "Rainy" || condition === "Stormy") && rainPositions.length > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {rainPositions.map((pos, i) => (
            <motion.div
              key={`rain-${i}`}
              className="absolute w-0.5 h-8 bg-gradient-to-b from-transparent via-blue-400/40 to-blue-500/60 dark:via-blue-300/30 dark:to-blue-400/50 rounded-full"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: ["0vh", "120vh"],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: pos.duration,
                delay: pos.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {condition === "Snowy" && snowPositions.length > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {snowPositions.map((pos, i) => (
            <motion.div
              key={`snow-${i}`}
              className="absolute w-2 h-2 bg-white/70 dark:bg-white/50 rounded-full"
              style={{
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: ["0vh", "110vh"],
                x: [0, pos.x, 0],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: pos.duration,
                delay: pos.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
