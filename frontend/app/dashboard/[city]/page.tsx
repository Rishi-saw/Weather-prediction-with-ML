"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Droplets, CloudRain, Wind } from "lucide-react"
import { toast } from "sonner"
import { fetchWeatherPrediction } from "@/lib/api"
import type { WeatherPrediction } from "@/lib/types"
import { DashboardHeader } from "@/components/dashboard-header"
import { WeatherCard } from "@/components/weather-card"
import { WeatherConditionCard } from "@/components/weather-condition-card"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import { ErrorModal } from "@/components/error-modal"
import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"
import { getAQI, get7DayForecast } from "@/lib/api"
import { WeeklyForecast } from "@/components/weekly-forecast"
import AQICard from "@/components/AQICard"


export default function DashboardPage() {
  const params = useParams()
  const city = decodeURIComponent(params.city as string)

  const [mounted, setMounted] = useState(false)
  const [weather, setWeather] = useState<WeatherPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [aqi, setAqi] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])


  const loadWeather = useCallback(async () => {
    setIsLoading(true)
    setShowError(false)

    try {

      const weatherRes = await fetchWeatherPrediction(city)
      const aqiPromise = getAQI(city).catch(() => null)
      const forecastPromise = get7DayForecast(city).catch(() => null)

      const [aqiRes, forecastRes] = await Promise.all([
        aqiPromise,
        forecastPromise,
      ])

      if (weatherRes.success && weatherRes.data) {
        setWeather(weatherRes.data)
        setAqi(aqiRes)
        setForecast(forecastRes?.forecast || [])
        toast.success(`Weather loaded for ${city}`)
      } else {
        throw new Error(weatherRes.error || "Failed to fetch weather data")
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }, [city])



  useEffect(() => {
    loadWeather()
  }, [loadWeather])
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen pb-20">
      <AnimatedBackground condition={weather?.condition} temperature={weather?.temperature} />

      <DashboardHeader
        city={city}
        lastUpdated={weather?.lastUpdated || new Date().toISOString()}
        onRefresh={loadWeather}
        isLoading={isLoading}
      />

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DashboardSkeleton />
            </motion.div>
          ) : weather ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Main weather cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Main condition card - spans 2 columns on large screens */}
                <WeatherConditionCard
                  condition={weather.condition}
                  temperature={weather.temperature}
                  city={weather.city}
                  delay={0}
                />

                {/* Humidity card */}
                <WeatherCard
                  title="Humidity"
                  value={weather.humidity}
                  unit="%"
                  icon={Droplets}
                  iconColor="text-humid"
                  gradient="from-cyan-400/20 to-blue-400/20"
                  delay={0.1}
                >
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${weather.humidity}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    />
                  </div>
                </WeatherCard>

                {/* Rain chance card */}
                <WeatherCard
                  title="Rain Chance"
                  value={weather.rainfall}
                  unit="%"
                  icon={CloudRain}
                  iconColor="text-rainy"
                  gradient="from-blue-400/20 to-indigo-400/20"
                  delay={0.2}
                >
                  <span className="text-sm text-muted-foreground">
                    {weather.rainfall >= 70
                      ? "High chance of rain"
                      : weather.rainfall >= 40
                        ? "Moderate chance of rain"
                        : "Low chance of rain"}
                  </span>
                </WeatherCard>

                {/* Wind speed card */}
                <WeatherCard
                  title="Wind Speed"
                  value={weather.windSpeed}
                  unit="km/h"
                  icon={Wind}
                  iconColor="text-windy"
                  gradient="from-teal-400/20 to-emerald-400/20"
                  delay={0.3}
                >
                  <span className="text-sm text-muted-foreground">
                    {weather.windSpeed > 30
                      ? "Strong winds"
                      : weather.windSpeed > 15
                        ? "Moderate breeze"
                        : "Light wind"}
                  </span>
                </WeatherCard>
                {/* AQI + Forecast Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AQI Card */}
                  {aqi && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="lg:col-span-1"
                    >
                      <AQICard data={aqi} />
                    </motion.div>
                  )}

                  {/* 7-Day Forecast Chart */}
                  {/* {forecast.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <WeeklyForecast data={forecast} />
                    </motion.div>
                  )} */}

                </div>
                <div className="mt-8">
                  {forecast.length > 0 && (
                    <WeeklyForecast data={forecast} />
                  )}
                </div>

              </div>

            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <ErrorModal isOpen={showError} onClose={() => setShowError(false)} onRetry={loadWeather} message={errorMessage} />

      <Footer />
    </div>
  )
}
