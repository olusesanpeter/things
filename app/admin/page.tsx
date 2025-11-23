"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Thing, ThingStatus } from "@/lib/types"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Helper to get the correct API path based on current location
function getApiPath(path: string) {
  // If we're on a /things path (proxied), use /things prefix
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/things")) {
    return `/things${path}`
  }
  return path
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [things, setThings] = useState<Thing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [thingToDelete, setThingToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    status: "like" as ThingStatus,
    image: null as File | null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchThings()
    }
  }, [session])

  const fetchThings = async () => {
    try {
      const res = await fetch(getApiPath("/api/things"))
      if (res.ok) {
        const data = await res.json()
        setThings(data)
      }
    } catch (err) {
      console.error("Error fetching things:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      setFormData({ ...formData, image: file })
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setUploading(true)

    try {
      if (!formData.image) {
        setError("Please select an image")
        setUploading(false)
        return
      }

      // Upload image
      const uploadFormData = new FormData()
      uploadFormData.append("file", formData.image)

      const uploadRes = await fetch(getApiPath("/api/upload"), {
        method: "POST",
        body: uploadFormData
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || "Upload failed")
      }
      
      const { url } = await uploadRes.json()

      // Create thing
      const thingRes = await fetch(getApiPath("/api/things"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          status: formData.status,
          image: url
        })
      })

      if (!thingRes.ok) {
        const errorData = await thingRes.json()
        throw new Error(errorData.error || "Failed to create thing")
      }

      // Reset form
      setFormData({ title: "", status: "like", image: null })
      setImagePreview(null)
      setSuccess("Thing added successfully!")
      await fetchThings()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteClick = (id: string) => {
    setThingToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!thingToDelete) return

    try {
      const res = await fetch(`${getApiPath("/api/things")}?id=${thingToDelete}`, {
        method: "DELETE"
      })

      if (res.ok) {
        await fetchThings()
        setSuccess("Thing deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
        setDeleteDialogOpen(false)
        setThingToDelete(null)
      } else {
        setError("Failed to delete thing")
      }
    } catch (err) {
      setError("An error occurred while deleting")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black/60">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[40px] font-medium leading-normal text-black tracking-[-2px]">
            Admin
          </h1>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
          >
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Add New Thing</CardTitle>
            <CardDescription>Create a new thing with title, status, and image</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  disabled={uploading}
                  placeholder="Enter thing title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ThingStatus })}
                  disabled={uploading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="like">Like</SelectItem>
                    <SelectItem value="have">Have</SelectItem>
                    <SelectItem value="want">Want</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  disabled={uploading}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4 w-full max-w-[445px] h-[294px] bg-[#d9d9d9] relative overflow-hidden rounded-sm">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={uploading || !formData.image}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Add Thing"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Things ({things.length})</CardTitle>
            <CardDescription>Manage your things</CardDescription>
          </CardHeader>
          <CardContent>
            {things.length === 0 ? (
              <p className="text-black/60 text-center py-8">No things yet. Add your first one above!</p>
            ) : (
              <div className="space-y-4">
                {things.map((thing) => (
                  <Card key={thing.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {thing.image && (
                          <div className="w-24 h-24 bg-[#d9d9d9] relative flex-shrink-0 overflow-hidden rounded-sm">
                            <Image
                              src={thing.image}
                              alt={thing.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{thing.title}</h3>
                          <p className="text-black/60 text-sm">Status: {thing.status}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(thing.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Thing</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this thing? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setThingToDelete(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
