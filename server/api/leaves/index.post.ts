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

  const body = await readBody(event)
  const {
    leaveType,
    startDate,
    endDate,
    reason,
    isHalfDay = false,
    halfDayPeriod,
    emergencyContact,
    documents = []
  } = body
  
  try {
    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields'
      })
    }

    // Calculate total days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const timeDiff = end.getTime() - start.getTime()
    let totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

    if (isHalfDay) {
      totalDays = 0.5
    }

    // Check if employee has sufficient leave balance (except for unpaid leave)
    if (leaveType !== 'unpaid') {
      const currentYear = new Date().getFullYear()
      const leaveBalance = await LeaveBalance.findOne({ 
        employeeId: user.userId, 
        year: currentYear 
      })

      if (leaveBalance) {
        const balance = leaveBalance.leaveBalances[leaveType as keyof typeof leaveBalance.leaveBalances]
        if (balance.remaining < totalDays) {
          throw createError({
            statusCode: 400,
            statusMessage: `Insufficient ${leaveType} leave balance. Available: ${balance.remaining} days, Requested: ${totalDays} days`
          })
        }
      }
    }

    // Check for overlapping leaves
    const overlappingLeave = await Leave.findOne({
      employeeId: user.userId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    })

    if (overlappingLeave) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You already have a leave request for overlapping dates'
      })
    }

    // Create leave request
    const leave = new Leave({
      employeeId: user.userId,
      employeeName: user.email, // Using email as fallback
      employeeEmail: user.email,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      isHalfDay,
      halfDayPeriod,
      emergencyContact,
      documents,
      status: 'pending',
      appliedAt: new Date()
    })

    await leave.save()

    return {
      success: true,
      message: 'Leave request submitted successfully',
      leave
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating leave request',
      data: error,
    })
  }
})