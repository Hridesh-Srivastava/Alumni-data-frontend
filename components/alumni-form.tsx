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
import { Loader2 } from 'lucide-react'

interface AlumniFormProps {
  id?: string
  isEdit?: boolean
}

export function AlumniForm({ id, isEdit = false }: AlumniFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
    qualifications: {
      examName: "",
      rollNumber: "",
      certificate: "",
    },
    employment: {
      type: "",
      document: "",
    },
    higherEducation: {
      institutionName: "",
      program: "",
    },
    basicInfoImage: null,
    qualificationImage: null,
    employmentImage: null,
  })

  // Fetch alumni data if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const fetchAlumni = async () => {
        try {
          setIsLoading(true)
          const data = await getAlumniById(id)
          
          // Initialize nested objects if they don't exist
          const alumni = {
            ...data,
            contactDetails: data.contactDetails || {},
            qualifications: data.qualifications || {},
            employment: data.employment || {},
            higherEducation: data.higherEducation || {},
          }
          
          setFormData(alumni)
        } catch (error) {
          console.error("Error fetching alumni:", error)
          toast.error("Failed to fetch alumni details")
        } finally {
          setIsLoading(false)
        }
      }

      fetchAlumni()
    }
  }, [isEdit, id])

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
      
      if (isEdit && id) {
        // Update existing alumni
        await updateAlumni(id, formData)
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

  const handlePrevious = () => {
    if (activeTab === "qualifications") {
      setActiveTab("basic-info")
    } else if (activeTab === "employment") {
      setActiveTab("qualifications")
    } else if (activeTab === "higher-education") {
      setActiveTab("employment")
    }
  }

  const handleNext = () => {
    if (activeTab === "basic-info") {
      setActiveTab("qualifications")
    } else if (activeTab === "qualifications") {
      setActiveTab("employment")
    } else if (activeTab === "employment") {
      setActiveTab("higher-education")
    }
  }

  if (isLoading && isEdit) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Alumni" : "Add New Alumni"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update alumni information in the system"
              : "Add a new alumni to the HSST database"}
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
                  <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number <span className="text-red-500">*</span></Label>
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
                  <Label htmlFor="program">Program <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.program}
                    onValueChange={(value) => handleSelectChange(value, "program")}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B.Tech (CSE)">B.Tech (CSE)</SelectItem>
                      <SelectItem value="B.Tech (ME)">B.Tech (ME)</SelectItem>
                      <SelectItem value="B.Tech (CE)">B.Tech (CE)</SelectItem>
                      <SelectItem value="B.Tech (EE)">B.Tech (EE)</SelectItem>
                      <SelectItem value="M.Tech (CSE)">M.Tech (CSE)</SelectItem>
                      <SelectItem value="M.Tech (ME)">M.Tech (ME)</SelectItem>
                      <SelectItem value="M.Tech (CE)">M.Tech (CE)</SelectItem>
                      <SelectItem value="M.Tech (EE)">M.Tech (EE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passingYear">Passing Year <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.passingYear}
                    onValueChange={(value) => handleSelectChange(value, "passingYear")}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((year) => (
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
              </div>
            </TabsContent>
            
            <TabsContent value="qualifications" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualifications.examName">Exam Name</Label>
                  <Input
                    id="qualifications.examName"
                    name="qualifications.examName"
                    value={formData.qualifications.examName || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifications.rollNumber">Roll Number</Label>
                  <Input
                    id="qualifications.rollNumber"
                    name="qualifications.rollNumber"
                    value={formData.qualifications.rollNumber || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qualifications.certificate">Certificate</Label>
                <Input
                  id="qualifications.certificate"
                  name="qualifications.certificate"
                  value={formData.qualifications.certificate || ""}
                  onChange={handleChange}
                />
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
              
              <div className="space-y-2">
                <Label htmlFor="employment.document">Employment Document</Label>
                <Input
                  id="employment.document"
                  name="employment.document"
                  value={formData.employment.document || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employmentImage">Upload Employment Proof (optional)</Label>
                <Input
                  id="employmentImage"
                  name="employmentImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
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
                <Label htmlFor="higherEducation.program">Program</Label>
                <Input
                  id="higherEducation.program"
                  name="higherEducation.program"
                  value={formData.higherEducation.program || ""}
                  onChange={handleChange}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeTab !== "basic-info" ? (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          
          {activeTab !== "higher-education" ? (
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
        </CardFooter>
      </Card>
    </form>
  )
}

export default AlumniForm