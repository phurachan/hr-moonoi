import { connectMongoDB } from '~/lib/mongodb'
import Employee from '~/models/Employee'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const query = getQuery(event)
  const { department, status, search } = query
  
  try {
    let filter: any = {}
    
    // Apply filters
    if (department) filter.department = department
    if (status) filter.status = status
    
    // Apply search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ]
    }
    
    const employees = await Employee.find(filter).sort({ createdAt: -1 })
    
    return employees
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching employees',
      data: error,
    })
  }
})