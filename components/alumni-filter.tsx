"use client"

import { useState } from "react"
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
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                <SelectItem value="Himalayan School of Science/Engineering and Technology">HSST</SelectItem>
                <SelectItem value="Himalayan Institute of Medical Sciences (Medical)">HIMS (Medical)</SelectItem>
                <SelectItem value="Himalayan Institute of Medical Sciences (Paramedical)">
                  HIMS (Paramedical)
                </SelectItem>
                <SelectItem value="Himalayan School of Management Studies">HSMS</SelectItem>
                <SelectItem value="Himalayan College of Nursing">HCN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="passingYear">Passing Year</Label>
            <Select value={passingYear} onValueChange={setPassingYear}>
              <SelectTrigger id="passingYear">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
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
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              placeholder="e.g. BCA, B.Tech, MBBS"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
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

