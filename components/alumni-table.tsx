"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { getAlumni, getAlumniById } from "@/services/alumni-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, AlertCircle, Eye, Pencil, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface Alumni {
  _id: string
  name: string
  contactDetails?: {
    email?: string
    phone?: string
    address?: string
  }
  academicUnit: string
  passingYear: string
  program: string
  registrationNumber?: string
  qualifiedExams?: {
    examName?: string
    rollNumber?: string
    certificateUrl?: string
  }
  employment?: {
    type?: string
    employerName?: string
    employerContact?: string
    employerEmail?: string
    selfEmploymentDetails?: string
    documentUrl?: string
  }
  higherEducation?: {
    institutionName?: string
    programName?: string
    documentUrl?: string
  }
  basicInfoImageUrl?: string
}

interface AlumniTableProps {
  filter: {
    academicUnit?: string
    passingYear?: string
    program?: string
  }
  onTotalChange?: (total: number) => void // Callback to pass total count to parent
}

export function AlumniTable({ filter, onTotalChange }: AlumniTableProps) {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAlumni, setSelectedAlumni] = useState<Set<string>>(new Set())
  const [isDownloading, setIsDownloading] = useState(false)
  const { token, isAuthenticated } = useAuth()
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Pass total count to parent component whenever it changes
  useEffect(() => {
    console.log("Pagination total changed:", pagination.total) // Debug log
    if (onTotalChange) {
      onTotalChange(pagination.total)
    }
  }, [pagination.total, onTotalChange])

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log("Fetching alumni with filter:", filter) // Debug log

        // Build filter object
        const filterParams: any = {
          page: pagination.currentPage,
          limit: 10,
        }

        if (filter.academicUnit && filter.academicUnit !== "all" && filter.academicUnit !== "") {
          filterParams.academicUnit = filter.academicUnit
        }

        if (filter.passingYear && filter.passingYear !== "all" && filter.passingYear !== "") {
          filterParams.passingYear = filter.passingYear
        }

        if (filter.program && filter.program !== "") {
          filterParams.program = filter.program
        }

        console.log("Filter params:", filterParams) // Debug log

        const response = await getAlumni(filterParams)
        console.log("Alumni response:", response) // Debug log

        if (response) {
          // Handle different response formats
          if (response.alumni && Array.isArray(response.alumni)) {
            // Format: { alumni: [...], pagination: {...} }
            setAlumni(response.alumni)
            setPagination({
              currentPage: response.pagination?.page || 1,
              totalPages: response.pagination?.totalPages || 1,
              total: response.pagination?.total || response.alumni.length,
            })
          } else if (Array.isArray(response)) {
            // Format: [...]
            setAlumni(response)
            setPagination({
              currentPage: 1,
              totalPages: 1,
              total: response.length,
            })
          } else if (response.data && Array.isArray(response.data)) {
            // Format: { data: [...], pagination: {...} }
            setAlumni(response.data)
            setPagination({
              currentPage: response.pagination?.page || 1,
              totalPages: response.pagination?.totalPages || 1,
              total: response.pagination?.total || response.data.length,
            })
          } else {
            // Fallback
            console.warn("Unexpected response format:", response)
            setAlumni([])
            setPagination({
              currentPage: 1,
              totalPages: 1,
              total: 0,
            })
          }
        } else {
          setAlumni([])
          setPagination({
            currentPage: 1,
            totalPages: 1,
            total: 0,
          })
        }
      } catch (error: any) {
        console.error("Error fetching alumni:", error)
        setError("Failed to fetch alumni records")
        setAlumni([])
        setPagination({
          currentPage: 1,
          totalPages: 1,
          total: 0,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchAlumni()
    }
  }, [token, filter, pagination.currentPage, isAuthenticated])

  // Clear selections when data changes
  useEffect(() => {
    setSelectedAlumni(new Set())
  }, [alumni])

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(alumni.map((alumnus) => alumnus._id))
      setSelectedAlumni(allIds)
    } else {
      setSelectedAlumni(new Set())
    }
  }

  const handleSelectAlumni = (alumniId: string, checked: boolean) => {
    const newSelected = new Set(selectedAlumni)
    if (checked) {
      newSelected.add(alumniId)
    } else {
      newSelected.delete(alumniId)
    }
    setSelectedAlumni(newSelected)
  }

  const isAllSelected = alumni.length > 0 && selectedAlumni.size === alumni.length
  const isIndeterminate = selectedAlumni.size > 0 && selectedAlumni.size < alumni.length
  const hasSelection = selectedAlumni.size > 0

  const handleBulkExcelDownload = async () => {
    if (selectedAlumni.size === 0) {
      toast.error("Please select at least one alumni to download")
      return
    }

    setIsDownloading(true)
    try {
      // Fetch detailed data for all selected alumni
      const detailedAlumniPromises = Array.from(selectedAlumni).map((id) => getAlumniById(id))

      const detailedAlumniData = await Promise.all(detailedAlumniPromises)

      // Create Excel data
      const excelData = [
        ["SST Alumni Data Collection"],
        ["Bulk Alumni Details Report"],
        ["Generated on:", new Date().toLocaleDateString()],
        ["Total Records:", detailedAlumniData.length.toString()],
        [""],
      ]

      // Add headers for the data table
      const headers = [
        "Full Name",
        "Registration Number",
        "Program",
        "Passing Year",
        "Academic Unit",
        "Email",
        "Phone",
        "Address",
        "Qualified Exam Name",
        "Qualified Exam Roll Number",
        "Qualification Certificate URL",
        "Employment Type",
        "Employer Name",
        "Employer Contact",
        "Employer Email",
        "Self Employment Details",
        "Employment Document URL",
        "Higher Education Institution",
        "Higher Education Program",
        "Higher Education Document URL",
        "ID Proof URL",
      ]

      excelData.push(headers)

      // Add data for each alumni
      detailedAlumniData.forEach((alumni) => {
        const row = [
          alumni.name || "Not provided",
          alumni.registrationNumber || "Not provided",
          alumni.program || "Not provided",
          alumni.passingYear || "Not provided",
          alumni.academicUnit || "Not provided",
          alumni.contactDetails?.email || "Not provided",
          alumni.contactDetails?.phone || "Not provided",
          alumni.contactDetails?.address || "Not provided",
          alumni.qualifiedExams?.examName || "Not provided",
          alumni.qualifiedExams?.rollNumber || "Not provided",
          alumni.qualifiedExams?.certificateUrl || "Not provided",
          alumni.employment?.type || "Not provided",
          alumni.employment?.employerName || "Not provided",
          alumni.employment?.employerContact || "Not provided",
          alumni.employment?.employerEmail || "Not provided",
          alumni.employment?.selfEmploymentDetails || "Not provided",
          alumni.employment?.documentUrl || "Not provided",
          alumni.higherEducation?.institutionName || "Not provided",
          alumni.higherEducation?.programName || "Not provided",
          alumni.higherEducation?.documentUrl || "Not provided",
          alumni.basicInfoImageUrl || "Not provided",
        ]
        excelData.push(row)
      })

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(excelData)

      // Set column widths
      const colWidths = headers.map(() => ({ wch: 25 }))
      ws["!cols"] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Alumni Details")

      // Generate Excel file and trigger download
      const fileName = `alumni_bulk_data_${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast.success(`${selectedAlumni.size} alumni records downloaded successfully`)

      // Clear selections after successful download
      setSelectedAlumni(new Set())
    } catch (error) {
      console.error("Bulk download error:", error)
      toast.error("Failed to download alumni data")
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-6 text-center">
        <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
        <h3 className="font-medium text-destructive">Error loading alumni</h3>
        <p className="text-sm text-destructive/80 mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => setPagination({ ...pagination, currentPage: 1 })}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Header */}
      {alumni && alumni.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                ref={(ref) => {
                  if (ref) {
                    ref.indeterminate = isIndeterminate
                  }
                }}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({alumni.length} items)
              </label>
            </div>
            {selectedAlumni.size > 0 && (
              <span className="text-sm text-muted-foreground">{selectedAlumni.size} selected</span>
            )}
          </div>

          {/* Professional Download Button */}
          <Button
            onClick={handleBulkExcelDownload}
            disabled={!hasSelection || isDownloading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
              ${
                hasSelection
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
              }
            `}
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Selected ({selectedAlumni.size})
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Academic Unit</TableHead>
              <TableHead>Passing Year</TableHead>
              <TableHead>Program</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alumni && alumni.length > 0 ? (
              alumni.map((alumnus) => (
                <TableRow key={alumnus._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedAlumni.has(alumnus._id)}
                      onCheckedChange={(checked) => handleSelectAlumni(alumnus._id, checked as boolean)}
                      aria-label={`Select ${alumnus.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{alumnus.name}</TableCell>
                  <TableCell>{alumnus.contactDetails?.email || "-"}</TableCell>
                  <TableCell>{alumnus.academicUnit}</TableCell>
                  <TableCell>{alumnus.passingYear}</TableCell>
                  <TableCell>{alumnus.program}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/alumni/${alumnus._id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/alumni/${alumnus._id}/edit`}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No alumni records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.currentPage > 1) {
                    handlePageChange(pagination.currentPage - 1)
                  }
                }}
                className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handlePageChange(page)
                  }}
                  isActive={page === pagination.currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (pagination.currentPage < pagination.totalPages) {
                    handlePageChange(pagination.currentPage + 1)
                  }
                }}
                className={pagination.currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

export default AlumniTable
