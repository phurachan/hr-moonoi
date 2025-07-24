import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Get unique modules
    const modules = await Permission.distinct('module', { isActive: true })
    
    return {
      success: true,
      data: modules.sort()
    }
  } catch (error) {
    console.error('Error fetching modules:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch modules'
    })
  }
})