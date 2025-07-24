import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string
    const module = query.module as string
    const action = query.action as string
    const isActive = query.isActive as string
    
    // Build filter object
    const filter: any = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { module: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } }
      ]
    }
    if (module) {
      filter.module = module
    }
    if (action) {
      filter.action = action
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true'
    }
    
    // Get total count
    const total = await Permission.countDocuments(filter)
    
    // Get permissions with pagination
    const permissions = await Permission.find(filter)
      .sort({ module: 1, action: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    return {
      permissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching permissions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch permissions'
    })
  }
})