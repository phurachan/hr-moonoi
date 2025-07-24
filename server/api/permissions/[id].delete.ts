import Permission from '~/models/Permission'
import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Permission ID is required'
      })
    }
    
    // Check if permission exists
    const permission = await Permission.findById(id)
    if (!permission) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Permission not found'
      })
    }
    
    // Check if permission is assigned to any roles
    const rolesWithPermission = await Role.countDocuments({ permissions: permission.name })
    if (rolesWithPermission > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `Cannot delete permission. It is assigned to ${rolesWithPermission} role(s)`
      })
    }
    
    // Delete the permission
    await Permission.findByIdAndDelete(id)
    
    return {
      success: true,
      message: 'Permission deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting permission:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete permission'
    })
  }
})