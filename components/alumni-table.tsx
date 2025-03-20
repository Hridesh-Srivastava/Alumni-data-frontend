"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Alumni {
  _id: string
  name: string
  academicUnit: string
  program: string
  passingYear: string
  registrationNumber: string
}

interface AlumniTableProps {
  filter: {
    academicUnit: string
    passingYear: string
    program: string
  }
}

export function AlumniTable({ filter }: AlumniTableProps) {
  const { token } = useAuth()
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  })

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setIsLoading(true)
        if (token) {
          // In a real app, this would fetch from the API with filters
          // For demo purposes, we'll use mock data
          const mockAlumni = [
            {
              _id: "1",
              name: "Ashish Rautela",
              academicUnit: "Himalayan School of Science/Engineering and Technology",
              program: "BCA",
              passingYear: "2021-22",
              registrationNumber: "DD2017304002",
            },
            {
              _id: "2",
              name: "Khushi",
              academicUnit: "Himalayan School of Science/Engineering and Technology",
              program: "BCA",
              passingYear: "2021-22",
              registrationNumber: "DD2017304003",
            },
            {
              _id: "3",
              name: "Manish Semwal",
              academicUnit: "Himalayan School of Science/Engineering and Technology",
              program: "BCA",
              passingYear: "2022-23",
              registrationNumber: "DD2018304001",
            },
            {
              _id: "4",
              name: "Mansi Pokhriyal",
              academicUnit: "Himalayan School of Science/Engineering and Technology",
              program: "BCA",
              passingYear: "2022-23",
              registrationNumber: "DD2018304005",
            },
            {
              _id: "5",
              name: "Nikita Negi",
              academicUnit: "Himalayan School of Science/Engineering and Technology",
              program: "BCA",
              passingYear: "2022-23",
              registrationNumber: "DD2018304008",
            },
            {
              _id: "6",
              name: "Rahul Sharma",
              academicUnit: "Himalayan School of Management Studies",
              program: "MBA",
              passingYear: "2019-20",
              registrationNumber: "DD2017204001",
            },
            {
              _id: "7",
              name: "Priya Singh",
              academicUnit: "Himalayan Institute of Medical Sciences (Medical)",
              program: "MBBS",
              passingYear: "2018-19",
              registrationNumber: "DD2013104005",
            },
            {
              _id: "8",
              name: "Amit Kumar",
              academicUnit: "Himalayan School of Science/Engineering and Technology",
              program: "B.Tech",
              passingYear: "2019-20",
              registrationNumber: "DD2015304010",
            },
            {
              _id: "9",
              name: "Neha Gupta",
              academicUnit: "Himalayan College of Nursing",
              program: "B.Sc Nursing",
              passingYear: "2020-21",
              registrationNumber: "DD2016404002",
            },
            {
              _id: "10",
              name: "Vikram Joshi",
              academicUnit: "Himalayan School of Science/Engineering and Technology",
              program: "MCA",
              passingYear: "2018-19",
              registrationNumber: "DD2016304015",
            },
          ]

          // Apply filters if any
          let filteredAlumni = [...mockAlumni]

          if (filter.academicUnit && filter.academicUnit !== "all") {
            filteredAlumni = filteredAlumni.filter((a) => a.academicUnit === filter.academicUnit)
          }

          if (filter.passingYear && filter.passingYear !== "all") {
            filteredAlumni = filteredAlumni.filter((a) => a.passingYear === filter.passingYear)
          }

          if (filter.program) {
            filteredAlumni = filteredAlumni.filter((a) =>
              a.program.toLowerCase().includes(filter.program.toLowerCase()),
            )
          }

          setAlumni(filteredAlumni)
          setPagination({
            currentPage: 1,
            totalPages: Math.ceil(filteredAlumni.length / 10),
            total: filteredAlumni.length,
          })
        }
      } catch (error) {
        console.error("Error fetching alumni:", error)
        toast.error("Failed to fetch alumni records")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlumni()
  }, [token, filter])

  const handleDelete = (id: string) => {
    // In a real app, this would call the API to delete the record
    toast.success("Record deleted", {
      description: "The alumni record has been deleted successfully.",
    })

    // Update the local state
    setAlumni(alumni.filter((a) => a._id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Registration No.</TableHead>
              <TableHead className="hidden md:table-cell">Program</TableHead>
              <TableHead className="hidden md:table-cell">Passing Year</TableHead>
              <TableHead className="hidden lg:table-cell">Academic Unit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <div className="h-6 w-full animate-pulse rounded bg-gray-200"></div>
                    </TableCell>
                  </TableRow>
                ))
            ) : alumni.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No alumni records found
                </TableCell>
              </TableRow>
            ) : (
              alumni.map((alumnus) => (
                <TableRow key={alumnus._id}>
                  <TableCell className="font-medium">{alumnus.name}</TableCell>
                  <TableCell>{alumnus.registrationNumber}</TableCell>
                  <TableCell className="hidden md:table-cell">{alumnus.program}</TableCell>
                  <TableCell className="hidden md:table-cell">{alumnus.passingYear}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {alumnus.academicUnit.length > 30
                      ? `${alumnus.academicUnit.substring(0, 30)}...`
                      : alumnus.academicUnit}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/alumni/${alumnus._id}`}>
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/alumni/${alumnus._id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(alumnus._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage - 1,
                    })
                  }
                }}
                className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === pagination.currentPage}
                  onClick={(e) => {
                    e.preventDefault()
                    setPagination({
                      ...pagination,
                      currentPage: page,
                    })
                  }}
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
                    setPagination({
                      ...pagination,
                      currentPage: pagination.currentPage + 1,
                    })
                  }
                }}
                className={pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

