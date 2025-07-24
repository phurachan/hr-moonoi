import Role from '~/models/Role'
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
    
    const role = await Role.findById(id)
    
    if (!role) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Role not found'
      })
    }
    
    return {
      success: true,
      data: role
    }
  } catch (error) {
    console.error('Error fetching role:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch role'
    })
  }
})