"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react"
import {
  getAcademicUnits,
  createAcademicUnit,
  updateAcademicUnit,
  deleteAcademicUnit,
} from "@/services/academic-unit-service"

interface AcademicUnit {
  _id: string
  name: string
  shortName: string
  description: string
}

export default function AcademicUnitsPage() {
  const [academicUnits, setAcademicUnits] = useState<AcademicUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentUnit, setCurrentUnit] = useState<AcademicUnit | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch academic units on component mount
  useEffect(() => {
    fetchAcademicUnits()
  }, [])

  const fetchAcademicUnits = async () => {
    setLoading(true)
    try {
      const data = await getAcademicUnits()
      setAcademicUnits(data)
    } catch (error) {
      console.error("Error fetching academic units:", error)
      toast.error("Failed to load academic units")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddUnit = () => {
    setEditMode(false)
    setCurrentUnit(null)
    setFormData({
      name: "",
      shortName: "",
      description: "",
    })
    setModalOpen(true)
  }

  const handleEditUnit = (unit: AcademicUnit) => {
    setEditMode(true)
    setCurrentUnit(unit)
    setFormData({
      name: unit.name,
      shortName: unit.shortName,
      description: unit.description,
    })
    setModalOpen(true)
  }

  const handleDeleteUnit = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this academic unit?")) {
      try {
        await deleteAcademicUnit(id)
        setAcademicUnits((prev) => prev.filter((unit) => unit._id !== id))
        toast.success("Academic unit deleted successfully")
      } catch (error) {
        console.error("Error deleting academic unit:", error)
        toast.error("Failed to delete academic unit")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editMode && currentUnit) {
        // Update existing unit
        const updatedUnit = await updateAcademicUnit(currentUnit._id, formData)
        setAcademicUnits((prev) => prev.map((unit) => (unit._id === currentUnit._id ? updatedUnit : unit)))
        toast.success("Academic unit updated successfully")
      } else {
        // Create new unit
        const newUnit = await createAcademicUnit(formData)
        setAcademicUnits((prev) => [...prev, newUnit])
        toast.success("Academic unit created successfully")
      }

      setModalOpen(false)
    } catch (error) {
      console.error("Error saving academic unit:", error)
      toast.error(`Failed to ${editMode ? "update" : "create"} academic unit`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Academic Units</h1>
          <p className="text-muted-foreground">Manage academic units in the system</p>
        </div>
        <Button onClick={handleAddUnit}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Unit
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {academicUnits.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground mb-4">No academic units found</p>
                <Button onClick={handleAddUnit}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Unit
                </Button>
              </CardContent>
            </Card>
          ) : (
            academicUnits.map((unit) => (
              <Card key={unit._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{unit.name}</CardTitle>
                      <CardDescription>{unit.shortName}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditUnit(unit)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteUnit(unit._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{unit.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal for adding/editing academic units */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">{editMode ? "Edit Academic Unit" : "Add New Academic Unit"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Himalayan School of Science and Technology"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    name="shortName"
                    value={formData.shortName}
                    onChange={handleInputChange}
                    placeholder="e.g., HSST"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the academic unit"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editMode ? "Update" : "Create"}</>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

