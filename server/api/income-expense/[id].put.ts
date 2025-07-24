import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import IncomeExpense from '~/models/IncomeExpense'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require income-expense update access
    const { user } = await validateTimesheetPermission(event, 'income_expense.update')
    
    const recordId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!recordId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Record ID is required'
      })
    }
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body is required'
      })
    }
    
    // Find existing record
    const existingRecord = await IncomeExpense.findById(recordId)
    if (!existingRecord) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Income/Expense record not found'
      })
    }
    
    // Validate field values if provided
    if (body.type && !['income', 'expense'].includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type must be either "income" or "expense"'
      })
    }
    
    if (body.category && !['normal', 'od'].includes(body.category)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category must be either "normal" or "od"'
      })
    }
    
    if (body.amount !== undefined && (isNaN(body.amount) || body.amount < 0)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount must be a positive number'
      })
    }
    
    // Update fields
    const updateData: any = {}
    if (body.date) updateData.date = new Date(body.date)
    if (body.description) updateData.description = body.description
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount)
    if (body.type) updateData.type = body.type
    if (body.category) updateData.category = body.category
    if (body.note !== undefined) updateData.note = body.note
    
    const updatedRecord = await IncomeExpense.findByIdAndUpdate(
      recordId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
    
    return updatedRecord
  } catch (error: any) {
    console.error('Error updating income/expense record:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.message
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating income/expense record',
      data: error.message || error,
    })
  }
})