"use client"

import { motion } from "framer-motion"
import { CloudSun, Heart } from "lucide-react"

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="border-t border-gray-300 fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-muted-foreground bg-gradient-to-t from-background to-transparent"
    >
      <div className="flex items-center justify-center gap-4">
        <CloudSun className="w-4 h-4 text-primary" />
        <span>Powered by ML Weather Model</span>
      </div>
    </motion.footer>
  )
}
