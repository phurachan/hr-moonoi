import User from '~/models/User'
import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyToken, extractTokenFromHeader } from '~/lib/jwt'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required',
      })
    }
    
    // Verify and decode token
    const decoded = verifyToken(token)
    
    // Find current user to check permissions
    const currentUser = await User.findById(decoded.userId)
    
    if (!currentUser || !currentUser.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found or inactive',
      })
    }
    
    // Check if user has permission to view users (admin or hr)
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions',
      })
    }
    
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 50
    const search = query.search as string
    const isActive = query.isActive as string
    
    // Build filter object
    const filter: any = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true'
    }
    
    // Get total count
    const total = await User.countDocuments(filter)
    
    // Get users with pagination and populate roles
    const users = await User.find(filter)
      .populate('roles', 'name description isActive')
      .select('_id name email role department position avatar lastLogin emailVerified isActive roles')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
    
    // Transform users data
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      avatar: user.avatar,
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      roles: user.roles || []
    }))
    
    return {
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }
    
    // Handle JWT errors
    if (error.message === 'Invalid or expired token') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token',
      })
    }
    
    // Log unexpected errors
    console.error('Get users error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})