"use client"

import { motion } from "framer-motion"

type Props = {
  condition?: string
  temperature?: number
  predictedRain?: string
  rainfall?: number
}


export function WeatherBackground({ condition, temperature, predictedRain, rainfall }: Props) {
const text = condition?.toLowerCase() || ""

const isRain =
  predictedRain === "Yes" ||
  (rainfall !== undefined && rainfall >= 50) ||
  text.includes("rain")

const isCloud =
  text.includes("cloud") ||
  text.includes("overcast")

const isSunny =
  text.includes("sun") ||
  text.includes("clear") ||
  (temperature !== undefined && temperature >= 25)

if (isRain) return <RainBackground />
if (isCloud) return <CloudyBackground />
if (isSunny) return <SunnyBackground />

return <DefaultBackground />
}

/* ---------------- SUNNY ---------------- */

function SunnyBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-yellow-300/30 blur-3xl"
        initial={{ opacity: 0.6, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
        style={{ top: "-200px", right: "-200px" }}
      />
    </div>
  )
}

/* ---------------- CLOUDY ---------------- */

function CloudyBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[400px] h-[200px] bg-gray-300/20 rounded-full blur-3xl"
          initial={{ x: -500 }}
          animate={{ x: 1600 }}
          transition={{
            duration: 60 + i * 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ top: `${i * 120 + 50}px` }}
        />
      ))}
    </div>
  )
}

/* ---------------- RAIN ---------------- */

function RainBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {[...Array(120)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[20px] bg-blue-400/40"
          initial={{ y: -50 }}
          animate={{ y: "110vh" }}
          transition={{
            duration: 0.6 + Math.random(),
            repeat: Infinity,
            delay: Math.random(),
          }}
          style={{
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

/* ---------------- DEFAULT ---------------- */

function DefaultBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-100 to-slate-200" />
  )
}
