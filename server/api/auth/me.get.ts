import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
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
    
    // Find user by ID and populate roles
    const user = await User.findById(decoded.userId)
      .populate('roles', 'name description permissions isActive')
    
    if (!user || !user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found or inactive',
      })
    }
    
    // Return user data
    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified,
        roles: user.roles || []
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
    console.error('Get user error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})