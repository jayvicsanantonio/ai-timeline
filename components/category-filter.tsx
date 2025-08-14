"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TimelineCategory } from "@/types/timeline"

const categoryColors: Record<TimelineCategory, string> = {
  "Models & Architectures": "bg-blue-500/20 text-blue-300 border-blue-500/50 hover:bg-blue-500/30",
  "Research Breakthroughs": "bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/30",
  "Public Releases": "bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30",
  "Ethics & Policy": "bg-orange-500/20 text-orange-300 border-orange-500/50 hover:bg-orange-500/30",
  "Hardware Advances": "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30",
}

const categoryIcons: Record<TimelineCategory, string> = {
  "Models & Architectures": "🧠",
  "Research Breakthroughs": "🔬",
  "Public Releases": "🚀",
  "Ethics & Policy": "⚖️",
  "Hardware Advances": "💻",
}

interface CategoryFilterProps {
  categories: TimelineCategory[]
  activeCategories: TimelineCategory[]
  onCategoryToggle: (category: TimelineCategory) => void
  onClearAll: () => void
  totalEvents: number
  filteredEvents: number
}

export function CategoryFilter({
  categories,
  activeCategories,
  onCategoryToggle,
  onClearAll,
  totalEvents,
  filteredEvents,
}: CategoryFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = activeCategories.length > 0 && activeCategories.length < categories.length

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-20 z-40 mb-12"
    >
      <div className="bg-card/80 backdrop-blur-md border border-border/50 rounded-lg p-3 sm:p-4 shadow-lg mx-2 sm:mx-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-semibold">Filter Timeline</h3>
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden sm:flex items-center gap-2"
                >
                  <Badge variant="outline" className="text-xs">
                    {filteredEvents} of {totalEvents} events
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    className="h-6 w-6 p-0 hover:bg-destructive/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="sm:hidden">
            {isExpanded ? "Hide" : "Show"} Filters
          </Button>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isExpanded || (typeof window !== "undefined" && window.innerWidth >= 640) ? "auto" : 0,
              opacity: isExpanded || (typeof window !== "undefined" && window.innerWidth >= 640) ? 1 : 0,
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = activeCategories.includes(category)
                const isPartiallyActive = activeCategories.length > 0 && activeCategories.length < categories.length

                return (
                  <motion.button
                    key={category}
                    onClick={() => onCategoryToggle(category)}
                    className={`
                      relative px-3 sm:px-4 py-2 rounded-full border transition-all duration-200 text-xs sm:text-sm font-medium
                      ${
                        isActive || !isPartiallyActive
                          ? categoryColors[category]
                          : "bg-muted/50 text-muted-foreground border-muted hover:bg-muted"
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    <motion.div
                      className="flex items-center gap-1 sm:gap-2"
                      animate={{ opacity: isActive || !isPartiallyActive ? 1 : 0.5 }}
                    >
                      <span className="text-sm sm:text-base">{categoryIcons[category]}</span>
                      <span className="hidden sm:inline">{category}</span>
                      <span className="sm:hidden">{category.split(" ")[0]}</span>
                    </motion.div>

                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                  <span>
                    Showing {filteredEvents} of {totalEvents} events
                  </span>
                  <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
                    Clear all filters
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
