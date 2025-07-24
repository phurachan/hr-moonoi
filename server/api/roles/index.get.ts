import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string
    const isActive = query.isActive as string
    
    // Build filter object
    const filter: any = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true'
    }
    
    // Get total count
    const total = await Role.countDocuments(filter)
    
    // Get roles with pagination
    const roles = await Role.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching roles:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch roles'
    })
  }
})