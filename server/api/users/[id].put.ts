import User from '~/models/User'
import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyToken, extractTokenFromHeader } from '~/lib/jwt'
import bcrypt from 'bcryptjs'

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
    
    // Check if user has permission to update users (admin or hr)
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to update users',
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
    
    // Get request body
    const body = await readBody(event)
    const { name, email, department, position, isActive, password } = body
    
    // Validation
    const errors: Record<string, string> = {}
    
    if (!name || !name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!email || !email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters long'
    }
    
    // Check if email already exists (excluding current user)
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      })
      
      if (existingUser) {
        errors.email = 'Email already exists'
      }
    }
    
    if (Object.keys(errors).length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: { errors }
      })
    }
    
    // Find the user to update
    const userToUpdate = await User.findById(userId)
    
    if (!userToUpdate) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }
    
    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department?.trim() || '',
      position: position?.trim() || '',
      isActive: isActive !== false, // Default to true if not specified
      updatedAt: new Date()
    }
    
    // Hash password if provided
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 12)
    }
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '_id name email role department position avatar lastLogin emailVerified isActive'
      }
    ).populate('roles', 'name description isActive')
    
    if (!updatedUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }
    
    // Transform user data for response
    const transformedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      position: updatedUser.position,
      avatar: updatedUser.avatar,
      lastLogin: updatedUser.lastLogin,
      emailVerified: updatedUser.emailVerified,
      isActive: updatedUser.isActive,
      roles: updatedUser.roles || []
    }
    
    return {
      success: true,
      message: 'User updated successfully',
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
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors: Record<string, string> = {}
      for (const field in error.errors) {
        errors[field] = error.errors[field].message
      }
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: { errors }
      })
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation failed',
        data: { 
          errors: { 
            [field]: `${field} already exists` 
          } 
        }
      })
    }
    
    // Log unexpected errors
    console.error('Update user error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})