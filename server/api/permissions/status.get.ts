import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Get all permissions grouped by module
    const permissions = await Permission.find({ isActive: true }).sort({ module: 1, name: 1 })
    const modules = await Permission.distinct('module', { isActive: true })
    
    const groupedPermissions = permissions.reduce((groups: any, permission: any) => {
      const module = permission.module || 'other'
      if (!groups[module]) {
        groups[module] = []
      }
      groups[module].push(permission.name)
      return groups
    }, {})
    
    return {
      success: true,
      data: {
        modules: modules.sort(),
        totalPermissions: permissions.length,
        groupedPermissions,
        hasReports: modules.includes('reports'),
        hasInvoices: modules.includes('invoices')
      }
    }
  } catch (error) {
    console.error('Error fetching permission status:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch permission status'
    })
  }
})