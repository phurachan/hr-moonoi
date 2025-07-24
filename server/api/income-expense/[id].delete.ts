import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import IncomeExpense from '~/models/IncomeExpense'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require income-expense delete access
    await validateTimesheetPermission(event, 'income_expense.delete')
    
    const recordId = getRouterParam(event, 'id')
    
    if (!recordId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Record ID is required'
      })
    }
    
    const record = await IncomeExpense.findById(recordId)
    if (!record) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Income/Expense record not found'
      })
    }
    
    await IncomeExpense.findByIdAndDelete(recordId)
    
    return { 
      success: true, 
      message: 'Income/Expense record deleted successfully',
      deletedRecord: record
    }
  } catch (error: any) {
    console.error('Error deleting income/expense record:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting income/expense record',
      data: error.message || error,
    })
  }
})