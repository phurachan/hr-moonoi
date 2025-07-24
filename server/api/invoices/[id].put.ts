import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import Invoice from '~/models/Invoice'
import { shouldGenerateIncome, generateIncomeFromInvoice, removeIncomeFromInvoice } from '~/server/utils/invoiceIncomeUtils'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  let body: any = null // Declare body outside try block for error logging
  
  try {
    // Validate permissions - require invoice creation access
    const { user } = await validateTimesheetPermission(event, 'reports.invoices')
    
    const invoiceId = getRouterParam(event, 'id')
    body = await readBody(event)
    
    if (!invoiceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice ID is required'
      })
    }
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invoice data is required'
      })
    }

    // For status-only updates, we don't need to validate all fields
    const isStatusOnlyUpdate = body.status && Object.keys(body).length === 1
    
    // Validate required fields only for full updates
    if (!isStatusOnlyUpdate && (!body.customer?.name || !body.invoice?.number || !body.items?.length)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: customer name, invoice number, and items'
      })
    }

    // Check if invoice exists
    const existingInvoice = await Invoice.findById(invoiceId)
    if (!existingInvoice) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invoice not found'
      })
    }

    // Handle different types of updates
    let updateData: any = {}
    
    if (isStatusOnlyUpdate) {
      // For status-only updates, only update the status field
      updateData = {
        status: body.status
      }
    } else {
      // For full updates, map all the fields
      updateData = {
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
        status: body.status || existingInvoice.status
      }
    }

    // Check if status change should trigger income generation
    const statusChanged = body.status && body.status !== existingInvoice.status
    const oldStatus = existingInvoice.status
    const newStatus = body.status || existingInvoice.status
    
    // Update the invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
    
    let incomeRecords = null
    let statusMessage = 'Invoice updated successfully'
    
    // Handle income generation based on status change
    if (statusChanged) {
      try {
        if (shouldGenerateIncome(oldStatus, newStatus)) {
          // Generate income records when status changes to 'paid'
          incomeRecords = await generateIncomeFromInvoice(updatedInvoice, user._id.toString())
          statusMessage = `Invoice updated successfully. Generated ${incomeRecords.length} income record(s).`
        } else if (oldStatus === 'paid' && newStatus !== 'paid') {
          // Remove income records if status changes away from 'paid'
          const removedCount = await removeIncomeFromInvoice(updatedInvoice.invoiceNumber)
          statusMessage = `Invoice updated successfully. Removed ${removedCount} income record(s).`
        }
      } catch (incomeError) {
        console.error('Error handling income generation:', incomeError)
        // Don't fail the invoice update if income generation fails
        statusMessage = `Invoice updated successfully, but there was an issue with income generation: ${incomeError.message}`
      }
    }
    
    return {
      success: true,
      message: statusMessage,
      invoice: updatedInvoice,
      incomeRecords: incomeRecords,
      statusChange: statusChanged ? {
        from: oldStatus,
        to: newStatus,
        triggeredIncome: shouldGenerateIncome(oldStatus, newStatus)
      } : null
    }
  } catch (error: any) {
    console.error('Error updating invoice:', error)
    if (body) {
      console.error('Request body:', JSON.stringify(body, null, 2))
    }
    
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
      statusMessage: 'Error updating invoice',
      data: error.message || error,
    })
  }
})