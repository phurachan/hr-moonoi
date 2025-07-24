import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const body = await readBody(event)
    const { name, description, module, action, resource } = body
    
    // Validate required fields
    if (!name || !description || !module || !action || !resource) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, description, module, action, and resource are required'
      })
    }
    
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name })
    if (existingPermission) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Permission with this name already exists'
      })
    }
    
    // Create new permission
    const permission = new Permission({
      name,
      description,
      module,
      action,
      resource,
      isActive: true
    })
    
    await permission.save()
    
    return {
      success: true,
      data: permission,
      message: 'Permission created successfully'
    }
  } catch (error) {
    console.error('Error creating permission:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create permission'
    })
  }
})