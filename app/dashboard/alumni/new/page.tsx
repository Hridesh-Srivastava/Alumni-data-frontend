"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createAlumni } from "@/services/alumni-service"
import { getAcademicUnits } from "@/services/academic-unit-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

// Define the form schema
const alumniFormSchema = z.object({
  // Basic Information
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  program: z.string().min(1, { message: "Program is required." }),
  passingYear: z.string().min(1, { message: "Passing year is required." }),
  registrationNumber: z.string().min(1, { message: "Registration number is required." }),

  // Contact Details
  contactDetails: z.object({
    email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
  }),

  // Qualified Exams
  qualifiedExams: z.object({
    examName: z.string().optional().or(z.literal("")),
    rollNumber: z.string().optional().or(z.literal("")),
  }),

  // Employment
  employment: z.object({
    type: z.string().optional().or(z.literal("")),
    employerName: z.string().optional().or(z.literal("")),
    employerContact: z.string().optional().or(z.literal("")),
    employerEmail: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal("")),
    selfEmploymentDetails: z.string().optional().or(z.literal("")),
  }),

  // Higher Education
  higherEducation: z.object({
    institutionName: z.string().optional().or(z.literal("")),
    programName: z.string().optional().or(z.literal("")),
  }),
})

type AlumniFormValues = z.infer<typeof alumniFormSchema>

