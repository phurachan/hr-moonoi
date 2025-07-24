import User from '~/models/User'
import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'
import { verifyToken, extractTokenFromHeader } from '~/lib/jwt'
import mongoose from 'mongoose'

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
    
    // Check if user has permission to update user roles (admin or hr)
    if (currentUser.role !== 'admin' && currentUser.role !== 'hr') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions',
      })
    }
    
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { roleIds } = body
    
    console.log('Updating user roles:', { userId: id, roleIds })
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required'
      })
    }
    
    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Validate role IDs if provided
    if (roleIds && roleIds.length > 0) {
      // Filter out null/undefined values and convert string IDs to ObjectIds
      const validRoleIds = roleIds.filter(id => id != null && id !== '')
      
      if (validRoleIds.length === 0) {
        // If no valid IDs after filtering, just clear the roles
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { roles: [] },
          { new: true, runValidators: true }
        ).populate('roles', 'name description permissions isActive').lean()
        
        return {
          success: true,
          data: updatedUser.roles || [],
          message: 'User roles updated successfully'
        }
      }
      
      const objectIds = validRoleIds.map(id => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id)
        }
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid role ID format: ${id}`
        })
      })
      
      const validRoles = await Role.countDocuments({ 
        _id: { $in: objectIds }, 
        isActive: true 
      })
      if (validRoles !== validRoleIds.length) {
        throw createError({
          statusCode: 400,
          statusMessage: 'One or more role IDs are invalid'
        })
      }
      
      // Update user roles with validated ObjectIds
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { roles: objectIds },
        { new: true, runValidators: true }
      ).populate('roles', 'name description permissions isActive').lean()
      
      return {
        success: true,
        data: updatedUser.roles || [],
        message: 'User roles updated successfully'
      }
    }
    
    // Update user roles (empty array if no roleIds provided)
    const rolesToAssign = []
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { roles: rolesToAssign },
      { new: true, runValidators: true }
    ).populate('roles', 'name description permissions isActive').lean()
    
    return {
      success: true,
      data: updatedUser.roles || [],
      message: 'User roles updated successfully'
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
    console.error('Error updating user roles:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user roles'
    })
  }
})