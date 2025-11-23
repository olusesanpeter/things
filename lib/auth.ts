import { auth as getSession } from "@/app/api/auth/[...nextauth]/route"

export async function auth() {
  try {
    const session = await getSession()
    return session
  } catch (error) {
    console.error("Auth error:", error)
    return null
  }
}

