import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactForm } from "@/components/contact-form"
import { MapPin, Phone, Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-muted py-12 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl space-y-6 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Contact Us</h1>
              <p className="mx-auto max-w-3xl text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have questions about our alumni network or need assistance? Get in touch with us.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-medium">Address</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Swami Rama Himalayan University
                        <br />
                        Jolly Grant, Dehradun
                        <br />
                        Uttarakhand, India - 248016
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-medium">Phone</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        +91-135-2471100
                        <br />
                        +91-135-2471150
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        info@srhu.edu.in
                        <br />
                        alumni@srhu.edu.in
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-card p-6 shadow-lg">
                  <h3 className="font-medium">Office Hours</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 5:00 PM
                    <br />
                    Saturday: 9:00 AM - 1:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-card p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-bold">Send us a message</h3>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 bg-background">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl">
              <div className="aspect-video overflow-hidden rounded-lg">
                {/* Updated Google Maps embed with correct coordinates for Swami Rama Himalayan University */}
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3445.8901776079136!2d78.18600757523961!3d30.268799681816385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092b9518e2fecd%3A0x87ba2f66716c7f99!2sSwami%20Rama%20Himalayan%20University!5e0!3m2!1sen!2sin!4v1716422400000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="SRHU Map"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

