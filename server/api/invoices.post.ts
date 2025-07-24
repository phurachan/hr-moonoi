import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import Invoice from '~/models/Invoice'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require invoice creation access
    const { user } = await validateTimesheetPermission(event, 'reports.invoices')
    
    const body = await readBody(event)
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice data is required'
      })
    }

    // Validate required fields
    if (!body.customer?.name || !body.invoice?.number || !body.items?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: customer name, invoice number, and items'
      })
    }

    // Create invoice object with proper data mapping
    const invoiceData = {
      invoiceNumber: body.invoice.number,
      date: new Date(body.invoice.date),
      dueDate: new Date(body.invoice.dueDate),
      company: {
        name: body.company.name || body.company.nameTh || body.company.nameEn || '',
        address: body.company.address || '',
        tel: body.company.tel || '',
        email: body.company.email || '',
        website: body.company.website || ''
      },
      customer: {
        name: body.customer.name || '',
        address: body.customer.address || '',
        tel: body.customer.tel || '',
        taxId: body.customer.taxId || ''
      },
      items: body.items || [],
      totals: {
        subtotal: body.totals?.subtotal || 0,
        tax: body.totals?.vat || body.totals?.tax || 0,
        discount: body.totals?.discount || 0,
        total: body.totals?.total || 0
      },
      reference: body.reference || '',
      payment: {
        method: body.payment?.method || body.payment?.companyName || 'Bank Transfer',
        terms: body.payment?.terms || `Account: ${body.payment?.accountNumber || ''} ${body.payment?.bankInfo || ''}`.trim(),
        dueDate: new Date(body.invoice.dueDate)
      },
      signer: body.signer?.name || body.signer || '',
      createdBy: user._id,
      status: 'draft'
    }

    // Save the invoice to the database
    const savedInvoice = await Invoice.create(invoiceData)
    
    return {
      success: true,
      message: 'Invoice created successfully',
      invoice: savedInvoice
    }
  } catch (error: any) {
    console.error('Error creating invoice:', error)
    console.error('Request body:', JSON.stringify(body, null, 2))
    console.error('Invoice data:', JSON.stringify(invoiceData, null, 2))
    
    if (error.statusCode) {
      throw error
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${validationErrors}`,
        data: error,
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating invoice',
      data: error.message || error,
    })
  }
})

