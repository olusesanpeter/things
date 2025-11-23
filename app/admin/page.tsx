"use client"

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Thing, ThingStatus } from "@/lib/types"
import Image from "next/image"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [things, setThings] = useState<Thing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
      const res = await fetch("/api/things")
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

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData
      })

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || "Upload failed")
      }
      
      const { url } = await uploadRes.json()

      // Create thing
      const thingRes = await fetch("/api/things", {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this thing?")) {
      return
    }

    try {
      const res = await fetch(`/api/things?id=${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        await fetchThings()
        setSuccess("Thing deleted successfully!")
        setTimeout(() => setSuccess(""), 3000)
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
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="text-black/60 hover:text-black underline"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700">
            {success}
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-2xl font-medium mb-6">Add New Thing</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-black font-medium">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-black/20 p-3 text-black focus:outline-none focus:border-black"
                required
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block mb-2 text-black font-medium">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ThingStatus })}
                className="w-full border border-black/20 p-3 text-black focus:outline-none focus:border-black"
                disabled={uploading}
              >
                <option value="like">Like</option>
                <option value="have">Have</option>
                <option value="want">Want</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-black font-medium">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-black/20 p-3 text-black focus:outline-none focus:border-black"
                required
                disabled={uploading}
              />
              {imagePreview && (
                <div className="mt-4 w-full max-w-[445px] h-[294px] bg-[#d9d9d9] relative overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !formData.image}
              className="bg-black text-white px-6 py-3 disabled:opacity-50 transition-opacity"
            >
              {uploading ? "Uploading..." : "Add Thing"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-2xl font-medium mb-6">Existing Things ({things.length})</h2>
          
          {things.length === 0 ? (
            <p className="text-black/60">No things yet. Add your first one above!</p>
          ) : (
            <div className="space-y-4">
              {things.map((thing) => (
                <div
                  key={thing.id}
                  className="flex items-center gap-4 p-4 border border-black/10"
                >
                  {thing.image && (
                    <div className="w-24 h-24 bg-[#d9d9d9] relative flex-shrink-0 overflow-hidden">
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
                  <button
                    onClick={() => handleDelete(thing.id)}
                    className="text-red-600 hover:text-red-800 underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

