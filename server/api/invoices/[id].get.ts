import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import Invoice from '~/models/Invoice'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require invoice read access
    await validateTimesheetPermission(event, 'reports.invoices')
    
    const invoiceId = getRouterParam(event, 'id')
    
    if (!invoiceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice ID is required'
      })
    }
    
    const invoice = await Invoice.findById(invoiceId)
      .populate('createdBy', 'name email')
    
    if (!invoice) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invoice not found'
      })
    }
    
    return invoice
  } catch (error: any) {
    console.error('Error fetching invoice:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching invoice',
      data: error.message || error,
    })
  }
})