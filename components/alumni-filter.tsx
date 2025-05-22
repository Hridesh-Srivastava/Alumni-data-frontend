"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"

interface AlumniFilterProps {
  onFilterChange: (filter: {
    academicUnit: string
    passingYear: string
    program: string
  }) => void
}

export function AlumniFilter({ onFilterChange }: AlumniFilterProps) {
  const [academicUnit, setAcademicUnit] = useState("")
  const [passingYear, setPassingYear] = useState("")
  const [program, setProgram] = useState("")
  const [yearOptions, setYearOptions] = useState<string[]>([])

 
  useEffect(() => {
    const generateYearOptions = () => {
      const currentYear = new Date().getFullYear()
      const startYear = 2015
      const endYear = currentYear + 10

      const years: string[] = []

      for (let year = startYear; year <= endYear; year++) {
        const nextYearShort = (year + 1).toString().slice(-2).padStart(2, '0')
        years.push(`${year}-${nextYearShort}`)
      }

      return years.sort((a, b) => {
        const yearA = parseInt(a.split('-')[0])
        const yearB = parseInt(b.split('-')[0])
        return yearB - yearA
      })
    }

    setYearOptions(generateYearOptions())
  }, [])

  const handleApplyFilter = () => {
    onFilterChange({
      academicUnit,
      passingYear,
      program,
    })
  }

  const handleResetFilter = () => {
    setAcademicUnit("")
    setPassingYear("")
    setProgram("")
    onFilterChange({
      academicUnit: "",
      passingYear: "",
      program: "",
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
        
          <div className="space-y-2">
            <Label htmlFor="academicUnit">Academic Unit</Label>
            <Select value={academicUnit} onValueChange={setAcademicUnit}>
              <SelectTrigger id="academicUnit">
                <SelectValue placeholder="Select Academic Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="School of Science and Technology">SST</SelectItem>
              </SelectContent>
            </Select>
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="passingYear">Passing Year</Label>
            <Select value={passingYear} onValueChange={setPassingYear}>
              <SelectTrigger id="passingYear" className="min-w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                <SelectItem value="all">All Years</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              placeholder="e.g. BCA, B.Tech, MCA, M.Tech, BSc., MSc."
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="min-w-[200px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleResetFilter}>
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleApplyFilter}>
          <Search className="mr-2 h-4 w-4" />
          Apply Filter
        </Button>
      </CardFooter>
    </Card>
  )
}