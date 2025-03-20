import { GraduationCap, Database, Search, Users } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      title: "Comprehensive Alumni Database",
      description:
        "Maintain detailed records of all HSST graduates, including their academic achievements and career progression.",
    },
    {
      icon: <Database className="h-10 w-10 text-primary" />,
      title: "Secure Data Management",
      description:
        "State-of-the-art security measures to protect alumni information with controlled access for administrators.",
    },
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Advanced Search Capabilities",
      description: "Quickly find alumni records using various parameters like name, batch, program, or department.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Alumni Network Building",
      description: "Foster connections between graduates and the institution to build a strong professional network.",
    },
  ]

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-background">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-5xl space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Our alumni data collection system offers powerful tools to manage and maintain connections with HSST
            graduates.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center space-y-4 rounded-lg bg-card p-6 text-center shadow-lg"
            >
              {feature.icon}
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