export default function NewAlumniPage() {
  const [activeTab, setActiveTab] = useState("basic-information")
  const [academicUnits, setAcademicUnits] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // State for file uploads
  const [basicInfoImage, setBasicInfoImage] = useState<File | null>(null)
  const [qualificationImage, setQualificationImage] = useState<File | null>(null)
  const [employmentImage, setEmploymentImage] = useState<File | null>(null)

  // Define form with default values
  const form = useForm<AlumniFormValues>({
    resolver: zodResolver(alumniFormSchema),
    defaultValues: {
      name: "",
      program: "",
      passingYear: "",
      registrationNumber: "",
      contactDetails: {
        email: "",
        phone: "",
        address: "",
      },
      qualifiedExams: {
        examName: "",
        rollNumber: "",
      },
      employment: {
        type: "",
        employerName: "",
        employerContact: "",
        employerEmail: "",
        selfEmploymentDetails: "",
      },
      higherEducation: {
        institutionName: "",
        programName: "",
      },
    },
  })

  // Fetch academic units on component mount
  useEffect(() => {
    const fetchAcademicUnits = async () => {
      try {
        const data = await getAcademicUnits()
        setAcademicUnits(data)
      } catch (error) {
        console.error("Error fetching academic units:", error)
        toast.error("Failed to load academic units")
      }
    }

    fetchAcademicUnits()
  }, [])

  // Handle file changes
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  // Handle form submission
  const onSubmit = async (values: AlumniFormValues) => {
    setIsLoading(true)
    setError("")

    try {
      // Log the data being submitted
      console.log("Submitting alumni data:", values)

      // Create alumni record with files
      const formData = {
        ...values,
        basicInfoImage,
        qualificationImage,
        employmentImage,
        academicUnit: "Himalayan School of Science and Technology", // Always set to HSST
      }

      console.log("Form data prepared:", formData);

      // Call the createAlumni function with the form data
      const result = await createAlumni(formData)
      console.log("Alumni creation result:", result);

      toast.success("Alumni record created successfully")
      router.push("/dashboard/alumni")
    } catch (error) {
      console.error("Error creating alumni:", error)

      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to create alumni record. Please try again.")
      }

      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: "smooth" })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate passing year options (last 10 years)
  const currentYear = new Date().getFullYear()
  const passingYears = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - i
    return `${year - 1}-${year.toString().slice(-2)}`
  })

  // Handle tab navigation
  const goToNextTab = () => {
    if (activeTab === "basic-information") {
      setActiveTab("qualifications")
    } else if (activeTab === "qualifications") {
      setActiveTab("employment-education")
    } else if (activeTab === "employment-education") {
      setActiveTab("review")
    }
  }

  const goToPreviousTab = () => {
    if (activeTab === "review") {
      setActiveTab("employment-education")
    } else if (activeTab === "employment-education") {
      setActiveTab("qualifications")
    } else if (activeTab === "qualifications") {
      setActiveTab("basic-information")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Add New Alumni</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic-information">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Basic Information
              </TabsTrigger>
              <TabsTrigger value="qualifications">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Qualifications
              </TabsTrigger>
              <TabsTrigger value="employment-education">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                Employment & Education
              </TabsTrigger>
              <TabsTrigger value="review">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  4
                </span>
                Review
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic-information">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the alumni's basic details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="program"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. BCA, B.Tech, MBBS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passingYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Year*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select passing year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {passingYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. DD2017304002" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Basic Info File Upload */}
                  <div className="space-y-2">
                    <FormLabel>Upload Basic Info Document</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, setBasicInfoImage)}
                        className="flex-1"
                      />
                      {basicInfoImage && (
                        <div className="text-sm text-green-600">File selected: {basicInfoImage.name}</div>
                      )}
                    </div>
                    <FormDescription>Upload any supporting document for basic information (optional)</FormDescription>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={goToNextTab}>
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Details Tab */}
            <TabsContent value="qualifications">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details & Qualifications</CardTitle>
                  <CardDescription>Enter contact information and qualification details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-lg font-medium">Contact Details</h3>
                  <FormField
                    control={form.control}
                    name="contactDetails.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactDetails.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactDetails.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Current address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <h3 className="mt-6 text-lg font-medium">Qualified Exams</h3>
                  <FormField
                    control={form.control}
                    name="qualifiedExams.examName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exam Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. GATE, NET, CAT" {...field} />
                        </FormControl>
                        <FormDescription>Leave blank if not applicable</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualifiedExams.rollNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Exam roll number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Qualification File Upload */}
                  <div className="space-y-2">
                    <FormLabel>Upload Qualification Certificate</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, setQualificationImage)}
                        className="flex-1"
                      />
                      {qualificationImage && (
                        <div className="text-sm text-green-600">File selected: {qualificationImage.name}</div>
                      )}
                    </div>
                    <FormDescription>Upload certificate for qualified exams (optional)</FormDescription>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={goToPreviousTab}>
                      Previous
                    </Button>
                    <Button type="button" onClick={goToNextTab}>
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Employment & Education Tab */}
            <TabsContent value="employment-education">
              <Card>
                <CardHeader>
                  <CardTitle>Employment & Higher Education</CardTitle>
                  <CardDescription>Enter employment and higher education details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-lg font-medium">Employment</h3>
                  <FormField
                    control={form.control}
                    name="employment.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Employed">Employed</SelectItem>
                            <SelectItem value="Self-employed">Self-employed</SelectItem>
                            <SelectItem value="Unemployed">Unemployed</SelectItem>
                            <SelectItem value="Studying">Studying</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("employment.type") === "Employed" && (
                    <>
                      <FormField
                        control={form.control}
                        name="employment.employerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Company/Organization name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employment.employerContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Contact number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employment.employerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employer Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {form.watch("employment.type") === "Self-employed" && (
                    <FormField
                      control={form.control}
                      name="employment.selfEmploymentDetails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Self-employment Details</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Details about your business/freelance work" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Employment File Upload */}
                  <div className="space-y-2">
                    <FormLabel>Upload Employment Document</FormLabel>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, setEmploymentImage)}
                        className="flex-1"
                      />
                      {employmentImage && (
                        <div className="text-sm text-green-600">File selected: {employmentImage.name}</div>
                      )}
                    </div>
                    <FormDescription>Upload employment proof document (optional)</FormDescription>
                  </div>

                  <h3 className="mt-6 text-lg font-medium">Higher Education</h3>
                  <FormField
                    control={form.control}
                    name="higherEducation.institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of institution" {...field} />
                        </FormControl>
                        <FormDescription>Leave blank if not applicable</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="higherEducation.programName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Program Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. M.Tech, MBA, Ph.D" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" type="button" onClick={goToPreviousTab}>
                      Previous
                    </Button>
                    <Button type="button" onClick={goToNextTab}>
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review">
              <Card>
                <CardHeader>
                  <CardTitle>Review Information</CardTitle>
                  <CardDescription>Review all information before submitting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="mt-2 rounded-lg bg-muted p-4">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Name:</p>
                            <p className="col-span-2">{form.watch("name")}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Academic Unit:</p>
                            <p className="col-span-2">Himalayan School of Science and Technology</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Program:</p>
                            <p className="col-span-2">{form.watch("program")}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Passing Year:</p>
                            <p className="col-span-2">{form.watch("passingYear")}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Registration Number:</p>
                            <p className="col-span-2">{form.watch("registrationNumber")}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Basic Info Document:</p>
                            <p className="col-span-2">{basicInfoImage ? basicInfoImage.name : "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Contact Details</h3>
                      <div className="mt-2 rounded-lg bg-muted p-4">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Email:</p>
                            <p className="col-span-2">{form.watch("contactDetails.email") || "Not provided"}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Phone:</p>
                            <p className="col-span-2">{form.watch("contactDetails.phone") || "Not provided"}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Address:</p>
                            <p className="col-span-2">{form.watch("contactDetails.address") || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Qualifications</h3>
                      <div className="mt-2 rounded-lg bg-muted p-4">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Exam Name:</p>
                            <p className="col-span-2">{form.watch("qualifiedExams.examName") || "Not provided"}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Roll Number:</p>
                            <p className="col-span-2">{form.watch("qualifiedExams.rollNumber") || "Not provided"}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Certificate:</p>
                            <p className="col-span-2">
                              {qualificationImage ? qualificationImage.name : "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Employment</h3>
                      <div className="mt-2 rounded-lg bg-muted p-4">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Type:</p>
                            <p className="col-span-2">{form.watch("employment.type") || "Not provided"}</p>
                          </div>
                          {form.watch("employment.type") === "Employed" && (
                            <>
                              <div className="grid grid-cols-3 gap-1">
                                <p className="font-medium">Employer:</p>
                                <p className="col-span-2">{form.watch("employment.employerName") || "Not provided"}</p>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <p className="font-medium">Contact:</p>
                                <p className="col-span-2">
                                  {form.watch("employment.employerContact") || "Not provided"}
                                </p>
                              </div>
                              <div className="grid grid-cols-3 gap-1">
                                <p className="font-medium">Email:</p>
                                <p className="col-span-2">{form.watch("employment.employerEmail") || "Not provided"}</p>
                              </div>
                            </>
                          )}
                          {form.watch("employment.type") === "Self-employed" && (
                            <div className="grid grid-cols-3 gap-1">
                              <p className="font-medium">Details:</p>
                              <p className="col-span-2">
                                {form.watch("employment.selfEmploymentDetails") || "Not provided"}
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Document:</p>
                            <p className="col-span-2">{employmentImage ? employmentImage.name : "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium">Higher Education</h3>
                      <div className="mt-2 rounded-lg bg-muted p-4">
                        <div className="grid gap-2">
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Institution:</p>
                            <p className="col-span-2">
                              {form.watch("higherEducation.institutionName") || "Not provided"}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <p className="font-medium">Program:</p>
                            <p className="col-span-2">{form.watch("higherEducation.programName") || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" type="button" onClick={goToPreviousTab}>
                        Previous
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}