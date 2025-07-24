import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    const body = await readBody(event)
    const { name, description, permissions, createdBy } = body
    
    // Validate required fields
    if (!name || !description || !createdBy) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, description, and createdBy are required'
      })
    }
    
    // Check if role already exists
    const existingRole = await Role.findOne({ name })
    if (existingRole) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Role with this name already exists'
      })
    }
    
    // Create new role
    const role = new Role({
      name,
      description,
      permissions: permissions || [],
      createdBy,
      isActive: true
    })
    
    await role.save()
    
    return {
      success: true,
      data: role,
      message: 'Role created successfully'
    }
  } catch (error) {
    console.error('Error creating role:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create role'
    })
  }
})