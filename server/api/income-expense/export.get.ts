import { connectMongoDB } from '~/lib/mongodb'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'
import IncomeExpense from '~/models/IncomeExpense'
import { arrayToCsvRow, addCsvSummary } from '~/utils/csvUtils'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions
    const { user } = await validateTimesheetPermission(event, 'income_expense.read')
    
    const query = getQuery(event)
    const { 
      format = 'csv',
      month,
      year,
      type,
      category,
      startDate,
      endDate
    } = query
    
    // Build filter conditions
    const filterConditions: any = {}
    
    // Date filtering
    if (month && year) {
      const startOfMonth = new Date(parseInt(year as string), parseInt(month as string) - 1, 1)
      const endOfMonth = new Date(parseInt(year as string), parseInt(month as string), 0)
      filterConditions.date = {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    } else if (startDate && endDate) {
      filterConditions.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }
    
    // Type filtering
    if (type && type !== 'all') {
      filterConditions.type = type
    }
    
    // Category filtering
    if (category && category !== 'all') {
      filterConditions.category = category
    }
    
    // Fetch records
    const records = await IncomeExpense.find(filterConditions)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .lean()
    
    // Transform data for export
    const exportData = records.map(record => ({
      Date: new Date(record.date).toLocaleDateString('th-TH'),
      Description: record.description,
      Amount: record.amount,
      Type: record.type.charAt(0).toUpperCase() + record.type.slice(1),
      Category: record.category.toUpperCase(),
      Note: record.note || '',
      'Created By': record.createdBy?.name || 'Unknown',
      'Created At': new Date(record.createdAt).toLocaleDateString('th-TH')
    }))
    
    // Calculate summary by category and type
    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      byCategory: {} as Record<string, { income: number, expense: number }>,
      byType: {} as Record<string, number>
    }
    
    records.forEach(record => {
      if (record.type === 'income') {
        summary.totalIncome += record.amount
      } else {
        summary.totalExpense += record.amount
      }
      
      // By category
      if (!summary.byCategory[record.category]) {
        summary.byCategory[record.category] = { income: 0, expense: 0 }
      }
      summary.byCategory[record.category][record.type] += record.amount
      
      // By type
      if (!summary.byType[record.type]) {
        summary.byType[record.type] = 0
      }
      summary.byType[record.type] += record.amount
    })
    
    if (format === 'excel') {
      // For Excel format, we'll return JSON that the frontend will convert
      return {
        success: true,
        data: exportData,
        summary,
        filename: `income-expense-${month || 'custom'}-${year || new Date().getFullYear()}.xlsx`
      }
    } else {
      // Generate CSV
      // Start with summary at the top
      let csvContent = 'INCOME/EXPENSE SUMMARY'
      
      // Add overall summary
      csvContent += '\n\nOVERALL TOTALS'
      const summaryData = {
        'Total Income': summary.totalIncome.toLocaleString('th-TH'),
        'Total Expense': summary.totalExpense.toLocaleString('th-TH'),
        'Net Amount': (summary.totalIncome - summary.totalExpense).toLocaleString('th-TH')
      }
      
      Object.entries(summaryData).forEach(([key, value]) => {
        csvContent += '\n' + arrayToCsvRow([key, value])
      })
      
      // Add category breakdown
      csvContent += '\n\nBY CATEGORY'
      Object.entries(summary.byCategory).forEach(([cat, amounts]) => {
        csvContent += '\n' + arrayToCsvRow([`${cat.toUpperCase()} Income`, amounts.income.toLocaleString('th-TH')])
        csvContent += '\n' + arrayToCsvRow([`${cat.toUpperCase()} Expense`, amounts.expense.toLocaleString('th-TH')])
        csvContent += '\n' + arrayToCsvRow([`${cat.toUpperCase()} Net`, (amounts.income - amounts.expense).toLocaleString('th-TH')])
      })
      
      // Add detailed data section
      csvContent += '\n\nDETAILED RECORDS'
      
      const csvHeaders = [
        'Date',
        'Description', 
        'Amount',
        'Type',
        'Category',
        'Note',
        'Created By',
        'Created At'
      ]
      
      csvContent += '\n' + arrayToCsvRow(csvHeaders)
      
      const csvRows = exportData.map(row => 
        arrayToCsvRow(csvHeaders.map(header => row[header as keyof typeof row]))
      )
      
      csvContent += '\n' + csvRows.join('\n')
      
      // Set response headers for CSV download
      setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
      setHeader(event, 'Content-Disposition', 
        `attachment; filename="income-expense-${month || 'custom'}-${year || new Date().getFullYear()}.csv"`)
      
      return csvContent
    }
    
  } catch (error: any) {
    console.error('Error exporting income/expense data:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error exporting data',
      data: error.message || error
    })
  }
})