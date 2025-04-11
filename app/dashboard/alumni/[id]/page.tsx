"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { getAlumniById } from "@/services/alumni-service"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ViewAlumniPage() {
  const { isAuthenticated, loading, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [alumni, setAlumni] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchAlumni = async () => {
      try {
        if (params.id) {
          const data = await getAlumniById(params.id as string, token)
          setAlumni(data)
        }
      } catch (error) {
        toast.error("Failed to fetch alumni details")
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchAlumni()
    }
  }, [isAuthenticated, loading, router, params.id, token])

  if (loading || !isAuthenticated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!alumni) {
    return (
      <DashboardLayout>
        <DashboardHeader
          title="Alumni Details"
          description="View alumni information"
          action={
            <Link href="/dashboard/alumni">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Alumni
              </Button>
            </Link>
          }
        />
        <div className="rounded-md bg-destructive/10 p-6 text-center">
          <h3 className="font-medium text-destructive">Alumni not found</h3>
          <p className="text-sm text-destructive/80 mt-1">The requested alumni record could not be found.</p>
          <Link href="/dashboard/alumni">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Alumni List
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Alumni Details"
        description="View alumni information"
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/alumni">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Alumni
              </Button>
            </Link>
            <Link href={`/dashboard/alumni/${params.id}/edit`}>
              <Button>Edit Alumni</Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                <p className="mt-1">{alumni.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
                <p className="mt-1">{alumni.registrationNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Program</h3>
                <p className="mt-1">{alumni.program}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Passing Year</h3>
                <p className="mt-1">{alumni.passingYear}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Academic Unit</h3>
                <p className="mt-1">{alumni.academicUnit}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="mt-1">{alumni.contactDetails?.email || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p className="mt-1">{alumni.contactDetails?.phone || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p className="mt-1">{alumni.contactDetails?.address || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qualifications */}
        <Card>
          <CardHeader>
            <CardTitle>Qualifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Exam Name</h3>
                <p className="mt-1">{alumni.qualifiedExams?.examName || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Roll Number</h3>
                <p className="mt-1">{alumni.qualifiedExams?.rollNumber || "Not provided"}</p>
              </div>
              {alumni.qualifiedExams?.certificateUrl && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Certificate</h3>
                  <div className="mt-2">
                    <a
                      href={alumni.qualifiedExams.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Certificate
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Employment */}
        <Card>
          <CardHeader>
            <CardTitle>Employment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Employment Type</h3>
                <p className="mt-1">{alumni.employment?.type || "Not provided"}</p>
              </div>
              {alumni.employment?.type === "Employed" && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Employer Name</h3>
                    <p className="mt-1">{alumni.employment?.employerName || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Employer Contact</h3>
                    <p className="mt-1">{alumni.employment?.employerContact || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Employer Email</h3>
                    <p className="mt-1">{alumni.employment?.employerEmail || "Not provided"}</p>
                  </div>
                </>
              )}
              {alumni.employment?.type === "Self-employed" && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Self-employment Details</h3>
                  <p className="mt-1">{alumni.employment?.selfEmploymentDetails || "Not provided"}</p>
                </div>
              )}
              {alumni.employment?.documentUrl && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Employment Document</h3>
                  <div className="mt-2">
                    <a
                      href={alumni.employment.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Higher Education */}
        <Card>
          <CardHeader>
            <CardTitle>Higher Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Institution Name</h3>
                <p className="mt-1">{alumni.higherEducation?.institutionName || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Program</h3>
                <p className="mt-1">{alumni.higherEducation?.programName || "Not provided"}</p>
              </div>
              {alumni.higherEducation?.documentUrl && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Document</h3>
                  <div className="mt-2">
                    <a
                      href={alumni.higherEducation.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Documents */}
        {alumni.basicInfoImageUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID Proof</h3>
                <div className="mt-2">
                  <a
                    href={alumni.basicInfoImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
