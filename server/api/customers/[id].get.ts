import { connectMongoDB } from '~/lib/mongodb'
import Customer from '~/models/Customer'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Customer ID is required',
    })
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid customer ID format',
    })
  }
  
  try {
    const customer = await Customer.findById(id)
    
    if (!customer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found',
      })
    }
    
    return customer
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching customer',
      data: error,
    })
  }
})