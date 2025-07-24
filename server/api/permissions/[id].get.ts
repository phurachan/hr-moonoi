import Permission from '~/models/Permission'
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
    
    const permission = await Permission.findById(id)
    
    if (!permission) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Permission not found'
      })
    }
    
    return {
      success: true,
      data: permission
    }
  } catch (error) {
    console.error('Error fetching permission:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch permission'
    })
  }
})