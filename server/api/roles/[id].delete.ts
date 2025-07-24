import Role from '~/models/Role'
import User from '~/models/User'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Role ID is required'
      })
    }
    
    // Check if role exists
    const role = await Role.findById(id)
    if (!role) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Role not found'
      })
    }
    
    // Check if role is assigned to any users
    const usersWithRole = await User.countDocuments({ roles: id })
    if (usersWithRole > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `Cannot delete role. It is assigned to ${usersWithRole} user(s)`
      })
    }
    
    // Delete the role
    await Role.findByIdAndDelete(id)
    
    return {
      success: true,
      message: 'Role deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting role:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete role'
    })
  }
})