import { connectMongoDB } from '~/lib/mongodb'
import Customer from '~/models/Customer'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const body = await readBody(event)
  
  try {
    const customer = new Customer(body)
    const savedCustomer = await customer.save()
    
    return savedCustomer
  } catch (error: any) {
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Customer with this information already exists',
      })
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Error creating customer',
      data: error,
    })
  }
})