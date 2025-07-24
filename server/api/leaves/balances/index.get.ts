import { connectMongoDB } from '~/lib/mongodb'
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
  const { employeeId, year = new Date().getFullYear() } = query
  
  try {
    let filter: any = { year: parseInt(year as string) }
    
    // If not admin/HR, only show user's own balance
    if (user.role === 'employee') {
      filter.employeeId = user.userId
    } else if (employeeId) {
      filter.employeeId = employeeId
    }
    
    const balances = await LeaveBalance.find(filter)
    
    // If user's balance doesn't exist, create it with default values
    if (user.role === 'employee' && balances.length === 0) {
      const newBalance = new LeaveBalance({
        employeeId: user.userId,
        employeeName: user.email, // Using email as fallback since name might not be in JWT
        year: parseInt(year as string)
      })
      
      await newBalance.save()
      return [newBalance]
    }
    
    return balances
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching leave balances',
      data: error,
    })
  }
})