import { createClient } from "redis"

let client: ReturnType<typeof createClient> | null = null
let connecting = false

async function getRedisClient() {
  // In serverless, we need to handle reconnection
  if (client && client.isOpen) {
    return client
  }

  // Prevent multiple simultaneous connections
  if (connecting) {
    // Wait a bit and retry
    await new Promise(resolve => setTimeout(resolve, 100))
    return getRedisClient()
  }

  connecting = true

  try {
    const redisUrl = process.env.REDIS_URL
    
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is not set")
    }

    // Close existing client if it exists but isn't open
    if (client && !client.isOpen) {
      try {
        await client.quit()
      } catch (e) {
        // Ignore errors when closing
      }
    }

    client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return new Error("Too many retries")
          }
          return Math.min(retries * 100, 1000)
        }
      }
    })

    client.on("error", (err) => {
      console.error("Redis Client Error", err)
    })

    await client.connect()
    connecting = false
    return client
  } catch (error) {
    connecting = false
    console.error("Failed to connect to Redis:", error)
    throw error
  }
}

// Helper functions for our use case
export async function get<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient()
  const value = await redis.get(key)
  return value ? JSON.parse(value) : null
}

export async function set(key: string, value: any): Promise<void> {
  const redis = await getRedisClient()
  await redis.set(key, JSON.stringify(value))
}

export async function del(key: string): Promise<void> {
  const redis = await getRedisClient()
  await redis.del(key)
}

