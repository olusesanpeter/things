import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import type { NextRequest } from "next/server"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const providedPassword = credentials?.password as string | undefined
          const expectedPassword = process.env.ADMIN_PASSWORD
          
          if (!expectedPassword) {
            console.error("ADMIN_PASSWORD environment variable is not set")
            return null
          }
          
          if (providedPassword === expectedPassword) {
            return { id: "1", name: "Admin" }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  pages: {
    signIn: "/admin/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const
  },
  debug: process.env.NODE_ENV === "development"
}

const { handlers } = NextAuth(authOptions)

export const GET = handlers.GET
export const POST = handlers.POST

