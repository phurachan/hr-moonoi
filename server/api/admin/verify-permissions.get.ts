import Role from '~/models/Role'
import User from '~/models/User'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Get admin role details
    const adminRole = await Role.findOne({ name: 'Admin' })
    if (!adminRole) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Admin role not found'
      })
    }
    
    // Get admin users
    const adminUsers = await User.find({ 
      $or: [
        { role: 'admin' },
        { roles: adminRole._id }
      ]
    }).select('username email firstName lastName role roles isActive')
    
    // Filter report permissions
    const reportPermissions = adminRole.permissions.filter(p => p.startsWith('reports.'))
    const allPermissions = adminRole.permissions
    
    return {
      success: true,
      data: {
        adminRole: {
          id: adminRole._id,
          name: adminRole.name,
          description: adminRole.description,
          totalPermissions: allPermissions.length,
          reportPermissions: reportPermissions,
          reportPermissionCount: reportPermissions.length,
          allPermissions: allPermissions.sort()
        },
        adminUsers: adminUsers.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          roleReferences: user.roles,
          isActive: user.isActive,
          hasAdminRole: user.roles?.includes(adminRole._id) || user.role === 'admin'
        })),
        verification: {
          hasReportsAccess: reportPermissions.includes('reports.access'),
          hasInvoiceReports: reportPermissions.includes('reports.invoices'),
          hasEmployeeReports: reportPermissions.includes('reports.employees'),
          hasExportReports: reportPermissions.includes('reports.export'),
          allReportPermissionsPresent: reportPermissions.length >= 4
        }
      }
    }
    
  } catch (error) {
    console.error('Error verifying admin permissions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify admin permissions: ' + error.message
    })
  }
})