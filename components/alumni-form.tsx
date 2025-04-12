"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createAlumni, updateAlumni, getAlumniById } from "@/services/alumni-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [activeTab, setActiveTab] = useState("basic-info")
  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    program: "",
    passingYear: "",
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
  })

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
          })

          console.log("Fetched alumni data:", processedData)
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
        })

        console.log("Using provided initial data:", processedData)
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
    if (!formData.name || !formData.registrationNumber || !formData.program || !formData.passingYear) {
      toast.error("Please fill in all required fields")
      setActiveTab("basic-info")
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

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  // Fix the handleNext function to properly prevent form submission
  const handleNext = (e) => {
    // Prevent any default form submission
    e.preventDefault()
    e.stopPropagation()

    if (activeTab === "basic-info") {
      setActiveTab("qualifications")
    } else if (activeTab === "qualifications") {
      setActiveTab("employment")
    } else if (activeTab === "employment") {
      setActiveTab("higher-education")
    }
  }

  // Fix the handlePrevious function to also prevent form submission
  const handlePrevious = (e) => {
    // Prevent any default form submission
    e.preventDefault()
    e.stopPropagation()

    if (activeTab === "qualifications") {
      setActiveTab("basic-info")
    } else if (activeTab === "employment") {
      setActiveTab("qualifications")
    } else if (activeTab === "higher-education") {
      setActiveTab("employment")
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

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Alumni" : "Add New Alumni"}</CardTitle>
          <CardDescription>
            {isEditing ? "Update alumni information in the system" : "Add a new alumni to the HSST database"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
              <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
              <TabsTrigger value="employment">Employment</TabsTrigger>
              <TabsTrigger value="higher-education">Higher Education</TabsTrigger>
            </TabsList>

            <TabsContent value="basic-info" className="space-y-4 mt-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program">
                    Program <span className="text-red-500">*</span>
                  </Label>
                  <Input id="program" name="program" value={formData.program} onChange={handleChange} required />
                </div>
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
                      {Array.from(
                        { length: new Date().getFullYear() - 2014 },
                        (_, i) => new Date().getFullYear() - i,
                      ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="contactDetails.address">Address</Label>
                <Textarea
                  id="contactDetails.address"
                  name="contactDetails.address"
                  value={formData.contactDetails.address || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
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
            </TabsContent>

            <TabsContent value="qualifications" className="space-y-4 mt-4">
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

              <div className="space-y-2">
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
            </TabsContent>

            <TabsContent value="employment" className="space-y-4 mt-4">
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
                    <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.employment.type === "Employed" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="employment.employerName">Employer Name</Label>
                    <Input
                      id="employment.employerName"
                      name="employment.employerName"
                      value={formData.employment.employerName || ""}
                      onChange={handleChange}
                    />
                  </div>
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
                </>
              )}

              {formData.employment.type === "Self-Employed" && (
                <div className="space-y-2">
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

              <div className="space-y-2">
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
            </TabsContent>

            <TabsContent value="higher-education" className="space-y-4 mt-4">
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

              {formData.higherEducation.documentUrl && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    Current document:
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeTab !== "basic-info" ? (
            <Button type="button" variant="outline" onClick={(e) => handlePrevious(e)}>
              Previous
            </Button>
          ) : (
            <div></div>
          )}

          {activeTab !== "higher-education" ? (
            <Button type="button" onClick={(e) => handleNext(e)}>
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                // Only for the submit button, we want the default form submission
                // but we'll handle it in the handleSubmit function
              }}
            >
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
        </CardFooter>
      </Card>
    </form>
  )
}

export default AlumniForm
