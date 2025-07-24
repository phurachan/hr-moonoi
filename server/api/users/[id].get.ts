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
    
    // Get user ID from route params
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required',
      })
    }
    
    // Check if user has permission to view users (admin, hr, or viewing own profile)
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr' && currentUser._id.toString() !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions',
      })
    }
    
    // Find the user
    const user = await User.findById(userId)
      .populate('roles', 'name description isActive')
      .select('_id name email role department position avatar lastLogin emailVerified isActive roles createdAt updatedAt')
      .lean()
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }
    
    // Transform user data
    const transformedUser = {
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
      roles: user.roles || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
    
    return {
      success: true,
      user: transformedUser
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