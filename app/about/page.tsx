"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
} from "framer-motion";
import Image from "next/image";
import {
  ChevronDown,
  Users,
  Award,
  BookOpen,
  MapPin,
  Calendar,
  Eye,
  ArrowRight,
  ExternalLink,
  ChevronUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";

// Types
type Stat = {
  value: number;
  label: string;
  description: string;
  suffix?: string;
  icon: React.ReactNode;
};

type TimelineItem = {
  year: string;
  title: string;
  description: string;
};

type Testimonial = {
  id: number;
  name: string;
  education: string;
  quote: string;
  avatar: string;
};


type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type GalleryImage = {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
};

type FAQ = {
  question: string;
  answer: string;
};

// Data
const stats: Stat[] = [
  {
    value: 1000,
    label: "Graduates",
    description: "Successful alumni across the globe",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    value: 85,
    label: "Placement Rate",
    description: "In top companies and organizations",
    suffix: "%",
    icon: <Award className="h-6 w-6 text-primary" />,
  },
  {
    value: 30,
    label: "Countries",
    description: "Where our alumni are making an impact",
    icon: <MapPin className="h-6 w-6 text-primary" />,
  },
  {
    value: 25,
    label: "Years",
    description: "Of academic excellence and innovation",
    icon: <Calendar className="h-6 w-6 text-primary" />,
  },
];

const timelineData: TimelineItem[] = [
  {
    year: "1998",
    title: "Foundation",
    description:
      "School of Science and Technology was established with a vision to provide quality education.",
  },
  {
    year: "2005",
    title: "Expansion",
    description:
      "Added new departments and expanded the campus infrastructure to accommodate growing student body.",
  },
  {
    year: "2010",
    title: "Research Center",
    description:
      "Established a dedicated research center to foster innovation and technological advancement.",
  },
  {
    year: "2015",
    title: "International Recognition",
    description:
      "Received international accreditation and established partnerships with global universities.",
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description:
      "Implemented comprehensive digital learning platforms and virtual laboratories.",
  },
];

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Atul Rawat",
    education: " B.Tech CSE ,  M.tech IIT(delhi)",
    quote:
      '"At the end of my journey in SRHU, I had a job offer from TCS. I also qualified GATE with a good All India Rank & had admission offers to pursue Masters from NIITs and IITs. Currently, I am pursuing my M.Tech from IIT Dehli in the field of data engineering."',
    avatar: "/Atul-Rawat-alumni1.png?height=80&width=80",
  },
  {
    id: 2,
    name: "Hritik Saxena",
    education: "BCA",
    quote:
      '"With a robust academic environment, state of the art infrastructure & lush green campus along with experienced intellectuals as faculty, SRHU encourages students to always give their best. I am a proud SRHUian."',
    avatar: "/Hrithik-Saxena-alumni2.jpg?height=80&width=80",
  },
  {
    id: 3,
    name: "Manvendra Singh Suriyal",
    education: "B.Tech CSE",
    quote:
      '"My four years of B.Tech CSE at SRHU Dehradun are one of the best four years of my life till date. These four years were full of great learning which have resulted in starting my career from one of the premier organizations. I will cherish these memories for lifetime."',
    avatar: "/Manvendra-Singh-Suriyal-Alumni3.jpg?height=80&width=80",
  },
  {
    id: 4,
    name: "Dikshant Jadeji",
    education: "B.Tech CSE",
    quote:
      '"Currently, I am working with SAP technology & as an ABAP Developer at TCS Bangalore. I have been fortunate to be part of SRHU. In 4 years, we were groomed to be full-fledged professionals. With the quality learning, personality development & enhanced skills, I was able to notch up job offers from TCS and Infosys."',
    avatar: "/Dikshant-Jajedi-alumni4.png?height=80&width=80",
  },
];

