"use client"

import { motion } from "framer-motion"
import { Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LastUpdatedProps {
  timestamp: string
  onRefresh: () => void
  isLoading?: boolean
}

export function LastUpdated({ timestamp, onRefresh, isLoading }: LastUpdatedProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Last updated: {formatTime(timestamp)}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading} className="rounded-xl gap-2">
        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </motion.div>
  )
}
