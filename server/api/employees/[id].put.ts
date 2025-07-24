import { connectMongoDB } from '~/lib/mongodb'
import Employee from '~/models/Employee'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  try {
    const employee = await Employee.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
    
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
    
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Employee with this email already exists',
      })
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Error updating employee',
      data: error,
    })
  }
})