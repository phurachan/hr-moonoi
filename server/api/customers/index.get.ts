import { connectMongoDB } from '~/lib/mongodb'
import Customer from '~/models/Customer'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const query = getQuery(event)
  const { status, search } = query
  
  try {
    let filter: any = {}
    
    // Apply filters
    if (status) filter.status = status
    
    // Apply search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { tel: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { taxId: { $regex: search, $options: 'i' } }
      ]
    }
    
    const customers = await Customer.find(filter).sort({ createdAt: -1 })
    
    return customers
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching customers',
      data: error,
    })
  }
})