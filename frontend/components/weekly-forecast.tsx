"use client"

import { motion } from "framer-motion"
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
} from "lucide-react"

type DayForecast = {
  date: string
  temp_max: number
  temp_min: number
  rain_probability: number
}

function getDayName(date: string) {
  return new Date(date).toLocaleDateString("en-US", { weekday: "short" })
}

function getWeatherIcon(rain: number) {
  if (rain > 60) return CloudRain
  if (rain > 30) return CloudSun
  return Sun
}

export function WeeklyForecast({ data }: { data: DayForecast[] }) {
  return (
    <div className="w-full rounded-2xl text-white px-8 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {data.map((day, index) => {
          const Icon = getWeatherIcon(day.rain_probability)

          return (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center w-full bg-white border border-gray-200 shadow-lg p-4 rounded-lg"
            >
              <span className="text-base text-black">
                {getDayName(day.date)}
              </span>

              <Icon className="w-7 h-7 my-2 text-yellow-400" />
              <span className="text-xs text-gray-800">
                {Math.round(day.temp_min)}°
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
