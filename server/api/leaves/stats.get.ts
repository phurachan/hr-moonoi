import { connectMongoDB } from '~/lib/mongodb'
import Leave from '~/models/Leave'
import LeaveBalance from '~/models/LeaveBalance'
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
  const { employeeId } = query
  
  try {
    let filter: any = {}
    
    // If not admin/HR, only show user's own stats
    if (user.role === 'employee') {
      filter.employeeId = user.userId
    } else if (employeeId) {
      filter.employeeId = employeeId
    }
    
    // Get leave statistics
    const currentYear = new Date().getFullYear()
    const startOfYear = `${currentYear}-01-01`
    const endOfYear = `${currentYear}-12-31`
    
    // Total leaves by status
    const totalLeaves = await Leave.countDocuments(filter)
    const pendingLeaves = await Leave.countDocuments({ ...filter, status: 'pending' })
    const approvedLeaves = await Leave.countDocuments({ ...filter, status: 'approved' })
    const rejectedLeaves = await Leave.countDocuments({ ...filter, status: 'rejected' })
    
    // Leaves by type (current year)
    const leavesByType = await Leave.aggregate([
      {
        $match: {
          ...filter,
          startDate: { $gte: startOfYear },
          endDate: { $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      }
    ])
    
    // Recent leaves (last 5)
    const recentLeaves = await Leave.find(filter)
      .sort({ appliedAt: -1 })
      .limit(5)
    
    // Monthly leave trend (current year)
    const monthlyTrend = await Leave.aggregate([
      {
        $match: {
          ...filter,
          startDate: { $gte: startOfYear },
          endDate: { $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: { $month: { $dateFromString: { dateString: '$startDate' } } },
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ])
    
    // Get leave balance if specific employee
    let leaveBalance = null
    if (user.role === 'employee' || employeeId) {
      const targetEmployeeId = user.role === 'employee' ? user.userId : employeeId
      leaveBalance = await LeaveBalance.findOne({ 
        employeeId: targetEmployeeId, 
        year: currentYear 
      })
    }
    
    return {
      overview: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves
      },
      leavesByType,
      recentLeaves,
      monthlyTrend,
      leaveBalance
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching leave statistics',
      data: error,
    })
  }
})