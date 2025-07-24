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
    
    // Check if user has permission to view user roles (admin or hr)
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions',
      })
    }
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    const user = await User.findById(id)
      .populate('roles', 'name description permissions isActive')
      .lean()
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return {
      success: true,
      data: user.roles || []
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
    console.error('Error fetching user roles:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user roles'
    })
  }
})