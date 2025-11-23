import { createClient } from "redis"

let client: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL
    
    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is not set")
    }

    client = createClient({
      url: redisUrl,
    })

    client.on("error", (err) => {
      console.error("Redis Client Error", err)
    })

    await client.connect()
  }

  return client
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

