import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-muted py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About HSST</h1>
                <p className="mt-4 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  The Himalayan School of Science and Technology (HSST) is a premier institution under Swami Rama
                  Himalayan University (SRHU), dedicated to providing quality education in the fields of science,
                  engineering, and technology.
                </p>
                <p className="mt-4 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Established with a vision to create a center of excellence for technical education, HSST has been at
                  the forefront of nurturing talent and producing skilled professionals who contribute significantly to
                  the technological advancement of society.
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <h3 className="text-xl font-bold">Our Mission</h3>
                  <p className="mt-2 text-muted-foreground">
                    To provide quality education in science and technology that prepares students for successful careers
                    and lifelong learning.
                  </p>
                </div>
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <h3 className="text-xl font-bold">Our Vision</h3>
                  <p className="mt-2 text-muted-foreground">
                    To be recognized as a center of excellence in science and technology education, research, and
                    innovation.
                  </p>
                </div>
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <h3 className="text-xl font-bold">Our Values</h3>
                  <p className="mt-2 text-muted-foreground">
                    Excellence, integrity, innovation, inclusivity, and social responsibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-16 lg:py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl space-y-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Alumni Network</h2>
              <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our alumni are our pride and the true ambassadors of HSST. They have excelled in various fields and
                continue to make significant contributions to society.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-muted p-6 text-center">
                <div className="text-4xl font-bold text-primary">1000+</div>
                <div className="text-xl font-medium">Graduates</div>
                <p className="text-sm text-muted-foreground">Successful alumni across the globe</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-muted p-6 text-center">
                <div className="text-4xl font-bold text-primary">85%</div>
                <div className="text-xl font-medium">Placement Rate</div>
                <p className="text-sm text-muted-foreground">In top companies and organizations</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-muted p-6 text-center">
                <div className="text-4xl font-bold text-primary">50+</div>
                <div className="text-xl font-medium">Countries</div>
                <p className="text-sm text-muted-foreground">Where our alumni are making an impact</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

