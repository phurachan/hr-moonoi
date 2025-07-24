import { connectMongoDB } from '~/lib/mongodb'
import Employee from '~/models/Employee'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const id = getRouterParam(event, 'id')
  
  try {
    const employee = await Employee.findById(id)
    
    if (!employee) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Employee not found',
      })
    }
    
    return employee
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid employee ID',
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching employee',
      data: error,
    })
  }
})