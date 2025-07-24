import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { name, description, module, action, resource, isActive } = body
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Permission ID is required'
      })
    }
    
    // Check if permission exists
    const existingPermission = await Permission.findById(id)
    if (!existingPermission) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Permission not found'
      })
    }
    
    // Check if name is unique (if changing name)
    if (name && name !== existingPermission.name) {
      const nameExists = await Permission.findOne({ name, _id: { $ne: id } })
      if (nameExists) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Permission with this name already exists'
        })
      }
    }
    
    // Update permission
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (module !== undefined) updateData.module = module
    if (action !== undefined) updateData.action = action
    if (resource !== undefined) updateData.resource = resource
    if (isActive !== undefined) updateData.isActive = isActive
    
    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    return {
      success: true,
      data: updatedPermission,
      message: 'Permission updated successfully'
    }
  } catch (error) {
    console.error('Error updating permission:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update permission'
    })
  }
})