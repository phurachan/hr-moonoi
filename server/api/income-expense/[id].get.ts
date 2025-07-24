import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import IncomeExpense from '~/models/IncomeExpense'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require income-expense read access
    await validateTimesheetPermission(event, 'income_expense.read')
    
    const recordId = getRouterParam(event, 'id')
    
    if (!recordId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Record ID is required'
      })
    }
    
    const record = await IncomeExpense.findById(recordId)
      .populate('createdBy', 'name email')
    
    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Income/Expense record not found'
      })
    }
    
    return record
  } catch (error: any) {
    console.error('Error fetching income/expense record:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching income/expense record',
      data: error.message || error,
    })
  }
})