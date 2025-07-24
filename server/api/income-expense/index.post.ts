import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import IncomeExpense from '~/models/IncomeExpense'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require income-expense create access
    const { user } = await validateTimesheetPermission(event, 'income_expense.create')
    
    const body = await readBody(event)
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Request body is required'
      })
    }
    
    // Validate required fields
    const requiredFields = ['date', 'description', 'amount', 'type', 'category']
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `${field} is required`
        })
      }
    }
    
    // Validate field values
    if (!['income', 'expense'].includes(body.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type must be either "income" or "expense"'
      })
    }
    
    if (!['normal', 'od'].includes(body.category)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category must be either "normal" or "od"'
      })
    }
    
    if (isNaN(body.amount) || body.amount < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Amount must be a positive number'
      })
    }
    
    // Create new record
    const newRecord = new IncomeExpense({
      date: new Date(body.date),
      description: body.description,
      amount: parseFloat(body.amount),
      type: body.type,
      category: body.category,
      note: body.note || '',
      createdBy: user._id
    })
    
    const savedRecord = await newRecord.save()
    await savedRecord.populate('createdBy', 'name email')
    
    return savedRecord
  } catch (error: any) {
    console.error('Error creating income/expense record:', error)
    
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
      statusMessage: 'Error creating income/expense record',
      data: error.message || error,
    })
  }
})