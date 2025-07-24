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

  const query = getQuery(event)
  const { status, leaveType, employeeId, startDate, endDate, page = 1, limit = 10 } = query
  
  try {
    let filter: any = {}
    
    // If not admin/HR, only show user's own leaves
    if (user.role === 'employee') {
      filter.employeeId = user.userId
    }
    
    // Apply filters
    if (employeeId && user.role !== 'employee') {
      filter.employeeId = employeeId
    }
    if (status) filter.status = status
    if (leaveType) filter.leaveType = leaveType
    if (startDate) filter.startDate = { $gte: startDate }
    if (endDate) filter.endDate = { $lte: endDate }
    
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum
    
    const leaves = await Leave.find(filter)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum)
    
    const total = await Leave.countDocuments(filter)
    
    return {
      leaves,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching leaves',
      data: error,
    })
  }
})