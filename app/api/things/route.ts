import { auth } from "@/lib/auth"
import { get, set } from "@/lib/redis"
import { NextRequest, NextResponse } from "next/server"
import { Thing, ThingStatus } from "@/lib/types"

const THINGS_KEY = "things"

// GET - Fetch all things
export async function GET() {
  try {
    const things = await get<Thing[]>(THINGS_KEY)
    return NextResponse.json(things || [])
  } catch (error) {
    console.error("Error fetching things:", error)
    return NextResponse.json({ error: "Failed to fetch things" }, { status: 500 })
  }
}

// POST - Add new thing
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, status, image } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!status || !["like", "have", "want"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required (like, have, or want)" }, { status: 400 })
    }

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const things = (await get<Thing[]>(THINGS_KEY)) || []
    const newThing: Thing = {
      id: Date.now().toString(),
      title: title.trim(),
      status: status as ThingStatus,
      image,
    }

    things.push(newThing)
    await set(THINGS_KEY, things)

    return NextResponse.json(newThing, { status: 201 })
  } catch (error) {
    console.error("Error creating thing:", error)
    return NextResponse.json({ error: "Failed to create thing" }, { status: 500 })
  }
}

// DELETE - Remove thing
export async function DELETE(request: NextRequest) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }

    const things = (await get<Thing[]>(THINGS_KEY)) || []
    const filtered = things.filter(t => t.id !== id)
    await set(THINGS_KEY, filtered)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting thing:", error)
    return NextResponse.json({ error: "Failed to delete thing" }, { status: 500 })
  }
}

