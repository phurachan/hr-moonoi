import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGO_URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable')
}

interface MongooseCache {
  conn: mongoose.Connection | null
  promise: Promise<mongoose.Connection> | null
}

// Global cache for connection in development
const globalWithMongo = global as typeof global & {
  mongoose: MongooseCache
}

let cached = globalWithMongo.mongoose

if (!cached) {
  cached = globalWithMongo.mongoose = { conn: null, promise: null }
}

export async function connectMongoDB(): Promise<mongoose.Connection> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose.connection
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}