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

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { status, rejectionReason } = body
  
  try {
    const leave = await Leave.findById(id)
    
    if (!leave) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Leave request not found'
      })
    }

    // Only HR/admin can approve/reject leaves
    if (status && ['approved', 'rejected'].includes(status)) {
      if (user.role === 'employee') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Only HR or admin can approve/reject leave requests'
        })
      }

      if (status === 'approved') {
        // Update leave balance if leave type is not unpaid
        if (leave.leaveType !== 'unpaid') {
          const currentYear = new Date().getFullYear()
          const leaveBalance = await LeaveBalance.findOne({ 
            employeeId: leave.employeeId, 
            year: currentYear 
          })

          if (leaveBalance) {
            const balance = leaveBalance.leaveBalances[leave.leaveType as keyof typeof leaveBalance.leaveBalances]
            
            // Check if there's still enough balance
            if (balance.remaining < leave.totalDays) {
              throw createError({
                statusCode: 400,
                statusMessage: `Insufficient ${leave.leaveType} leave balance. Available: ${balance.remaining} days, Requested: ${leave.totalDays} days`
              })
            }

            // Update leave balance
            balance.used += leave.totalDays
            balance.remaining -= leave.totalDays
            leaveBalance.lastUpdated = new Date()
            
            await leaveBalance.save()
          }
        }

        leave.status = 'approved'
        leave.approvedBy = user.userId
        leave.approverName = user.email
        leave.approvedAt = new Date()
      } else if (status === 'rejected') {
        leave.status = 'rejected'
        leave.rejectedAt = new Date()
        leave.rejectionReason = rejectionReason || 'No reason provided'
      }
    } else if (status === 'cancelled') {
      // Employees can cancel their own pending requests
      if (user.role === 'employee' && leave.employeeId !== user.userId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only cancel your own leave requests'
        })
      }

      if (leave.status !== 'pending') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Only pending leave requests can be cancelled'
        })
      }

      leave.status = 'cancelled'
    } else {
      // Allow employees to update their own pending requests
      if (user.role === 'employee' && leave.employeeId !== user.userId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only update your own leave requests'
        })
      }

      if (leave.status !== 'pending') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Only pending leave requests can be updated'
        })
      }

      // Update leave details
      const {
        leaveType,
        startDate,
        endDate,
        reason,
        isHalfDay,
        halfDayPeriod,
        emergencyContact,
        documents
      } = body

      if (leaveType) leave.leaveType = leaveType
      if (startDate) leave.startDate = startDate
      if (endDate) leave.endDate = endDate
      if (reason) leave.reason = reason
      if (typeof isHalfDay === 'boolean') leave.isHalfDay = isHalfDay
      if (halfDayPeriod) leave.halfDayPeriod = halfDayPeriod
      if (emergencyContact) leave.emergencyContact = emergencyContact
      if (documents) leave.documents = documents

      // Recalculate total days if dates changed
      if (startDate || endDate) {
        const start = new Date(leave.startDate)
        const end = new Date(leave.endDate)
        const timeDiff = end.getTime() - start.getTime()
        leave.totalDays = leave.isHalfDay ? 0.5 : Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
      }
    }

    await leave.save()

    return {
      success: true,
      message: 'Leave request updated successfully',
      leave
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating leave request',
      data: error,
    })
  }
})