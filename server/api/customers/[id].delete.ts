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
    const deletedCustomer = await Customer.findByIdAndDelete(id)
    
    if (!deletedCustomer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found',
      })
    }
    
    return { message: 'Customer deleted successfully', customer: deletedCustomer }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting customer',
      data: error,
    })
  }
})