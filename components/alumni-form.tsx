"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { createAlumni, updateAlumni } from "@/services/alumni-service"

interface AlumniFormProps {
  initialData?: any
  isEditing?: boolean
}

export function AlumniForm({ initialData, isEditing = false }: AlumniFormProps) {
  const router = useRouter()
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    academicUnit: initialData?.academicUnit || "",
    program: initialData?.program || "",
    passingYear: initialData?.passingYear || "",
    registrationNumber: initialData?.registrationNumber || "",
    qualifiedExams: {
      examName: initialData?.qualifiedExams?.examName || "Not applicable",
      rollNumber: initialData?.qualifiedExams?.rollNumber || "",
      certificateUrl: initialData?.qualifiedExams?.certificateUrl || "",
    },
    employment: {
      type: initialData?.employment?.type || "Unemployed",
      employerName: initialData?.employment?.employerName || "",
      employerContact: initialData?.employment?.employerContact || "",
      employerEmail: initialData?.employment?.employerEmail || "",
      documentUrl: initialData?.employment?.documentUrl || "",
      selfEmploymentDetails: initialData?.employment?.selfEmploymentDetails || "",
    },
    higherEducation: {
      institutionName: initialData?.higherEducation?.institutionName || "",
      programName: initialData?.higherEducation?.programName || "",
      documentUrl: initialData?.higherEducation?.documentUrl || "",
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof typeof formData],
          [field]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (value: string, name: string) => {
    if (name.includes(".")) {
      const [section, field] = name.split(".")
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof typeof formData],
          [field]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    // In a real app, this would handle file uploads
    // For demo purposes, we'll just set a placeholder URL
    const [section, field] = fieldName.split(".")
    setFormData({
      ...formData,
      [section]: {
        ...formData[section as keyof typeof formData],
        [field]: "https://example.com/document.pdf",
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!token) {
        throw new Error("Authentication token not found")
      }

      // Validate required fields
      if (
        !formData.name ||
        !formData.academicUnit ||
        !formData.program ||
        !formData.passingYear ||
        !formData.registrationNumber
      ) {
        throw new Error("Please fill all required fields")
      }

      if (isEditing && initialData?._id) {
        // Update existing alumni
        await updateAlumni(initialData._id, formData, token)
        toast.success("Alumni record updated successfully")
      } else {
        // Create new alumni
        await createAlumni(formData, token)
        toast.success("New alumni record created successfully")
      }

      // Redirect to alumni list
      router.push("/dashboard/alumni")
    } catch (error) {
      console.error("Error saving alumni:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save alumni record")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="employment">Employment & Education</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of the alumni</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter full name as per marksheet"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicUnit">
                  Academic Unit <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.academicUnit}
                  onValueChange={(value) => handleSelectChange(value, "academicUnit")}
                >
                  <SelectTrigger id="academicUnit">
                    <SelectValue placeholder="Select academic unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Himalayan School of Science/Engineering and Technology">
                      Himalayan School of Science/Engineering and Technology
                    </SelectItem>
                    <SelectItem value="Himalayan Institute of Medical Sciences (Medical)">
                      Himalayan Institute of Medical Sciences (Medical)
                    </SelectItem>
                    <SelectItem value="Himalayan Institute of Medical Sciences (Paramedical)">
                      Himalayan Institute of Medical Sciences (Paramedical)
                    </SelectItem>
                    <SelectItem value="Himalayan Institute of Medical Sciences (Community Medicine)">
                      Himalayan Institute of Medical Sciences (Community Medicine)
                    </SelectItem>
                    <SelectItem value="Himalayan Institute of Medical Sciences (Hospital Administration)">
                      Himalayan Institute of Medical Sciences (Hospital Administration)
                    </SelectItem>
                    <SelectItem value="Himalayan Institute of Medical Sciences (Yoga Sciences & Holistic Health)">
                      Himalayan Institute of Medical Sciences (Yoga Sciences & Holistic Health)
                    </SelectItem>
                    <SelectItem value="Himalayan Institute of Medical Sciences (Biosciences)">
                      Himalayan Institute of Medical Sciences (Biosciences)
                    </SelectItem>
                    <SelectItem value="Himalayan School of Management Studies">
                      Himalayan School of Management Studies
                    </SelectItem>
                    <SelectItem value="Himalayan College of Nursing">Himalayan College of Nursing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">
                  Program <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="program"
                  name="program"
                  placeholder="e.g. B.Sc, MBBS, MSc, B.Tech, BCA, MCA, Ph.D"
                  value={formData.program}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingYear">
                  Passing Year <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.passingYear}
                  onValueChange={(value) => handleSelectChange(value, "passingYear")}
                >
                  <SelectTrigger id="passingYear">
                    <SelectValue placeholder="Select passing year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2016-17">2016-17</SelectItem>
                    <SelectItem value="2017-18">2017-18</SelectItem>
                    <SelectItem value="2018-19">2018-19</SelectItem>
                    <SelectItem value="2019-20">2019-20</SelectItem>
                    <SelectItem value="2020-21">2020-21</SelectItem>
                    <SelectItem value="2021-22">2021-22</SelectItem>
                    <SelectItem value="2022-23">2022-23</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">
                  Registration Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  placeholder="e.g. DD2017304002"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">Enter the registration number as per university records</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.push("/dashboard/alumni")}>
                Cancel
              </Button>
              <Button type="button" onClick={() => document.getElementById("qualifications-tab")?.click()}>
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications" id="qualifications-tab">
          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
              <CardDescription>Enter details about qualified exams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qualifiedExams.examName">Qualified Exams</Label>
                <Select
                  value={formData.qualifiedExams.examName}
                  onValueChange={(value) => handleSelectChange(value, "qualifiedExams.examName")}
                >
                  <SelectTrigger id="qualifiedExams.examName">
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not applicable">Not applicable</SelectItem>
                    <SelectItem value="NET">NET</SelectItem>
                    <SelectItem value="SLET">SLET</SelectItem>
                    <SelectItem value="GATE">GATE</SelectItem>
                    <SelectItem value="GMAT">GMAT</SelectItem>
                    <SelectItem value="GPAT">GPAT</SelectItem>
                    <SelectItem value="CAT">CAT</SelectItem>
                    <SelectItem value="GRE">GRE</SelectItem>
                    <SelectItem value="TOEFL">TOEFL</SelectItem>
                    <SelectItem value="PLAB">PLAB</SelectItem>
                    <SelectItem value="USMLE">USMLE</SelectItem>
                    <SelectItem value="AYUSH">AYUSH</SelectItem>
                    <SelectItem value="Civil Services">Civil Services</SelectItem>
                    <SelectItem value="Defense">Defense</SelectItem>
                    <SelectItem value="UPSC">UPSC</SelectItem>
                    <SelectItem value="State government examinations">State government examinations</SelectItem>
                    <SelectItem value="PG-NEET">PG-NEET</SelectItem>
                    <SelectItem value="AIIMSPGET">AIIMSPGET</SelectItem>
                    <SelectItem value="JIPMER Entrance Test">JIPMER Entrance Test</SelectItem>
                    <SelectItem value="PGIMER Entrance Test">PGIMER Entrance Test</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.qualifiedExams.examName !== "Not applicable" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="qualifiedExams.rollNumber">Roll Number</Label>
                    <Input
                      id="qualifiedExams.rollNumber"
                      name="qualifiedExams.rollNumber"
                      placeholder="Enter roll number of exam"
                      value={formData.qualifiedExams.rollNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifiedExams.certificate">Certificate</Label>
                    <Input
                      id="qualifiedExams.certificate"
                      type="file"
                      onChange={(e) => handleFileChange(e, "qualifiedExams.certificateUrl")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload passing certificate/document (e.g. score card)
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => document.getElementById("basic-tab")?.click()}>
                Previous
              </Button>
              <Button type="button" onClick={() => document.getElementById("employment-tab")?.click()}>
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="employment" id="employment-tab">
          <Card>
            <CardHeader>
              <CardTitle>Employment & Higher Education</CardTitle>
              <CardDescription>Enter details about employment status and higher education</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Employment Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="employment.type">Employment Status</Label>
                  <Select
                    value={formData.employment.type}
                    onValueChange={(value) => handleSelectChange(value, "employment.type")}
                  >
                    <SelectTrigger id="employment.type">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employed">Employed in organization/company</SelectItem>
                      <SelectItem value="Self-employed">Self-employed</SelectItem>
                      <SelectItem value="Unemployed">Unemployed</SelectItem>
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
                        placeholder="Name of the employer"
                        value={formData.employment.employerName}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment.employerContact">Employer Contact</Label>
                      <Input
                        id="employment.employerContact"
                        name="employment.employerContact"
                        placeholder="Contact details of employer"
                        value={formData.employment.employerContact}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment.employerEmail">Employer Email</Label>
                      <Input
                        id="employment.employerEmail"
                        name="employment.employerEmail"
                        type="email"
                        placeholder="Email of employer"
                        value={formData.employment.employerEmail}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment.document">Supporting Document</Label>
                      <Input
                        id="employment.document"
                        type="file"
                        onChange={(e) => handleFileChange(e, "employment.documentUrl")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Attach relevant document (like copy of Offer letter/ID card)
                      </p>
                    </div>
                  </>
                )}

                {formData.employment.type === "Self-employed" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="employment.selfEmploymentDetails">Self-employment Details</Label>
                      <Textarea
                        id="employment.selfEmploymentDetails"
                        name="employment.selfEmploymentDetails"
                        placeholder="Details of self employment with contact details"
                        value={formData.employment.selfEmploymentDetails}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment.document">Supporting Document</Label>
                      <Input
                        id="employment.document"
                        type="file"
                        onChange={(e) => handleFileChange(e, "employment.documentUrl")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Attach document like registration no. of firm or any other details
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Higher Education</h3>
                <p className="text-sm text-muted-foreground">
                  Applicable for students who have progressed to higher education
                </p>

                <div className="space-y-2">
                  <Label htmlFor="higherEducation.institutionName">Institution Name</Label>
                  <Input
                    id="higherEducation.institutionName"
                    name="higherEducation.institutionName"
                    placeholder="Name of institution joined"
                    value={formData.higherEducation.institutionName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="higherEducation.programName">Program Name</Label>
                  <Input
                    id="higherEducation.programName"
                    name="higherEducation.programName"
                    placeholder="Name of program admitted to"
                    value={formData.higherEducation.programName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="higherEducation.document">Supporting Document</Label>
                  <Input
                    id="higherEducation.document"
                    type="file"
                    onChange={(e) => handleFileChange(e, "higherEducation.documentUrl")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload admission letter/program ID card or any other supporting document
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => document.getElementById("qualifications-tab")?.click()}
              >
                Previous
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : isEditing ? (
                  "Update Alumni"
                ) : (
                  "Save Alumni"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}