const achievements: Achievement[] = [
  {
    id: 1,
    title: "National Excellence Award",
    description:
      "Recognized for outstanding contribution to technical education",
    icon: <Award className="h-8 w-8" />,
  },
  {
    id: 2,
    title: "Research Publications",
    description: "Over 500 research papers published in international journals",
    icon: <BookOpen className="h-8 w-8" />,
  },
  {
    id: 3,
    title: "Industry Partnerships",
    description: "Collaborations with 50+ leading technology companies",
    icon: <Users className="h-8 w-8" />,
  },
];

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "/drone-view-campus.jpg?height=400&width=600",
    alt: "Campus view",
    width: 600,
    height: 400,
  },
  {
    id: 2,
    src: "/3-3.webp?height=400&width=600",
    alt: "Student library",
    width: 600,
    height: 400,
  },
  {
    id: 3,
    src: "/4-3.webp?height=400&width=600",
    alt: "Student activities",
    width: 600,
    height: 400,
  },
  {
    id: 4,
    src: "/1-3.webp?height=400&width=600",
    alt: "students view",
    width: 600,
    height: 400,
  },
  {
    id: 5,
    src: "/4-3-3.webp?height=400&width=600",
    alt: "Library",
    width: 600,
    height: 400,
  },
  {
    id: 6,
    src: "/img6.jpg?height=400&width=600",
    alt: "Sports facilities",
    width: 600,
    height: 400,
  },
];

const faqs: FAQ[] = [
  {
    question: "What programs does SST offer?",
    answer:
      "SST offers undergraduate and graduate programs in Computer Science, Electrical Engineering, Mechanical Engineering, Biotechnology, and Data Science. We also offer specialized certificate courses in emerging technologies.",
  },
  {
    question: "How can I apply for admission?",
    answer:
      "Applications can be submitted online through our admissions portal. The process includes submitting academic records, entrance exam scores, and a personal statement. Selected candidates will be called for an interview.",
  },
  {
    question: "Are scholarships available?",
    answer:
      "Yes, SST offers merit-based scholarships, need-based financial aid, and research fellowships. We also have special scholarships for women in STEM and students from underrepresented communities.",
  },
  {
    question: "What career services are provided?",
    answer:
      "Our Career Development Center offers resume workshops, interview preparation, industry connections, internship placements, and job fairs. We maintain strong relationships with employers and alumni to create opportunities for our students.",
  },
  {
    question: "Does SST offer international exchange programs?",
    answer:
      "Yes, we have exchange programs with universities in the US, Europe, Australia, and Asia. Students can spend a semester abroad, participate in joint research projects, or attend international workshops and conferences.",
  },
];

// Components
const Card = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className="rounded-2xl bg-card p-6 shadow-lg border border-border/50 h-full"
  >
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="mt-2 text-muted-foreground">{description}</p>
  </motion.div>
);

const ParallaxSection = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <motion.div ref={ref} style={{ y }} className="relative">
      {children}
    </motion.div>
  );
};

const ScrollReveal = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

const TimelineItem = ({
  item,
  index,
}: {
  item: TimelineItem;
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={
        isInView
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }
      }
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="relative flex items-start gap-6 pb-10"
    >
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold">
          {item.year}
        </div>
        {index < timelineData.length - 1 && (
          <div className="h-full w-0.5 bg-border mt-2" />
        )}
      </div>
      <div className="flex-1 pt-1.5">
        <h3 className="text-xl font-bold">{item.title}</h3>
        <p className="mt-1 text-muted-foreground">{item.description}</p>
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex flex-col gap-4 rounded-xl bg-card p-6 shadow-md border border-border/50"
  >
    <div className="flex items-center gap-4">
      <Image
        src={testimonial.avatar || "/placeholder.svg"}
        alt={testimonial.name}
        width={50}
        height={50}
        className="rounded-full"
      />
      <div>
        <h4 className="font-bold">{testimonial.name}</h4>
        <p className="text-sm text-muted-foreground">{testimonial.education}</p>
      </div>
    </div>
    <blockquote className="italic text-muted-foreground">
      {testimonial.quote}
    </blockquote>
  </motion.div>
);

const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex flex-col items-center gap-4 rounded-xl bg-card p-6 text-center shadow-md border border-border/50"
  >
    <div className="rounded-full bg-primary/10 p-4 text-primary">
      {achievement.icon}
    </div>
    <h3 className="text-xl font-bold">{achievement.title}</h3>
    <p className="text-muted-foreground">{achievement.description}</p>
  </motion.div>
);

