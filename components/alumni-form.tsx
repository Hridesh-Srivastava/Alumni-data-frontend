"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createAlumni, updateAlumni, getAlumniById } from "@/services/alumni-service"
import { getAcademicUnits } from "@/services/academic-unit-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface AlumniFormProps {
  initialData?: any
  isEditing?: boolean
  alumniId?: string
}

export function AlumniForm({ initialData, isEditing = false, alumniId }: AlumniFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [activeSection, setActiveSection] = useState("basic-info")
  const [academicUnits, setAcademicUnits] = useState<any[]>([])
  const [loadingUnits, setLoadingUnits] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    program: "",
    passingYear: "",
    academicUnit: "",
    contactDetails: {
      email: "",
      phone: "",
      address: "",
    },
    qualifiedExams: {
      examName: "",
      rollNumber: "",
      certificateUrl: "",
    },
    employment: {
      type: "",
      employerName: "",
      employerContact: "",
      employerEmail: "",
      selfEmploymentDetails: "",
      documentUrl: "",
    },
    higherEducation: {
      institutionName: "",
      programName: "",
      documentUrl: "",
    },
    basicInfoImageUrl: "",
    basicInfoImage: null,
    qualificationImage: null,
    employmentImage: null,
    higherEducationImage: null,
  })

  // Fetch academic units on component mount
  useEffect(() => {
    const fetchAcademicUnits = async () => {
      try {
        setLoadingUnits(true)
        const units = await getAcademicUnits()
        setAcademicUnits(units)
      } catch (error) {
        console.error("Error fetching academic units:", error)
        toast.error("Failed to load academic units")
      } finally {
        setLoadingUnits(false)
      }
    }

    fetchAcademicUnits()
  }, [])

  // Fetch alumni data when in edit mode
  useEffect(() => {
    const fetchAlumniData = async () => {
      if (isEditing && alumniId) {
        try {
          setIsFetching(true)
          // Get token from localStorage
          const token = localStorage.getItem("token")
          const data = await getAlumniById(alumniId, token)

          // Ensure all nested objects exist with proper defaults
          const processedData = {
            ...data,
            contactDetails: data.contactDetails || {
              email: "",
              phone: "",
              address: "",
            },
            qualifiedExams: data.qualifiedExams || {
              examName: "",
              rollNumber: "",
              certificateUrl: "",
            },
            employment: data.employment || {
              type: "",
              employerName: "",
              employerContact: "",
              employerEmail: "",
              selfEmploymentDetails: "",
              documentUrl: "",
            },
            higherEducation: data.higherEducation || {
              institutionName: "",
              programName: "",
              documentUrl: "",
            },
            basicInfoImageUrl: data.basicInfoImageUrl || "",
          }

          setFormData({
            ...processedData,
            basicInfoImage: null,
            qualificationImage: null,
            employmentImage: null,
            higherEducationImage: null,
          })

          console.log("Fetched alumni data:", processedData)
          console.log("Employment type:", processedData.employment?.type)
        } catch (error) {
          console.error("Error fetching alumni data:", error)
          toast.error("Failed to load alumni data")
        } finally {
          setIsFetching(false)
        }
      } else if (initialData) {
        // If initialData is provided directly, use it
        const processedData = {
          ...initialData,
          contactDetails: initialData.contactDetails || {
            email: "",
            phone: "",
            address: "",
          },
          qualifiedExams: initialData.qualifiedExams || {
            examName: "",
            rollNumber: "",
            certificateUrl: "",
          },
          employment: initialData.employment || {
            type: "",
            employerName: "",
            employerContact: "",
            employerEmail: "",
            selfEmploymentDetails: "",
            documentUrl: "",
          },
          higherEducation: initialData.higherEducation || {
            institutionName: "",
            programName: "",
            documentUrl: "",
          },
          basicInfoImageUrl: initialData.basicInfoImageUrl || "",
        }

        setFormData({
          ...processedData,
          basicInfoImage: null,
          qualificationImage: null,
          employmentImage: null,
          higherEducationImage: null,
        })

        console.log("Using provided initial data:", processedData)
        console.log("Employment type:", processedData.employment?.type)
      }
    }

    fetchAlumniData()
  }, [isEditing, alumniId, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target

    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (value, name) => {
    // Handle nested fields
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0],
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.registrationNumber || !formData.program || !formData.passingYear || !formData.academicUnit) {
      toast.error("Please fill in all required fields")
      setActiveSection("basic-info")
      return
    }

    try {
      setIsLoading(true)
      // Get token from localStorage
      const token = localStorage.getItem("token")

      if (isEditing && alumniId) {
        // Update existing alumni
        await updateAlumni(alumniId, formData, token)
        toast.success("Alumni updated successfully")
      } else {
        // Create new alumni
        await createAlumni(formData)
        toast.success("Alumni created successfully")
      }

      // Redirect to alumni list
      router.push("/dashboard/alumni")
    } catch (error) {
      console.error("Error saving alumni:", error)
      toast.error(error.message || "Failed to save alumni")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSectionChange = (section) => {
    setActiveSection(section)

    // Scroll to the section
    const sectionElement = document.getElementById(section)
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading alumni data...</span>
      </div>
    )
  }

  const sections = [
    { id: "basic-info", label: "Basic Info" },
    { id: "qualifications", label: "Qualifications" },
    { id: "employment", label: "Employment" },
    { id: "higher-education", label: "Higher Education" },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Alumni" : "Add New Alumni"}</CardTitle>
          <CardDescription>
            {isEditing ? "Update alumni information in the system" : "Add a new alumni to the SST database"}
          </CardDescription>
        </CardHeader>

        {/* Progress Bar */}
        <div className="px-6 mb-6">
          <div className="flex justify-between mb-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSectionChange(section.id)}
                className={`text-sm font-medium ${
                  activeSection === section.id ? "text-primary" : "text-muted-foreground"
                } focus:outline-none`}
              >
                {section.label}
              </button>
            ))}
          </div>
          {/* <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-in-out"
              style={{
                width: `${(sections.findIndex((s) => s.id === activeSection) + 1) * 25}%`,
              }}
            ></div>
          </div> */}
        </div>

        <CardContent className="space-y-8">
          {/* Basic Info Section */}
          <div id="basic-info">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b">Basic Info</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
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
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="program">
                  Program <span className="text-red-500">*</span>
                </Label>
                <Input id="program" name="program" value={formData.program} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicUnit">
                  Academic Unit <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.academicUnit}
                  onValueChange={(value) => handleSelectChange(value, "academicUnit")}
                  disabled={loadingUnits}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingUnits ? "Loading..." : "Select academic unit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {academicUnits.length === 0 && !loadingUnits ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No academic units found. Please create one first.
                      </div>
                    ) : (
                      academicUnits.map((unit) => (
                        <SelectItem key={unit._id} value={unit.name}>
                          {unit.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="passingYear">
                  Passing Year <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.passingYear}
                  onValueChange={(value) => handleSelectChange(value, "passingYear")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) => {
                      const startYear = 2016 + i
                      const endYear = (startYear + 1).toString().slice(-2)
                      return `${startYear}-${endYear}`
                    }).map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="contactDetails.email">Email</Label>
                <Input
                  id="contactDetails.email"
                  name="contactDetails.email"
                  type="email"
                  value={formData.contactDetails.email || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactDetails.phone">Phone</Label>
                <Input
                  id="contactDetails.phone"
                  name="contactDetails.phone"
                  value={formData.contactDetails.phone || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="contactDetails.address">Address</Label>
              <Textarea
                id="contactDetails.address"
                name="contactDetails.address"
                value={formData.contactDetails.address || ""}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="basicInfoImage">Upload ID Proof (optional)</Label>
              <Input
                id="basicInfoImage"
                name="basicInfoImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.basicInfoImageUrl && !formData.basicInfoImage && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Current file:
                    <a
                      href={formData.basicInfoImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
            </div>
          </div>

          {/* Qualifications Section */}
          <div id="qualifications">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b">Qualifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualifiedExams.examName">Exam Name</Label>
                <Input
                  id="qualifiedExams.examName"
                  name="qualifiedExams.examName"
                  value={formData.qualifiedExams.examName || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifiedExams.rollNumber">Roll Number</Label>
                <Input
                  id="qualifiedExams.rollNumber"
                  name="qualifiedExams.rollNumber"
                  value={formData.qualifiedExams.rollNumber || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="qualificationImage">Upload Certificate (optional)</Label>
              <Input
                id="qualificationImage"
                name="qualificationImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.qualifiedExams.certificateUrl && !formData.qualificationImage && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Current file:
                    <a
                      href={formData.qualifiedExams.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      View Certificate
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={() => handleSectionChange("basic-info")}>
                Back: Basic Info
              </Button>
            </div>
          </div>

          {/* Employment Section */}
          <div id="employment">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b">Employment</h3>

            <div className="space-y-2">
              <Label htmlFor="employment.type">Employment Type</Label>
              <Select
                value={formData.employment.type || ""}
                onValueChange={(value) => handleSelectChange(value, "employment.type")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Self-employed">Self-employed</SelectItem>
                  <SelectItem value="Unemployed">Unemployed</SelectItem>
                  <SelectItem value="Studying">Studying</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.employment.type === "Employed" && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employment.employerName">Employer Name</Label>
                  <Input
                    id="employment.employerName"
                    name="employment.employerName"
                    value={formData.employment.employerName || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employment.employerContact">Employer Contact</Label>
                    <Input
                      id="employment.employerContact"
                      name="employment.employerContact"
                      value={formData.employment.employerContact || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment.employerEmail">Employer Email</Label>
                    <Input
                      id="employment.employerEmail"
                      name="employment.employerEmail"
                      type="email"
                      value={formData.employment.employerEmail || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.employment.type === "Self-employed" && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="employment.selfEmploymentDetails">Self-employment Details</Label>
                <Textarea
                  id="employment.selfEmploymentDetails"
                  name="employment.selfEmploymentDetails"
                  value={formData.employment.selfEmploymentDetails || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Label htmlFor="employmentImage">Upload Employment Proof (optional)</Label>
              <Input
                id="employmentImage"
                name="employmentImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.employment.documentUrl && !formData.employmentImage && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Current file:
                    <a
                      href={formData.employment.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={() => handleSectionChange("qualifications")}>
                Back: Qualifications
              </Button>
             
            </div>
          </div>

          {/* Higher Education Section */}
          <div id="higher-education">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b">Higher Education</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="higherEducation.institutionName">Institution Name</Label>
                <Input
                  id="higherEducation.institutionName"
                  name="higherEducation.institutionName"
                  value={formData.higherEducation.institutionName || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="higherEducation.programName">Program</Label>
                <Input
                  id="higherEducation.programName"
                  name="higherEducation.programName"
                  value={formData.higherEducation.programName || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="higherEducationImage">Upload Higher Education Document (optional)</Label>
              <Input
                id="higherEducationImage"
                name="higherEducationImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.higherEducation.documentUrl && !formData.higherEducationImage && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Current file:
                    <a
                      href={formData.higherEducation.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
             
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
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

export default AlumniForm
