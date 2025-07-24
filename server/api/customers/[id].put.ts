import { connectMongoDB } from '~/lib/mongodb'
import Customer from '~/models/Customer'
import mongoose from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
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
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
    
    if (!updatedCustomer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found',
      })
    }
    
    return updatedCustomer
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Customer with this information already exists',
      })
    }
    
    throw createError({
      statusCode: 400,
      statusMessage: 'Error updating customer',
      data: error,
    })
  }
})