import { connectMongoDB } from '~/lib/mongodb'
import Employee from '~/models/Employee'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const body = await readBody(event)
  
  try {
    const employee = new Employee(body)
    const savedEmployee = await employee.save()
    
    return savedEmployee
  } catch (error: any) {
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Employee with this email already exists',
      })
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Error creating employee',
      data: error,
    })
  }
})