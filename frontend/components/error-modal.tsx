"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  message?: string
}

export function ErrorModal({ isOpen, onClose, onRetry, message }: ErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-destructive/10">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold">Unable to Load Weather</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-muted-foreground mb-6">
                {message ||
                  "We couldn't fetch the weather data. This might be due to a network issue or the server is temporarily unavailable."}
              </p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl bg-transparent">
                  Cancel
                </Button>
                <Button onClick={onRetry} className="flex-1 rounded-xl gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
