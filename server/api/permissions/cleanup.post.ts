import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Permissions to remove (obsolete ones)
    const permissionsToRemove = [
      'timesheets.reports',
      'reports.employees',
      'reports.access',
      'reports.invoices', 
      'reports.export'
    ]
    
    let removedCount = 0
    
    for (const permissionName of permissionsToRemove) {
      const result = await Permission.deleteOne({ name: permissionName })
      if (result.deletedCount > 0) {
        removedCount++
      }
    }
    
    return {
      success: true,
      message: `Cleaned up ${removedCount} obsolete permissions`,
      data: {
        removed: removedCount,
        permissionsRemoved: permissionsToRemove
      }
    }
  } catch (error) {
    console.error('Error cleaning up permissions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to cleanup permissions'
    })
  }
})