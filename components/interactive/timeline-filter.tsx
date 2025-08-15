"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Filter, X, Search, Calendar } from "lucide-react"
import { TimelineBadge } from "@/components/ui/timeline-badge"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { MagneticHover } from "@/components/animations/magnetic-hover"
import type { TimelineEvent } from "@/types/timeline"

interface TimelineFilterProps {
  events: TimelineEvent[]
  onFilter: (filteredEvents: TimelineEvent[]) => void
  className?: string
}

const categories = [
  "Research Breakthroughs",
  "Models & Architectures",
  "Public Releases",
  "Hardware Advances",
  "Companies & Investments",
  "AI Tools",
  "Ethics & Policy",
  "Bombshell News",
  "Agents",
]

const categoryVariants = {
  "Research Breakthroughs": "research" as const,
  "Models & Architectures": "model" as const,
  "Public Releases": "release" as const,
  "Ethics & Policy": "ethics" as const,
  "Hardware Advances": "hardware" as const,
  "Companies & Investments": "company" as const,
  "AI Tools": "tool" as const,
  "Bombshell News": "bombshell" as const,
  Agents: "agent" as const,
}

export function TimelineFilter({ events, onFilter, className }: TimelineFilterProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [yearRange, setYearRange] = useState<[number, number]>([1940, 2024])

  const toggleCategory = (category: string) => {
    const newCategories = activeCategories.includes(category)
      ? activeCategories.filter((c) => c !== category)
      : [...activeCategories, category]

    setActiveCategories(newCategories)
    applyFilters(newCategories, searchTerm, yearRange)
  }

  const applyFilters = (categories: string[], search: string, years: [number, number]) => {
    let filteredEvents = events

    if (categories.length > 0) {
      filteredEvents = filteredEvents.filter((event) => categories.includes(event.category))
    }

    if (search.trim()) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(search.toLowerCase()) ||
          event.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    filteredEvents = filteredEvents.filter((event) => event.year >= years[0] && event.year <= years[1])

    onFilter(filteredEvents)
  }

  const clearFilters = () => {
    setActiveCategories([])
    setSearchTerm("")
    setYearRange([1940, 2024])
    onFilter(events)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    applyFilters(activeCategories, value, yearRange)
  }

  const filteredCount = events.filter((event) => {
    const categoryMatch = activeCategories.length === 0 || activeCategories.includes(event.category)
    const searchMatch =
      !searchTerm.trim() ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const yearMatch = event.year >= yearRange[0] && event.year <= yearRange[1]
    return categoryMatch && searchMatch && yearMatch
  }).length

  return (
    <div className={`relative ${className}`}>
      <MagneticHover strength={0.05}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-md border border-primary/20 rounded-xl text-foreground hover:border-primary/40 transition-all duration-300 group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <Filter className="w-5 h-5 text-primary" />
          </motion.div>
          <span className="font-medium">Advanced Filters</span>
          {(activeCategories.length > 0 || searchTerm || yearRange[0] !== 1940 || yearRange[1] !== 2024) && (
            <motion.span
              className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold border border-primary/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {filteredCount}
            </motion.span>
          )}

          <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-scan-line" />
          </div>
        </motion.button>
      </MagneticHover>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-4 z-50"
          >
            <CinematicCard variant="premium" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <span>Filter Timeline</span>
                </h3>
                <MagneticHover strength={0.1}>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-muted/50 transition-colors group"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </motion.button>
                </MagneticHover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Search Events</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search titles and descriptions..."
                    className="w-full px-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                  {searchTerm && (
                    <motion.button
                      onClick={() => handleSearchChange("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Year Range: {yearRange[0]} - {yearRange[1]}
                  </span>
                </label>
                <div className="flex space-x-4">
                  <input
                    type="range"
                    min="1940"
                    max="2024"
                    value={yearRange[0]}
                    onChange={(e) => {
                      const newRange: [number, number] = [Number.parseInt(e.target.value), yearRange[1]]
                      setYearRange(newRange)
                      applyFilters(activeCategories, searchTerm, newRange)
                    }}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="1940"
                    max="2024"
                    value={yearRange[1]}
                    onChange={(e) => {
                      const newRange: [number, number] = [yearRange[0], Number.parseInt(e.target.value)]
                      setYearRange(newRange)
                      applyFilters(activeCategories, searchTerm, newRange)
                    }}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isActive = activeCategories.includes(category)
                    return (
                      <MagneticHover key={category} strength={0.1}>
                        <motion.button
                          onClick={() => toggleCategory(category)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative"
                        >
                          <TimelineBadge
                            variant={categoryVariants[category]}
                            className={`transition-all duration-300 ${
                              isActive
                                ? "ring-2 ring-primary/50 bg-primary/20 shadow-lg shadow-primary/20"
                                : "opacity-60 hover:opacity-100 hover:shadow-md"
                            }`}
                            animated={isActive}
                          >
                            {category}
                          </TimelineBadge>
                        </motion.button>
                      </MagneticHover>
                    )
                  })}
                </div>
              </div>

              {(activeCategories.length > 0 || searchTerm || yearRange[0] !== 1940 || yearRange[1] !== 2024) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-4 border-t border-border/50 flex items-center justify-between"
                >
                  <span className="text-sm text-muted-foreground">
                    Showing {filteredCount} of {events.length} events
                  </span>
                  <MagneticHover strength={0.1}>
                    <motion.button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-primary hover:text-primary-foreground hover:bg-primary/20 rounded-lg transition-all duration-300 border border-primary/30 hover:border-primary/50"
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear all filters
                    </motion.button>
                  </MagneticHover>
                </motion.div>
              )}
            </CinematicCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
