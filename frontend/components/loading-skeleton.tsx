"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: "card" | "chart" | "main"
}

export function LoadingSkeleton({ className, variant = "card" }: LoadingSkeletonProps) {
  if (variant === "main") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-full lg:col-span-2 rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 p-8 h-48"
      >
        <div className="shimmer h-full rounded-xl bg-muted/50" />
      </motion.div>
    )
  }

  if (variant === "chart") {
    return (
      <div className={cn("rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 p-6 h-80", className)}>
        <div className="shimmer h-6 w-32 rounded-lg bg-muted/50 mb-4" />
        <div className="shimmer h-full rounded-xl bg-muted/50" />
      </div>
    )
  }

  return (
    <div className={cn("rounded-2xl bg-card/70 backdrop-blur-xl border border-border/50 p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="shimmer w-10 h-10 rounded-xl bg-muted/50" />
        <div className="shimmer h-4 w-24 rounded bg-muted/50" />
      </div>
      <div className="shimmer h-12 w-32 rounded-lg bg-muted/50" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <LoadingSkeleton variant="main" />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton />
      <LoadingSkeleton variant="chart" className="col-span-full lg:col-span-2" />
      <LoadingSkeleton variant="chart" className="col-span-full lg:col-span-2" />
    </div>
  )
}
