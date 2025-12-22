"use client"

import type React from "react"

import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Droplets, CloudRain } from "lucide-react"
import type { DailyForecast } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WeatherChartsProps {
  forecast: DailyForecast[]
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl rounded-xl border border-border/50 p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm text-muted-foreground">
            <span className="font-medium" style={{ color: item.color }}>
              {item.name}:
            </span>{" "}
            {item.value}
            {item.unit || ""}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function ChartCard({
  title,
  icon: Icon,
  children,
  delay = 0,
  className,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn("rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 p-6 shadow-lg", className)}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}

export function WeatherCharts({ forecast }: WeatherChartsProps) {
  // Define colors for charts (computed values for Recharts compatibility)
  const primaryColor = "#6366f1" // Primary blue/indigo
  const accentColor = "#14b8a6" // Teal accent
  const rainColor = "#3b82f6" // Blue for rain

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Temperature Line Chart */}
      <ChartCard title="7-Day Temperature Trend" icon={TrendingUp} delay={0.4}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="day" stroke="currentColor" opacity={0.5} fontSize={12} />
              <YAxis stroke="currentColor" opacity={0.5} fontSize={12} tickFormatter={(value) => `${value}°`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="temperature"
                stroke={primaryColor}
                strokeWidth={3}
                fill="url(#tempGradient)"
                name="Temperature"
                unit="°C"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Rain Probability Bar Chart */}
      <ChartCard title="Rain Probability Forecast" icon={CloudRain} delay={0.5}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecast}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={rainColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={rainColor} stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="day" stroke="currentColor" opacity={0.5} fontSize={12} />
              <YAxis stroke="currentColor" opacity={0.5} fontSize={12} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="rainProbability"
                fill="url(#rainGradient)"
                radius={[8, 8, 0, 0]}
                name="Rain Chance"
                unit="%"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Humidity Line Chart */}
      <ChartCard title="Humidity Levels" icon={Droplets} delay={0.6} className="lg:col-span-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
              <defs>
                <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="day" stroke="currentColor" opacity={0.5} fontSize={12} />
              <YAxis
                stroke="currentColor"
                opacity={0.5}
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke={accentColor}
                strokeWidth={3}
                dot={{ fill: accentColor, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: accentColor }}
                name="Humidity"
                unit="%"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Daily forecast cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="lg:col-span-2"
      >
        <h3 className="font-semibold text-lg mb-4">Daily Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecast.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="rounded-xl bg-card/70 backdrop-blur-xl border border-border/50 p-4 text-center shadow-sm hover:shadow-md transition-all"
            >
              <p className="font-medium text-sm text-muted-foreground mb-2">{day.day}</p>
              <p className="text-2xl font-bold mb-1">{day.temperature}°</p>
              <p className="text-xs text-muted-foreground">{day.condition}</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-rainy">
                <CloudRain className="w-3 h-3" />
                <span>{day.rainProbability}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
