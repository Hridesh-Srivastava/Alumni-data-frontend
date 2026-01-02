"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X, Loader2 } from "lucide-react"
import { getAcademicUnits, getPrograms, getPassingYears } from "@/services/alumni-service"

interface AlumniFilterProps {
  onFilterChange: (filter: {
    academicUnit: string
    passingYear: string
    program: string
  }) => void
}

export function AlumniFilter({ onFilterChange }: AlumniFilterProps) {
  const [academicUnit, setAcademicUnit] = useState("all") // Start with "all" instead of empty string
  const [passingYear, setPassingYear] = useState("all") // Start with "all" instead of empty string
  const [program, setProgram] = useState("")
  const [academicUnits, setAcademicUnits] = useState<string[]>([])
  const [programs, setPrograms] = useState<string[]>([])
  const [passingYears, setPassingYears] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch academic units, programs, and passing years
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [units, programsList, yearsList] = await Promise.all([
          getAcademicUnits(),
          getPrograms(),
          getPassingYears()
        ])
        setAcademicUnits(units || [])
        setPrograms(programsList || [])
        setPassingYears(yearsList || [])
      } catch (error) {
        console.error("Error fetching filter data:", error)
        // On error, keep empty arrays - don't set fallback data
        setAcademicUnits([])
        setPrograms([])
        setPassingYears([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApplyFilter = () => {
    onFilterChange({
      academicUnit,
      passingYear,
      program,
    })
  }

  const handleResetFilter = () => {
    setAcademicUnit("all") // Reset to "all" instead of empty string
    setPassingYear("all") // Reset to "all" instead of empty string
    setProgram("")
    onFilterChange({
      academicUnit: "all", // Send "all" instead of empty string
      passingYear: "all", // Send "all" instead of empty string
      program: "",
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-3">
        
          <div className="space-y-2">
            <Label htmlFor="academicUnit">Academic Unit</Label>
            <Select value={academicUnit} onValueChange={setAcademicUnit} disabled={isLoading}>
              <SelectTrigger id="academicUnit">
                <SelectValue placeholder={isLoading ? "Loading..." : "Select Academic Unit"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading Units...
                    </div>
                  </SelectItem>
                ) : (
                  academicUnits.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))
                )}
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
                {passingYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

         
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <div className="relative">
              <Input
                id="program"
                placeholder="e.g. BCA, B.Tech, MCA, M.Tech, BSc., MSc."
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="min-w-[200px]"
                list="program-suggestions"
              />
              {programs.length > 0 && (
                <datalist id="program-suggestions">
                  {programs.map((prog) => (
                    <option key={prog} value={prog} />
                  ))}
                </datalist>
              )}
            </div>
            {programs.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Available programs: {programs.slice(0, 5).join(", ")}
                {programs.length > 5 && ` and ${programs.length - 5} more...`}
              </p>
            )}
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