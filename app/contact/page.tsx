"use client"

import { useRef, useEffect } from "react"
import Typed from "typed.js"
import { motion, useInView } from "framer-motion"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Phone, Mail, Clock, MessageCircle, Users, Globe, Sparkles } from "lucide-react"

export default function ContactPage() {
  const heroRef = useRef(null)
  const contactTypedRef = useRef<HTMLSpanElement | null>(null)
  const formRef = useRef(null)
  const mapRef = useRef(null)

  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 })
  const isFormInView = useInView(formRef, { once: true, amount: 0.3 })
  const isMapInView = useInView(mapRef, { once: true, amount: 0.3 })

  // typed.js init
  useEffect(() => {
    if (!contactTypedRef.current) return
    const typed = new Typed(contactTypedRef.current, {
      strings: ["Contact Us"],
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 1500,
      loop: true,
      smartBackspace: true,
      showCursor: true,
      cursorChar: "|",
    })
    return () => typed.destroy()
  }, [])

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Address",
      details: ["Swami Rama Himalayan University", "Jolly Grant, Dehradun", "Uttarakhand, India - 248016"],
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone",
      details: ["01352471266", "01352471150"],
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: ["info@srhu.edu.in", "sshset2013@gmail.com"],
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Office Hours",
      details: ["Monday - Friday: 9:00 AM - 5:00 PM", "Saturday: 9:00 AM - 1:00 PM", "Sunday: Closed"],
    },
  ]

  const stats = [
    { icon: <MessageCircle className="h-8 w-8" />, value: "24/7", label: "Support Available" },
    { icon: <Users className="h-8 w-8" />, value: "1000+", label: "Alumni Connected" },
    { icon: <Globe className="h-8 w-8" />, value: "30+", label: "Countries Reached" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted py-24 md:py-32"
        >
          {/* Animated background */}
          <div className="absolute inset-0">
            <svg className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="contact-grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <motion.g
                stroke="url(#contact-grid-gradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
              >
                {[...Array(20)].map((_, i) => (
                  <motion.line
                    key={`h-${i}`}
                    x1="0"
                    y1={i * 50}
                    x2="100%"
                    y2={i * 50}
                    strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: i * 0.02 }}
                  />
                ))}
                {[...Array(30)].map((_, i) => (
                  <motion.line
                    key={`v-${i}`}
                    x1={i * 50}
                    y1="0"
                    x2={i * 50}
                    y2="100%"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: i * 0.02 }}
                  />
                ))}
              </motion.g>
            </svg>
          </div>

          {/* Floating elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-32 w-32 rounded-full bg-primary/5"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, Math.random() * 50 - 25],
                  x: [0, Math.random() * 50 - 25],
                  scale: [1, Math.random() * 0.3 + 0.8],
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

          <div className="container relative z-10 px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial="hidden"
              animate={isHeroInView ? "visible" : "hidden"}
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
                className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 backdrop-blur-md border border-primary/20"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Get In Touch</span>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <span className="relative">
                  <span ref={contactTypedRef} className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent" />
                  <motion.span
                    className="absolute -inset-1 block rounded-lg bg-primary/20 blur-2xl"
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
                className="mx-auto mt-6 max-w-3xl text-muted-foreground md:text-xl/relaxed"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                Have questions about our alumni network or need assistance? Get in touch with us.
              </motion.p>

              {/* Stats */}
              <motion.div
                className="mt-12 grid gap-6 sm:grid-cols-3"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.5,
                    },
                  },
                }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="rounded-xl bg-card/50 backdrop-blur-lg border border-border/50 p-6 text-center"
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Form and Info Section */}
        <section ref={formRef} className="py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2"
              initial="hidden"
              animate={isFormInView ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.3,
                  },
                },
              }}
            >
              {/* Contact Information */}
              <motion.div
                className="space-y-8"
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
                  <p className="text-muted-foreground text-lg">
                    We're here to help and answer any questions you might have. We look forward to hearing from you.
                  </p>
                </div>

                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      className="group rounded-xl bg-card/50 backdrop-blur-lg border border-border/50 p-6 transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                          <div className="space-y-1">
                            {info.details.map((detail, detailIndex) => (
                              <p key={detailIndex} className="text-sm text-muted-foreground">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                className="rounded-2xl bg-card/50 backdrop-blur-lg border border-border/50 p-8"
                variants={{
                  hidden: { opacity: 0, x: 50 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <h3 className="text-2xl font-bold text-foreground mb-6">Send us a message</h3>
                <ContactForm />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Map Section */}
        <section ref={mapRef} className="py-24 bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-6xl"
              initial="hidden"
              animate={isMapInView ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Find Us</h2>
                <p className="text-muted-foreground text-lg">
                  Visit our campus and experience the vibrant academic environment firsthand.
                </p>
              </div>

              <motion.div
                className="aspect-video overflow-hidden rounded-2xl border border-border/50 shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3120.8219681239984!2d78.16493377501617!3d30.190831911621057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390924dc8a731ca5%3A0x862f6f008f38d092!2sSwami%20Rama%20Himalayan%20University%20(SRHU)!5e1!3m2!1sen!2sin!4v1742756216226!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="SRHU Map"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="transition-all duration-300 hover:brightness-110"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
