import { kv } from "@vercel/kv"
import { Thing } from "@/lib/types"
import { things as seedThings } from "@/lib/things"

const THINGS_KEY = "things"

// One-time seed route to migrate existing things to KV
// Call this once: POST /api/seed
export async function POST() {
  try {
    const existing = await kv.get<Thing[]>(THINGS_KEY)
    
    if (existing && existing.length > 0) {
      return Response.json({ 
        message: "Things already exist in KV. Skipping seed.",
        count: existing.length 
      })
    }

    await kv.set(THINGS_KEY, seedThings)
    
    return Response.json({ 
      message: "Successfully seeded things",
      count: seedThings.length 
    })
  } catch (error) {
    console.error("Seed error:", error)
    return Response.json({ error: "Failed to seed" }, { status: 500 })
  }
}

