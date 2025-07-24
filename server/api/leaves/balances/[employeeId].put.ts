import { connectMongoDB } from '~/lib/mongodb'
import LeaveBalance from '~/models/LeaveBalance'
import Employee from '~/models/Employee'
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

  // Only HR/admin can update leave balances
  if (user.role === 'employee') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only HR or admin can update leave balances'
    })
  }

  const employeeId = getRouterParam(event, 'employeeId')
  const body = await readBody(event)
  const { year = new Date().getFullYear(), leaveBalances } = body
  
  try {
    // Verify employee exists
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Employee not found'
      })
    }

    // Find or create leave balance record
    let leaveBalance = await LeaveBalance.findOne({ 
      employeeId, 
      year: parseInt(year as string) 
    })

    if (!leaveBalance) {
      leaveBalance = new LeaveBalance({
        employeeId,
        employeeName: employee.name,
        year: parseInt(year as string)
      })
    }

    // Update balances
    if (leaveBalances) {
      // Update specific leave type balances while maintaining data integrity
      Object.keys(leaveBalances).forEach(leaveType => {
        if (leaveBalance!.leaveBalances[leaveType as keyof typeof leaveBalance!.leaveBalances]) {
          const updatedBalance = leaveBalances[leaveType]
          const currentBalance = leaveBalance!.leaveBalances[leaveType as keyof typeof leaveBalance!.leaveBalances]
          
          if (updatedBalance.total !== undefined) {
            currentBalance.total = Math.max(0, updatedBalance.total)
            // Recalculate remaining when total changes
            currentBalance.remaining = Math.max(0, currentBalance.total - currentBalance.used)
          }
          
          if (updatedBalance.used !== undefined) {
            currentBalance.used = Math.max(0, Math.min(updatedBalance.used, currentBalance.total))
            currentBalance.remaining = Math.max(0, currentBalance.total - currentBalance.used)
          }
        }
      })
    }

    leaveBalance.lastUpdated = new Date()
    await leaveBalance.save()

    return {
      success: true,
      message: 'Leave balance updated successfully',
      leaveBalance
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating leave balance',
      data: error,
    })
  }
})