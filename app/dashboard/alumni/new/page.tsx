"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createAlumni } from "@/services/alumni-service"
import { getAcademicUnits } from "@/services/academic-unit-service"

// Define steps for the multi-step form
const STEPS = {
  BASIC_INFO: 0,
  QUALIFICATIONS: 1,
  EMPLOYMENT: 2,
  REVIEW: 3,
}

export default function NewAlumniPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC_INFO)
  const [isLoading, setIsLoading] = useState(false)
  const [academicUnits, setAcademicUnits] = useState<any[]>([])
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    academicUnit: "",
    program: "",
    passingYear: "",
    registrationNumber: "",

    // Qualifications
    qualifiedExams: {
      examName: "",
      rollNumber: "",
      certificateUrl: "",
    },

    // Employment & Education
    employment: {
      type: "",
      employerName: "",
      employerContact: "",
      employerEmail: "",
      documentUrl: "",
    },
    higherEducation: {
      institutionName: "",
      programName: "",
      documentUrl: "",
    },
    contactDetails: {
      email: "",
      phone: "",
      address: "",
    },
  })

  // Fetch academic units on component mount
  useState(() => {
    const fetchAcademicUnits = async () => {
      try {
        const units = await getAcademicUnits()
        setAcademicUnits(units)
      } catch (error) {
        console.error("Error fetching academic units:", error)
        toast.error("Failed to load academic units")
      }
    }

    fetchAcademicUnits()
  }, [])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle nested object change
  const handleNestedChange = (parent: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  // Handle next step
  const handleNext = () => {
    // Validate current step
    if (currentStep === STEPS.BASIC_INFO) {
      if (
        !formData.name ||
        !formData.academicUnit ||
        !formData.program ||
        !formData.passingYear ||
        !formData.registrationNumber
      ) {
        toast.error("Please fill in all required fields")
        return
      }
    }

    // Move to next step
    setCurrentStep((prev) => prev + 1)

    // Scroll to top
    window.scrollTo(0, 0)
  }

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createAlumni(formData)
      toast.success("Alumni record created successfully")
      router.push("/dashboard/alumni")
    } catch (error) {
      console.error("Error creating alumni:", error)
      toast.error("Failed to create alumni record")
    } finally {
      setIsLoading(false)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter alumni name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicUnit">
                Academic Unit <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.academicUnit}
                onValueChange={(value) => handleSelectChange("academicUnit", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic unit" />
                </SelectTrigger>
                <SelectContent>
                  {academicUnits.map((unit) => (
                    <SelectItem key={unit._id} value={unit.name}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">
                Program <span className="text-red-500">*</span>
              </Label>
              <Input
                id="program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                placeholder="e.g., BCA, MCA, B.Tech"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passingYear">
                Passing Year <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.passingYear} onValueChange={(value) => handleSelectChange("passingYear", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select passing year" />
                </SelectTrigger>
                <SelectContent>
                  {["2016-17", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24"].map(
                    (year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">
                Registration Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="Enter registration number"
                required
              />
              <p className="text-xs text-muted-foreground">Enter the registration number as per university records</p>
            </div>
          </div>
        )

      case STEPS.QUALIFICATIONS:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="examName">Qualified Exam Name</Label>
              <Input
                id="examName"
                name="examName"
                value={formData.qualifiedExams.examName}
                onChange={(e) => handleNestedChange("qualifiedExams", "examName", e.target.value)}
                placeholder="e.g., GATE, NET, CAT"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                name="rollNumber"
                value={formData.qualifiedExams.rollNumber}
                onChange={(e) => handleNestedChange("qualifiedExams", "rollNumber", e.target.value)}
                placeholder="Enter roll number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateUrl">Certificate URL</Label>
              <Input
                id="certificateUrl"
                name="certificateUrl"
                value={formData.qualifiedExams.certificateUrl}
                onChange={(e) => handleNestedChange("qualifiedExams", "certificateUrl", e.target.value)}
                placeholder="Link to certificate (if available)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.contactDetails.email}
                onChange={(e) => handleNestedChange("contactDetails", "email", e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.contactDetails.phone}
                onChange={(e) => handleNestedChange("contactDetails", "phone", e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.contactDetails.address}
                onChange={(e) => handleNestedChange("contactDetails", "address", e.target.value)}
                placeholder="Enter current address"
                rows={3}
              />
            </div>
          </div>
        )

      case STEPS.EMPLOYMENT:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Status</Label>
              <Select
                value={formData.employment.type}
                onValueChange={(value) => handleNestedChange("employment", "type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Self-employed">Self-employed</SelectItem>
                  <SelectItem value="Unemployed">Unemployed</SelectItem>
                  <SelectItem value="Student">Student (Higher Education)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.employment.type === "Employed" || formData.employment.type === "Self-employed") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input
                    id="employerName"
                    name="employerName"
                    value={formData.employment.employerName}
                    onChange={(e) => handleNestedChange("employment", "employerName", e.target.value)}
                    placeholder="Enter employer name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerContact">Employer Contact</Label>
                  <Input
                    id="employerContact"
                    name="employerContact"
                    value={formData.employment.employerContact}
                    onChange={(e) => handleNestedChange("employment", "employerContact", e.target.value)}
                    placeholder="Enter employer contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employerEmail">Employer Email</Label>
                  <Input
                    id="employerEmail"
                    name="employerEmail"
                    type="email"
                    value={formData.employment.employerEmail}
                    onChange={(e) => handleNestedChange("employment", "employerEmail", e.target.value)}
                    placeholder="Enter employer email"
                  />
                </div>
              </>
            )}

            {formData.employment.type === "Student" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    name="institutionName"
                    value={formData.higherEducation.institutionName}
                    onChange={(e) => handleNestedChange("higherEducation", "institutionName", e.target.value)}
                    placeholder="Enter institution name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programName">Program Name</Label>
                  <Input
                    id="programName"
                    name="programName"
                    value={formData.higherEducation.programName}
                    onChange={(e) => handleNestedChange("higherEducation", "programName", e.target.value)}
                    placeholder="Enter program name"
                  />
                </div>
              </>
            )}
          </div>
        )

      case STEPS.REVIEW:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name:</p>
                  <p>{formData.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Academic Unit:</p>
                  <p>{formData.academicUnit}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Program:</p>
                  <p>{formData.program}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Passing Year:</p>
                  <p>{formData.passingYear}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registration Number:</p>
                  <p>{formData.registrationNumber}</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium mb-2">Contact Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email:</p>
                  <p>{formData.contactDetails.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone:</p>
                  <p>{formData.contactDetails.phone || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address:</p>
                  <p>{formData.contactDetails.address || "Not provided"}</p>
                </div>
              </div>
            </div>

            {formData.qualifiedExams.examName && (
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-medium mb-2">Qualifications</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Exam Name:</p>
                    <p>{formData.qualifiedExams.examName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Roll Number:</p>
                    <p>{formData.qualifiedExams.rollNumber || "Not provided"}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium mb-2">Employment Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status:</p>
                  <p>{formData.employment.type || "Not provided"}</p>
                </div>

                {(formData.employment.type === "Employed" || formData.employment.type === "Self-employed") && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Employer:</p>
                      <p>{formData.employment.employerName || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employer Contact:</p>
                      <p>{formData.employment.employerContact || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employer Email:</p>
                      <p>{formData.employment.employerEmail || "Not provided"}</p>
                    </div>
                  </>
                )}

                {formData.employment.type === "Student" && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Institution:</p>
                      <p>{formData.higherEducation.institutionName || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Program:</p>
                      <p>{formData.higherEducation.programName || "Not provided"}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between">
          {["Basic Information", "Qualifications", "Employment & Education", "Review"].map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {index + 1}
              </div>
              <span className="mt-2 text-xs">{step}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 h-1 w-full bg-muted">
          <div
            className="h-1 bg-primary transition-all"
            style={{ width: `${((currentStep + 1) / Object.keys(STEPS).length) * 100}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Add New Alumni</h1>

      {renderStepIndicator()}

      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-6">
          {currentStep === STEPS.BASIC_INFO && "Basic Information"}
          {currentStep === STEPS.QUALIFICATIONS && "Qualifications & Contact Details"}
          {currentStep === STEPS.EMPLOYMENT && "Employment & Higher Education"}
          {currentStep === STEPS.REVIEW && "Review Information"}
        </h2>

        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          <div className="mt-8 flex justify-between">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/alumni")}>
                Cancel
              </Button>
            )}

            {currentStep < STEPS.REVIEW ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

