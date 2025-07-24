import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import Invoice from '~/models/Invoice'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require invoice read access
    const { user } = await validateTimesheetPermission(event, 'reports.invoices')
    
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const status = query.status as string || ''
    const startDate = query.startDate as string
    const endDate = query.endDate as string
    
    const skip = (page - 1) * limit
    
    // Build filter query
    let filter: any = {}
    
    // Search by invoice number, customer name, or company name
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } }
      ]
    }
    
    // Filter by status
    if (status) {
      filter.status = status
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) {
        filter.date.$gte = new Date(startDate)
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate)
      }
    }
    
    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Invoice.countDocuments(filter)
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return {
      invoices,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      }
    }
  } catch (error: any) {
    console.error('Error fetching invoices:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching invoices',
      data: error.message || error,
    })
  }
})