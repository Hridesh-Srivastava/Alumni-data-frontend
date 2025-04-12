"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { getAlumniById } from "@/services/alumni-service"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Printer } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ViewAlumniPage() {
  const { isAuthenticated, loading, token } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [alumni, setAlumni] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const printContentRef = useRef(null)

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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      toast.error("Please allow pop-ups to print alumni details")
      return
    }

    // Get all the document links
    const documentLinks = []
    if (alumni.qualifiedExams?.certificateUrl) {
      documentLinks.push({
        title: "Qualification Certificate",
        url: alumni.qualifiedExams.certificateUrl,
      })
    }
    if (alumni.employment?.documentUrl) {
      documentLinks.push({
        title: "Employment Document",
        url: alumni.employment.documentUrl,
      })
    }
    if (alumni.higherEducation?.documentUrl) {
      documentLinks.push({
        title: "Higher Education Document",
        url: alumni.higherEducation.documentUrl,
      })
    }
    if (alumni.basicInfoImageUrl) {
      documentLinks.push({
        title: "ID Proof",
        url: alumni.basicInfoImageUrl,
      })
    }

    // Create print content with styling
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Alumni Details - ${alumni.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
          }
          .section {
            margin-bottom: 25px;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .row {
            display: flex;
            margin-bottom: 10px;
          }
          .label {
            font-weight: bold;
            width: 200px;
          }
          .value {
            flex: 1;
          }
          .document-links {
            margin-top: 20px;
          }
          .document-link {
            display: block;
            margin-bottom: 5px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          a {
            color: #0066cc;
            text-decoration: underline;
          }
          @media print {
            .no-print {
              display: none;
            }
            a {
              color: #0066cc !important;
              text-decoration: underline !important;
            }
            a::after {
              content: " (" attr(href) ")";
              font-size: 0.8em;
              color: #666;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">HSST Alumni Data Collection</div>
          <div>Alumni Details Report</div>
          <div>Generated on: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
          <div class="section-title">Basic Information</div>
          <div class="row">
            <div class="label">Full Name:</div>
            <div class="value">${alumni.name || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Registration Number:</div>
            <div class="value">${alumni.registrationNumber || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Program:</div>
            <div class="value">${alumni.program || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Passing Year:</div>
            <div class="value">${alumni.passingYear || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Academic Unit:</div>
            <div class="value">${alumni.academicUnit || "Not provided"}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Contact Details</div>
          <div class="row">
            <div class="label">Email:</div>
            <div class="value">${alumni.contactDetails?.email || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Phone:</div>
            <div class="value">${alumni.contactDetails?.phone || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Address:</div>
            <div class="value">${alumni.contactDetails?.address || "Not provided"}</div>
          </div>
        </div>

        ${
          alumni.qualifiedExams?.examName
            ? `
        <div class="section">
          <div class="section-title">Qualifications</div>
          <div class="row">
            <div class="label">Exam Name:</div>
            <div class="value">${alumni.qualifiedExams?.examName || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Roll Number:</div>
            <div class="value">${alumni.qualifiedExams?.rollNumber || "Not provided"}</div>
          </div>
        </div>
        `
            : ""
        }

        ${
          alumni.employment?.type
            ? `
        <div class="section">
          <div class="section-title">Employment</div>
          <div class="row">
            <div class="label">Employment Type:</div>
            <div class="value">${alumni.employment?.type || "Not provided"}</div>
          </div>
          ${
            alumni.employment?.type === "Employed"
              ? `
            <div class="row">
              <div class="label">Employer Name:</div>
              <div class="value">${alumni.employment?.employerName || "Not provided"}</div>
            </div>
            <div class="row">
              <div class="label">Employer Contact:</div>
              <div class="value">${alumni.employment?.employerContact || "Not provided"}</div>
            </div>
            <div class="row">
              <div class="label">Employer Email:</div>
              <div class="value">${alumni.employment?.employerEmail || "Not provided"}</div>
            </div>
          `
              : ""
          }
          ${
            alumni.employment?.type === "Self-employed"
              ? `
            <div class="row">
              <div class="label">Self-employment Details:</div>
              <div class="value">${alumni.employment?.selfEmploymentDetails || "Not provided"}</div>
            </div>
          `
              : ""
          }
        </div>
        `
            : ""
        }

        ${
          alumni.higherEducation?.institutionName
            ? `
        <div class="section">
          <div class="section-title">Higher Education</div>
          <div class="row">
            <div class="label">Institution Name:</div>
            <div class="value">${alumni.higherEducation?.institutionName || "Not provided"}</div>
          </div>
          <div class="row">
            <div class="label">Program:</div>
            <div class="value">${alumni.higherEducation?.programName || "Not provided"}</div>
          </div>
        </div>
        `
            : ""
        }

        ${
          documentLinks.length > 0
            ? `
        <div class="section">
          <div class="section-title">Documents</div>
          <div class="document-links">
            ${documentLinks
              .map(
                (doc) => `
              <div class="row">
                <div class="label">${doc.title}:</div>
                <div class="value">
                  <a href="${doc.url}" target="_blank" onclick="window.open('${doc.url}', '_blank'); return false;">${doc.title}</a>
                </div>
              </div>
            `,
              )
              .join("")}
            <p class="no-print">Note: Click on the document links above to view them in a new tab.</p>
          </div>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>HSST Alumni Data Collection System</p>
          <p>This is an official document generated from the HSST Alumni Database.</p>
        </div>

        <script>
          // Make links clickable in the print view
          document.addEventListener('DOMContentLoaded', function() {
            const links = document.querySelectorAll('a');
            links.forEach(link => {
              link.addEventListener('click', function(e) {
                e.preventDefault();
                window.open(this.href, '_blank');
              });
            });
          });
          
          // Auto-print after loading
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(printContent)
    printWindow.document.close()
  }

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
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Link href={`/dashboard/alumni/${params.id}/edit`}>
              <Button>Edit Alumni</Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6" ref={printContentRef}>
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
