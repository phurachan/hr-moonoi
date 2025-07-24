import { verifyToken, extractTokenFromHeader } from '~/lib/jwt'
import User from '~/models/User'

export interface TimesheetPermissionContext {
  user: any
  isOwner: boolean
  isHR: boolean
  isAdmin: boolean
}

export async function validateTimesheetPermission(
  event: any,
  requiredPermission: string,
  timesheetUserId?: string
): Promise<TimesheetPermissionContext> {
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
  
  const isAdmin = user.role === 'admin'
  const isHR = user.role === 'hr' || isAdmin
  const isOwner = timesheetUserId ? user._id.toString() === timesheetUserId : false
  
  // Admin users bypass all permission checks
  if (isAdmin) {
    return { user, isOwner, isHR, isAdmin }
  }
  
  // Check if user has required permission
  const hasPermission = user.roles?.some(role => 
    role.permissions?.includes(requiredPermission)
  ) || false
  
  if (!hasPermission) {
    throw createError({
      statusCode: 403,
      statusMessage: `Insufficient permissions. Required: ${requiredPermission}`,
    })
  }
  
  // For non-HR users, ensure they can only access their own timesheets
  if (!isHR && timesheetUserId && !isOwner) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You can only access your own timesheets',
    })
  }
  
  return { user, isOwner, isHR, isAdmin }
}

export function hasTimesheetPermission(user: any, permission: string): boolean {
  if (user.role === 'admin') return true
  
  return user.roles?.some(role => 
    role.permissions?.includes(permission)
  ) || false
}

export function canAccessTimesheet(user: any, timesheetUserId: string): boolean {
  if (user.role === 'admin' || user.role === 'hr') return true
  
  return user._id.toString() === timesheetUserId
}