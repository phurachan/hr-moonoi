import { connectMongoDB } from '~/lib/mongodb'
import LeaveBalance from '~/models/LeaveBalance'
import { verifyToken } from '~/lib/jwt'

export default defineEventHandler(async (event) => {
  try {
    console.log('1. Starting debug endpoint')
    
    await connectMongoDB()
    console.log('2. MongoDB connected')
    
    // Check auth header
    const authHeader = getHeader(event, 'authorization')
    console.log('3. Auth header:', authHeader ? 'present' : 'missing')
    
    if (!authHeader) {
      return {
        error: 'No authorization header provided',
        step: 'auth_header_missing'
      }
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('4. Token extracted:', token ? 'yes' : 'no')
    
    let user
    try {
      user = verifyToken(token)
      console.log('5. Token verified, user:', user ? { id: user.id, name: user.name, role: user.role } : 'null')
    } catch (tokenError) {
      console.log('5. Token verification failed:', tokenError.message)
      return {
        error: 'Token verification failed',
        details: tokenError.message,
        step: 'token_verification'
      }
    }
    
    if (!user) {
      return {
        error: 'Invalid or expired token',
        step: 'token_invalid'
      }
    }

    const query = getQuery(event)
    const { employeeId, year = new Date().getFullYear() } = query
    console.log('6. Query params:', { employeeId, year })
    
    let filter: any = { year: parseInt(year as string) }
    
    // If not admin/HR, only show user's own balance
    if (user.role === 'employee') {
      filter.employeeId = user.id
    } else if (employeeId) {
      filter.employeeId = employeeId
    }
    
    console.log('7. Filter:', filter)
    
    try {
      const balances = await LeaveBalance.find(filter)
      console.log('8. Balances found:', balances.length)
      
      // If user's balance doesn't exist, try to create it
      if (user.role === 'employee' && balances.length === 0) {
        console.log('9. Creating new balance for employee')
        
        try {
          const newBalance = new LeaveBalance({
            employeeId: user.id,
            employeeName: user.name,
            year: parseInt(year as string)
          })
          
          await newBalance.save()
          console.log('10. New balance created successfully')
          
          return {
            success: true,
            balances: [newBalance],
            created: true
          }
        } catch (createError) {
          console.log('10. Error creating balance:', createError.message)
          return {
            error: 'Error creating balance',
            details: createError.message,
            step: 'balance_creation'
          }
        }
      }
      
      return {
        success: true,
        balances,
        found: true
      }
    } catch (dbError) {
      console.log('8. Database error:', dbError.message)
      return {
        error: 'Database error',
        details: dbError.message,
        step: 'database_query'
      }
    }
    
  } catch (error) {
    console.log('General error:', error.message)
    return {
      error: 'General error',
      details: error.message,
      stack: error.stack,
      step: 'general'
    }
  }
})