const GalleryImage = ({
  image,
  onClick,
}: {
  image: GalleryImage;
  onClick: () => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="relative overflow-hidden rounded-xl cursor-pointer"
    onClick={onClick}
  >
    <Image
      src={image.src || "/placeholder.svg"}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className="object-cover w-full h-full"
    />
    <motion.div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
      <div className="rounded-full bg-white/20 p-3">
        <Eye className="h-6 w-6 text-white" />
      </div>
    </motion.div>
  </motion.div>
);

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-50"
      style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
    />
  );
};

export default function AboutPage() {
  const [displayStats, setDisplayStats] = useState(stats.map(() => 0));
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const { toast } = useToast();
  const isMobile = useMobile();

  // Refs for scroll navigation
  const heroRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const achievementsRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Scroll to section
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Stats counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayStats((prev) =>
        prev.map((val, idx) => {
          const target = stats[idx].value;
          if (val < target) {
            const increment = Math.ceil(target / 50);
            return val + increment > target ? target : val + increment;
          }
          return val;
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Email validation
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setIsEmailValid(false);
      return;
    }

    if (!validateEmail(email)) {
      setIsEmailValid(false);
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter",
    });

    setEmail("");
    setIsEmailValid(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollProgressBar />
      <Header />

      <main className="flex-1">
        {/* Hero Section with Parallax */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-muted py-24 md:py-32"
        >
          <div className="absolute inset-0 z-0">
            <ParallaxSection>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50" />
              <div className="absolute inset-0 bg-grid-white/10" />
            </ParallaxSection>
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-3 py-1 text-sm backdrop-blur-sm">
                  <span className="mr-2 rounded-full bg-primary h-2 w-2" />
                  Established 2013
                </div>
                <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  <a
                    href="https://srhu.edu.in/school-of-science-technology/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary text-blue-800 hover:text-gray-500"
                  >
                    About School of Science and Technology
                    
                  </a>
                </h1>
                <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
                  The School of Science and Technology (SST) under Swami Rama
                  Himalayan University offers premier education in science,
                  engineering, and technology — shaping tomorrow's innovators
                  and leaders.
                </p>
                <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                  Dedicated to technical excellence, SST nurtures talent and
                  produces globally competitive professionals contributing to
                  societal progress.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    onClick={() => scrollToSection(timelineRef)}
                    className="group"
                  >
                    Our Journey
                    <ChevronDown className="ml-2 h-4 w-4 transition-transform group-hover:rotate-180" />
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col justify-center space-y-5"
              >
                <Card
                  title="Our Mission"
                  description="To create highly skilled professionals for addressing the problems of industry and society through teaching and research in the areas of science, engineering, technology and allied disciplines."
                />
                <Card
                  title="Our Vision"
                  description="To be recognized as a distinguished school for the development of cutting-edge technology and innovation in emerging areas of science, engineering, technology and allied disciplines."
                />
                <Card
                  title="Our Values"
                  description="Excellence, integrity, innovation, Empowerment, Trust and Service."
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-16 flex justify-center"
            >
              <Button
                size="lg"
                variant="outline"
                className="group rounded-full border-primary/20 bg-background/80 backdrop-blur-sm"
                onClick={() => scrollToSection(timelineRef)}
              >
                <span>Explore More</span>
                <ChevronDown className="ml-2 h-5 w-5 transition-transform group-hover:translate-y-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section with Counter Animation */}
        <ScrollReveal>
          <section className="py-20 bg-background">
            <div className="container px-4 md:px-6">
              <div className="mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl">
                {stats.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className="flex flex-col items-center space-y-2 rounded-xl bg-muted p-6 text-center shadow-sm"
                  >
                    <div className="mb-2">{item.icon}</div>
                    <div className="text-4xl font-bold text-primary">
                      {displayStats[idx]}
                      {item.suffix || ""}
                    </div>
                    <div className="text-xl font-medium">{item.label}</div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Timeline Section */}
        <ScrollReveal>
          <section ref={timelineRef} className="py-24 bg-muted">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Our Journey
                </h2>
                <p className="mt-4 text-muted-foreground text-lg">
                  From our humble beginnings to becoming a leading institution
                  in science and technology education.
                </p>
              </div>

              <div className="mx-auto max-w-4xl">
                {timelineData.map((item, index) => (
                  <TimelineItem key={index} item={item} index={index} />
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Testimonials Section */}
        <ScrollReveal>
          <section className="py-24 bg-background">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Alumni Testimonials
                </h2>
                <p className="mt-4 text-muted-foreground text-lg">
                  Hear from our graduates about their experiences and how SST
                  shaped their careers.
                </p>
              </div>

              <div className="mx-auto max-w-5xl">
                <div className="relative h-[300px] overflow-hidden">
                  <AnimatePresence mode="wait">
                    {testimonials.map(
                      (testimonial, index) =>
                        activeTestimonialIndex === index && (
                          <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center p-4"
                          >
                            <TestimonialCard testimonial={testimonial} />
                          </motion.div>
                        )
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-center gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonialIndex(index)}
                      className={`h-3 w-3 rounded-full ${
                        activeTestimonialIndex === index
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Faculty Section */}
        {/* <ScrollReveal>
          <section ref={facultyRef} className="py-24 bg-muted">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Our Faculty</h2>
                <p className="mt-4 text-muted-foreground text-lg">
                  Meet the dedicated professors and researchers who make SST a center of excellence.
                </p>
              </div>

              <div className="mx-auto max-w-6xl">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="mx-auto mb-8 flex justify-center">
                    <TabsTrigger value="all">All Faculty</TabsTrigger>
                    <TabsTrigger value="engineering">Engineering</TabsTrigger>
                    <TabsTrigger value="science">Science</TabsTrigger>
                    <TabsTrigger value="research">Research</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {facultyMembers.map((faculty) => (
                        <FacultyCard key={faculty.id} faculty={faculty} />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="engineering" className="mt-0">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <FacultyCard faculty={facultyMembers[0]} />
                    </div>
                  </TabsContent>

                  <TabsContent value="science" className="mt-0">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <FacultyCard faculty={facultyMembers[1]} />
                    </div>
                  </TabsContent>

                  <TabsContent value="research" className="mt-0">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      <FacultyCard faculty={facultyMembers[2]} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </section>
        </ScrollReveal> */}

        {/* Achievements Section */}
        <ScrollReveal>
          <section ref={achievementsRef} className="py-24 bg-background">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Our Achievements
                </h2>
                <p className="mt-4 text-muted-foreground text-lg">
                  Recognitions and milestones that highlight our commitment to
                  excellence.
                </p>
              </div>

              <div className="mx-auto max-w-5xl">
                <div className="grid gap-8 md:grid-cols-3">
                  {achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Campus Gallery */}
        <ScrollReveal>
          <section ref={galleryRef} className="py-24 bg-muted">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Campus Gallery
                </h2>
                <p className="mt-4 text-muted-foreground text-lg">
                  Explore our state-of-the-art facilities and vibrant campus
                  life.
                </p>
              </div>

              <div className="mx-auto max-w-6xl">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {galleryImages.map((image) => (
                    <GalleryImage
                      key={image.id}
                      image={image}
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* FAQ Section */}
        <ScrollReveal>
          <section ref={faqRef} className="py-24 bg-background">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h2>
                <p className="mt-4 text-muted-foreground text-lg">
                  Find answers to common questions about admissions, programs,
                  and campus life.
                </p>
              </div>

              <div className="mx-auto max-w-3xl">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Newsletter Section
        <ScrollReveal>
          <section className="py-24 bg-muted">
            <div className="container px-4 md:px-6">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Stay Updated</h2>
                <p className="mt-4 text-muted-foreground text-lg">
                  Subscribe to our newsletter for the latest news, events, and updates from SST.
                </p>

                <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setIsEmailValid(true)
                      }}
                      className={!isEmailValid ? "border-destructive" : ""}
                    />
                    {!isEmailValid && (
                      <p className="mt-1 text-sm text-destructive text-left">Please enter a valid email address</p>
                    )}
                  </div>
                  <Button type="submit">Subscribe</Button>
                </form>
              </div>
            </div>
          </section>
        </ScrollReveal> */}

        {/* Back to Top Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ChevronUp className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Lightbox for Gallery Images */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="relative max-h-[80vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selectedImage.src || "/placeholder.svg"}
                  alt={selectedImage.alt}
                  width={selectedImage.width}
                  height={selectedImage.height}
                  className="max-h-[80vh] rounded-lg object-contain"
                />
                <button
                  className="absolute -top-4 -right-4 flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground shadow-lg"
                  onClick={() => setSelectedImage(null)}
                >
                  &times;
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
