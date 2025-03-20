"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Edit, Trash2, Plus, Save } from "lucide-react"

interface AcademicUnit {
  id: string
  name: string
  shortName: string
  description: string
}

export default function AcademicUnitsPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [academicUnits, setAcademicUnits] = useState<AcademicUnit[]>([
    {
      id: "1",
      name: "Himalayan School of Science/Engineering and Technology",
      shortName: "HSST",
      description: "School focused on engineering and technology education",
    },
    {
      id: "2",
      name: "Himalayan Institute of Medical Sciences (Medical)",
      shortName: "HIMS (Medical)",
      description: "Medical education and healthcare training",
    },
    {
      id: "3",
      name: "Himalayan School of Management Studies",
      shortName: "HSMS",
      description: "Business and management education",
    },
    {
      id: "4",
      name: "Himalayan College of Nursing",
      shortName: "HCN",
      description: "Nursing education and healthcare training",
    },
  ])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
  })
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, loading, router])

  const handleEdit = (unit: AcademicUnit) => {
    setEditingId(unit.id)
    setFormData({
      name: unit.name,
      shortName: unit.shortName,
      description: unit.description,
    })
  }

  const handleSave = () => {
    if (editingId) {
      setAcademicUnits(academicUnits.map((unit) => (unit.id === editingId ? { ...unit, ...formData } : unit)))
      toast.success("Academic unit updated successfully")
    } else if (isAdding) {
      const newUnit = {
        id: Math.random().toString(36).substring(2, 9),
        ...formData,
      }
      setAcademicUnits([...academicUnits, newUnit])
      toast.success("Academic unit added successfully")
    }
    setEditingId(null)
    setIsAdding(false)
    setFormData({ name: "", shortName: "", description: "" })
  }

  const handleDelete = (id: string) => {
    setAcademicUnits(academicUnits.filter((unit) => unit.id !== id))
    toast.success("Academic unit deleted successfully")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddNew = () => {
    setIsAdding(true)
    setFormData({ name: "", shortName: "", description: "" })
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ name: "", shortName: "", description: "" })
  }

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Academic Units"
        description="Manage academic units in the system"
        action={
          <Button onClick={handleAddNew} disabled={isAdding || editingId !== null}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Unit
          </Button>
        }
      />

      <div className="space-y-6">
        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Academic Unit</CardTitle>
              <CardDescription>Enter details for the new academic unit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Himalayan School of Science and Technology"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortName">Short Name / Abbreviation</Label>
                <Input
                  id="shortName"
                  name="shortName"
                  value={formData.shortName}
                  onChange={handleChange}
                  placeholder="e.g. HSST"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the academic unit"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </CardFooter>
          </Card>
        )}

        {academicUnits.map((unit) => (
          <Card key={unit.id}>
            {editingId === unit.id ? (
              <>
                <CardHeader>
                  <CardTitle>Edit Academic Unit</CardTitle>
                  <CardDescription>Update the details for this academic unit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${unit.id}`}>Full Name</Label>
                    <Input id={`name-${unit.id}`} name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`shortName-${unit.id}`}>Short Name / Abbreviation</Label>
                    <Input
                      id={`shortName-${unit.id}`}
                      name="shortName"
                      value={formData.shortName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${unit.id}`}>Description</Label>
                    <Input
                      id={`description-${unit.id}`}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{unit.name}</CardTitle>
                      <CardDescription>{unit.shortName}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(unit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(unit.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{unit.description}</p>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    </DashboardLayout>
  )
}

