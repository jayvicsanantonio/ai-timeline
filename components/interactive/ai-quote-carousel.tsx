"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Quote, ChevronLeft, ChevronRight } from "lucide-react"
import { CinematicCard } from "@/components/ui/cinematic-card"
import { RevealAnimation } from "@/components/animations/reveal-animation"

interface AIQuote {
  text: string
  author: string
  year: number
  context: string
}

const quotes: AIQuote[] = [
  {
    text: "I propose to consider the question, 'Can machines think?'",
    author: "Alan Turing",
    year: 1950,
    context: "Computing Machinery and Intelligence",
  },
  {
    text: "Every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it.",
    author: "John McCarthy",
    year: 1956,
    context: "Dartmouth Conference Proposal",
  },
  {
    text: "The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.",
    author: "Edsger Dijkstra",
    year: 1984,
    context: "On the nature of computing science",
  },
  {
    text: "AI is probably the most important thing humanity has ever worked on. I think of it as something more profound than electricity or fire.",
    author: "Sundar Pichai",
    year: 2018,
    context: "Google CEO",
  },
  {
    text: "The development of full artificial intelligence could spell the end of the human race... It would take off on its own, and re-design itself at an ever-increasing rate.",
    author: "Stephen Hawking",
    year: 2014,
    context: "BBC Interview",
  },
]

export function AIQuoteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextQuote = () => {
    setCurrentIndex((prev) => (prev + 1) % quotes.length)
    setIsAutoPlaying(false)
  }

  const prevQuote = () => {
    setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length)
    setIsAutoPlaying(false)
  }

  const currentQuote = quotes[currentIndex]

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-chart-3/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <RevealAnimation direction="up" className="max-w-4xl mx-auto">
          <CinematicCard className="relative overflow-hidden" glowEffect>
            <div className="absolute top-4 left-4 text-primary/20">
              <Quote className="w-12 h-12" />
            </div>

            <div className="relative z-10 pt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center space-y-6"
                >
                  <blockquote className="text-lg md:text-xl lg:text-2xl font-medium text-foreground leading-relaxed">
                    &ldquo;{currentQuote.text}&rdquo;
                  </blockquote>

                  <div className="space-y-2">
                    <div className="text-primary font-semibold">{currentQuote.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentQuote.context} • {currentQuote.year}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <motion.button
                  onClick={prevQuote}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex space-x-2">
                  {quotes.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index)
                        setIsAutoPlaying(false)
                      }}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={nextQuote}
                  className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </CinematicCard>
        </RevealAnimation>
      </div>
    </section>
  )
}
