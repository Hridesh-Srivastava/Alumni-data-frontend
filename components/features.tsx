"use client"

import { useRef, useState } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { GraduationCap, Database, Search, Users, ArrowRight, ExternalLink, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <GraduationCap className="h-10 w-10" />,
      title: "Comprehensive Alumni Database",
      description:
        "Maintain detailed records of all SST graduates, including their academic achievements and career progression.",
    },
    {
      icon: <Database className="h-10 w-10" />,
      title: "Secure Data Management",
      description:
        "State-of-the-art security measures to protect alumni information with controlled access for administrators.",
    },
    {
      icon: <Search className="h-10 w-10" />,
      title: "Advanced Search Capabilities",
      description: "Quickly find alumni records using various parameters like name, batch, program, or department.",
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: "Alumni Network Building",
      description: "Foster connections between graduates and the institution to build a strong professional network.",
    },
  ]

  return (
    <section ref={ref} className="relative overflow-hidden bg-muted/50 py-20 md:py-28 lg:py-32">
      {/* Animated background */}
      <div className="absolute inset-0">
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <pattern
              id="grid-pattern"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <motion.path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeOpacity="0.1"
                strokeWidth="0.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2 }}
              />
            </pattern>
            <radialGradient id="radial-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          <motion.circle
            cx="50%"
            cy="50%"
            r="50%"
            fill="url(#radial-gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
          />
        </svg>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-20 w-20 rounded-full bg-primary/5"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() + 0.5],
              rotate: [0, Math.random() * 360],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          className="mx-auto max-w-5xl space-y-10 text-center"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
              },
            },
          }}
        >
          <motion.div
            className="space-y-4"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
          >
            <motion.div
              className="mx-auto flex items-center justify-center"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                },
              }}
            >
              <motion.div
                className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 backdrop-blur-md border border-primary/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Powerful Tools</span>
              </motion.div>
            </motion.div>

            <motion.h2
              className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                },
              }}
            >
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                  Features
                </span>
                <motion.span
                  className="absolute -inset-1 z-0 block rounded-lg bg-primary/20 blur-2xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              </span>
            </motion.h2>

            <motion.p
              className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                },
              }}
            >
              Our alumni data collection system offers powerful tools to manage and maintain connections with SST
              graduates.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.5,
                },
              },
            }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-card/50 backdrop-blur-lg border border-border/50 p-8 text-center transition-all duration-500 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10"
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 12,
                    },
                  },
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Background effects */}
                <motion.div
                  className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-primary/80"
                  animate={{ width: hoveredFeature === index ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                  <motion.div
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary backdrop-blur-md border border-primary/20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {feature.icon}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        boxShadow:
                          hoveredFeature === index
                            ? "0 0 20px 2px hsl(var(--primary) / 0.5)"
                            : "0 0 0px 0px hsl(var(--primary) / 0)",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>

                  <AnimatePresence>
                    {hoveredFeature === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 flex items-center justify-center"
                      >
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  delay: 1,
                },
              },
            }}
            className="mt-10 flex justify-center"
          >
          </motion.div>
        </motion.div>
      </div>

      {/* Animated dots */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full opacity-30">
          <pattern id="dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="hsl(var(--primary))" fillOpacity="0.3" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-pattern)" />
        </svg>
      </div>

      {/* Animated glow */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/20 blur-[120px]"
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </section>
  )
}
