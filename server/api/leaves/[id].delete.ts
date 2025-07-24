import { connectMongoDB } from '~/lib/mongodb'
import Leave from '~/models/Leave'
import { verifyToken } from '~/lib/jwt'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  // Verify authentication
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No authorization header provided'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const user = verifyToken(token)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token'
    })
  }

  const id = getRouterParam(event, 'id')
  
  try {
    const leave = await Leave.findById(id)
    
    if (!leave) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Leave request not found'
      })
    }

    // Only allow deletion of pending requests and only by the employee or HR/admin
    if (leave.status !== 'pending') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Only pending leave requests can be deleted'
      })
    }

    if (user.role === 'employee' && leave.employeeId !== user.userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own leave requests'
      })
    }

    await Leave.findByIdAndDelete(id)

    return {
      success: true,
      message: 'Leave request deleted successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting leave request',
      data: error,
    })
  }
})