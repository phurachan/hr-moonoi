import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const { name, description, permissions, isActive } = body
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Role ID is required'
      })
    }
    
    // Check if role exists
    const existingRole = await Role.findById(id)
    if (!existingRole) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Role not found'
      })
    }
    
    // Check if name is unique (if changing name)
    if (name && name !== existingRole.name) {
      const nameExists = await Role.findOne({ name, _id: { $ne: id } })
      if (nameExists) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Role with this name already exists'
        })
      }
    }
    
    // Update role
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (permissions !== undefined) updateData.permissions = permissions
    if (isActive !== undefined) updateData.isActive = isActive
    
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    return {
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    }
  } catch (error) {
    console.error('Error updating role:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update role'
    })
  }
})