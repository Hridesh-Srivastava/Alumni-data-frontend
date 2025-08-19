"use client"

import { useEffect, useRef, useState } from "react"
import Typed from "typed.js"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import CountUp from "react-countup"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Sparkles, Network, Users, Database, TrendingUp } from "lucide-react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // typed.js ref
  const typedRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!typedRef.current) return
    const typed = new Typed(typedRef.current, {
      strings: ["SST Alumni Data Collection"],
      typeSpeed: 90, 
      backSpeed: 50,
      backDelay: 1500,
      loop: true,
      smartBackspace: true,
      showCursor: true,
      cursorChar: "|",
    })
    return () => {
      typed.destroy()
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Particles configuration
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted py-20 md:py-28 lg:py-32"
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-primary/30 dark:bg-primary/20"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -700],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`,
          }}
        />
        <svg className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.rect
            width="100%"
            height="100%"
            fill="url(#grid-gradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 2 }}
          />
          <motion.g
            stroke="hsl(var(--primary))"
            strokeOpacity="0.1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 2 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.line
                key={`h-${i}`}
                x1="0"
                y1={i * 100}
                x2="100%"
                y2={i * 100}
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: i * 0.05 }}
              />
            ))}
            {[...Array(20)].map((_, i) => (
              <motion.line
                key={`v-${i}`}
                x1={i * 100}
                y1="0"
                x2={i * 100}
                y2="100%"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: i * 0.05 }}
              />
            ))}
          </motion.g>
        </svg>
      </div>

      {/* 3D Floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-40 w-40 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-3xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: "blur(40px)",
            }}
            animate={{
              y: [0, Math.random() * 50 - 25],
              x: [0, Math.random() * 50 - 25],
              scale: [1, Math.random() * 0.4 + 0.8],
              rotate: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div className="container relative z-10 px-4 md:px-6" style={{ y, opacity }}>
        <motion.div
          className="mx-auto max-w-4xl space-y-10 text-center"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
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
                <span className="text-sm font-medium text-primary">Connecting Graduates</span>
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl/none lg:text-7xl"
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
                <span className="relative z-10 bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent" ref={typedRef} />
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
            </motion.h1>

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
              Connecting graduates from the School of Science and Technology. Join our growing network of successful
              alumni.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
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
            <Link href="/login">
              <Button
                size="lg"
                className="group relative overflow-hidden rounded-full px-8 py-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <motion.span
                  className="absolute inset-0 z-0 bg-gradient-to-r from-primary to-primary/80"
                  whileHover={{
                    background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 100%)",
                  }}
                  transition={{ duration: 0.5 }}
                />
                <span className="relative z-10 flex items-center gap-2 text-primary-foreground">
                  Admin Login
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </span>
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="group relative overflow-hidden rounded-full border-primary/30 bg-primary/5 px-8 py-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/10"
              >
                <span className="relative z-10">Contact Us</span>
                <motion.span
                  className="absolute inset-0 z-0 opacity-0 bg-primary/10"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
            </Link>
          </motion.div>

          {/* Professional Network Visualization */}
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
                },
              },
            }}
            className="mx-auto mt-8 flex max-w-3xl flex-col items-center"
          >
            <div className="relative h-[200px] w-[300px]">
              {/* Central hub */}
              <motion.div
                className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 40px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <Network className="h-8 w-8 text-primary-foreground" />
                </div>
              </motion.div>

              {/* Surrounding nodes */}
              {[
                { icon: Users, angle: 0, delay: 0 },
                { icon: Database, angle: 72, delay: 0.2 },
                { icon: TrendingUp, angle: 144, delay: 0.4 },
                { icon: Network, angle: 216, delay: 0.6 },
                { icon: Sparkles, angle: 288, delay: 0.8 },
              ].map((node, index) => {
                const radius = 80
                const x = Math.cos((node.angle * Math.PI) / 180) * radius
                const y = Math.sin((node.angle * Math.PI) / 180) * radius

                return (
                  <motion.div
                    key={index}
                    className="absolute h-10 w-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-md border border-primary/20"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: node.delay,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 100,
                    }}
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <node.icon className="h-5 w-5 text-primary" />
                    </div>

                    {/* Connection lines */}
                    <motion.div
                      className="absolute left-1/2 top-1/2 h-0.5 bg-gradient-to-r from-primary/40 to-transparent"
                      style={{
                        width: `${radius}px`,
                        transformOrigin: "left center",
                        transform: `translate(-50%, -50%) rotate(${node.angle + 180}deg)`,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        delay: node.delay + 0.5,
                        duration: 0.8,
                      }}
                    />
                  </motion.div>
                )
              })}
            </div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="mt-4"
            >
              <ChevronDown className="h-6 w-6 text-primary" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats section */}
        <motion.div
          className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-4"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
                delayChildren: 0.8,
              },
            },
          }}
        >
          {[
            { value: 1000, label: "Graduates", icon: "👨‍🎓" },
            { value: 85, label: "Placement Rate", suffix: "%", icon: "🚀" },
            { value: 30, label: "Countries", icon: "🌎" },
            { value: 25, label: "Years", icon: "⏱️" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-lg border border-border/50 p-6 text-center transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10"
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
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <motion.div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-primary/80"
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative z-10 mb-2 text-2xl">{stat.icon}</div>
              <div className="relative z-10 text-3xl font-bold text-foreground md:text-4xl">
                {isVisible && (
                  <CountUp end={stat.value} duration={2.5} suffix={stat.suffix || "+"} enableScrollSpy scrollSpyOnce />
                )}
              </div>
              <div className="relative z-10 mt-2 text-sm font-medium text-primary">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <motion.div
          className="flex h-12 w-6 items-start justify-center rounded-full border border-primary/30 p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div
            className="h-2 w-2 rounded-full bg-primary"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
