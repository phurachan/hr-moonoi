import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import IncomeExpense from '~/models/IncomeExpense'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require income-expense read access
    const { user } = await validateTimesheetPermission(event, 'income_expense.read')
    
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string || ''
    const type = query.type as string || ''
    const category = query.category as string || ''
    const startDate = query.startDate as string
    const endDate = query.endDate as string
    
    const skip = (page - 1) * limit
    
    // Build filter query
    let filter: any = {}
    
    // Search by description
    if (search) {
      filter.description = { $regex: search, $options: 'i' }
    }
    
    // Filter by type
    if (type) {
      filter.type = type
    }
    
    // Filter by category
    if (category) {
      filter.category = category
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
    
    // Get records with pagination
    const [records, total] = await Promise.all([
      IncomeExpense.find(filter)
        .populate('createdBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      IncomeExpense.countDocuments(filter)
    ])
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    // Calculate totals for summary (both category-specific and overall)
    const [
      normalIncomeTotal,
      normalExpenseTotal,
      odIncomeTotal,
      odExpenseTotal,
      incomeTotal,
      expenseTotal
    ] = await Promise.all([
      IncomeExpense.aggregate([
        { $match: { ...filter, type: 'income', category: 'normal' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      IncomeExpense.aggregate([
        { $match: { ...filter, type: 'expense', category: 'normal' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      IncomeExpense.aggregate([
        { $match: { ...filter, type: 'income', category: 'od' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      IncomeExpense.aggregate([
        { $match: { ...filter, type: 'expense', category: 'od' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      IncomeExpense.aggregate([
        { $match: { ...filter, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      IncomeExpense.aggregate([
        { $match: { ...filter, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ])
    
    return {
      records,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      summary: {
        normalIncome: normalIncomeTotal[0]?.total || 0,
        normalExpense: normalExpenseTotal[0]?.total || 0,
        normalNet: (normalIncomeTotal[0]?.total || 0) - (normalExpenseTotal[0]?.total || 0),
        odIncome: odIncomeTotal[0]?.total || 0,
        odExpense: odExpenseTotal[0]?.total || 0,
        odNet: (odIncomeTotal[0]?.total || 0) - (odExpenseTotal[0]?.total || 0),
        totalIncome: incomeTotal[0]?.total || 0,
        totalExpense: expenseTotal[0]?.total || 0,
        netAmount: (incomeTotal[0]?.total || 0) - (expenseTotal[0]?.total || 0)
      }
    }
  } catch (error: any) {
    console.error('Error fetching income/expense records:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching income/expense records',
      data: error.message || error,
    })
  }
})