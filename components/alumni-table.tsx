"use client"

// Import the Dialog components and Trash2 icon
import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { getAlumni, deleteAlumni } from "@/services/alumni-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import axios from "axios"

interface Alumni {
  _id: string
  name: string
  contactDetails?: {
    email?: string
  }
  academicUnit: string
  passingYear: string
  program: string
}

interface FilterParams {
  academicUnit?: string
  passingYear?: string
  program?: string
}

interface AlumniTableProps {
  filter: FilterParams
}

export function AlumniTable({ filter }: AlumniTableProps) {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  // Add state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [alumniToDelete, setAlumniToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Build filter object
        const filterParams: any = {
          page: pagination.currentPage,
          limit: 10,
        }

        if (filter.academicUnit && filter.academicUnit !== "all") {
          filterParams.academicUnit = filter.academicUnit
        }

        if (filter.passingYear && filter.passingYear !== "all") {
          filterParams.passingYear = filter.passingYear
        }

        if (filter.program) {
          filterParams.program = filter.program
        }

        const response = await getAlumni(filterParams)

        if (response && response.data) {
          setAlumni(response.data)
          setPagination({
            currentPage: response.pagination?.page || 1,
            totalPages: response.pagination?.totalPages || 1,
            total: response.pagination?.total || 0,
          })
        } else {
          // Fallback to empty array if no data
          setAlumni([])
          setPagination({
            currentPage: 1,
            totalPages: 1,
            total: 0,
          })
        }
      } catch (error) {
        console.error("Error fetching alumni:", error)
        setError("Failed to fetch alumni records")
        // Set empty data on error
        setAlumni([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlumni()
  }, [token, filter, pagination.currentPage])

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, currentPage: page })
  }

  // Add handlers for delete functionality
  const handleDeleteClick = (id: string) => {
    setAlumniToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!alumniToDelete) return

    setIsDeleting(true)
    try {
      console.log("Attempting to delete alumni with ID:", alumniToDelete)
      console.log("Using token:", token ? "Token exists" : "No token")

      await deleteAlumni(alumniToDelete, token)
      setAlumni((prev) => prev.filter((alumnus) => alumnus._id !== alumniToDelete))
      toast.success("Alumni deleted successfully")
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting alumni:", error)

      // More specific error message based on the error
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          toast.error("Authentication failed. Please log in again.")
        } else if (error.response.status === 403) {
          toast.error("You don't have permission to delete this alumni.")
        } else {
          toast.error(`Failed to delete alumni: ${error.response.data?.message || error.message}`)
        }
      } else {
        toast.error("Failed to delete alumni")
      }
    } finally {
      setIsDeleting(false)
      setAlumniToDelete(null)
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Academic Unit</TableHead>
              <TableHead>Passing Year</TableHead>
              <TableHead>Program</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alumni.length > 0 ? (
              alumni.map((alumnus) => (
                <TableRow key={alumnus._id}>
                  <TableCell className="font-medium">{alumnus.name}</TableCell>
                  <TableCell>{alumnus.contactDetails?.email || "-"}</TableCell>
                  <TableCell>{alumnus.academicUnit}</TableCell>
                  <TableCell>{alumnus.passingYear}</TableCell>
                  <TableCell>{alumnus.program}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/alumni/${alumnus._id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/alumni/${alumnus._id}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(alumnus._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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

      {/* Add delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Alumni</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this alumni? This action can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AlumniTable
