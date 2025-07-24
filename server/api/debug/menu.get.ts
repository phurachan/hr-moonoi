import { verifyToken, extractTokenFromHeader } from '~/lib/jwt'
import User from '~/models/User'
import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Get token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required',
      })
    }
    
    // Verify and decode token
    const decoded = verifyToken(token)
    
    // Find current user with populated roles
    const user = await User.findById(decoded.userId)
      .populate('roles', 'name description permissions isActive')
    
    if (!user || !user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found or inactive',
      })
    }
    
    // Extract permissions
    const userPermissions = user.roles?.reduce((acc, role) => {
      if (role.permissions) {
        acc.push(...role.permissions)
      }
      return acc
    }, []) || []
    
    // Check specific report permissions
    const reportPermissions = {
      'reports.access': userPermissions.includes('reports.access'),
      'reports.invoices': userPermissions.includes('reports.invoices'),
      'reports.employees': userPermissions.includes('reports.employees'),
      'reports.export': userPermissions.includes('reports.export'),
      'timesheets.reports': userPermissions.includes('timesheets.reports')
    }
    
    return {
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive
        },
        roles: user.roles?.map(role => ({
          name: role.name,
          permissions: role.permissions
        })),
        allPermissions: userPermissions,
        reportPermissions,
        isAdmin: user.role === 'admin',
        shouldShowReports: user.role === 'admin' || reportPermissions['reports.access']
      }
    }
    
  } catch (error) {
    console.error('Error debugging menu:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to debug menu: ' + error.message
    })
  }
})