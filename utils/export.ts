import * as XLSX from 'xlsx'

export interface ExportData {
  data: any[]
  summary?: any
  filename: string
}

export function exportToExcel(exportData: ExportData) {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new()
    
    // Create summary worksheet first (to match CSV structure)
    if (exportData.summary) {
      const summaryData = []
      
      // Add title
      summaryData.push({ Item: 'INCOME/EXPENSE SUMMARY', Value: '' })
      summaryData.push({ Item: '', Value: '' }) // Empty row
      
      // Add overall totals
      summaryData.push({ Item: 'OVERALL TOTALS', Value: '' })
      summaryData.push({ 
        Item: 'Total Income', 
        Value: exportData.summary.totalIncome.toLocaleString('th-TH') 
      })
      summaryData.push({ 
        Item: 'Total Expense', 
        Value: exportData.summary.totalExpense.toLocaleString('th-TH') 
      })
      summaryData.push({ 
        Item: 'Net Amount', 
        Value: (exportData.summary.totalIncome - exportData.summary.totalExpense).toLocaleString('th-TH') 
      })
      
      // Add empty row
      summaryData.push({ Item: '', Value: '' })
      
      // Add category breakdown
      summaryData.push({ Item: 'BY CATEGORY', Value: '' })
      Object.entries(exportData.summary.byCategory || {}).forEach(([category, amounts]: [string, any]) => {
        summaryData.push({ 
          Item: `${category.toUpperCase()} Income`, 
          Value: amounts.income.toLocaleString('th-TH') 
        })
        summaryData.push({ 
          Item: `${category.toUpperCase()} Expense`, 
          Value: amounts.expense.toLocaleString('th-TH') 
        })
        summaryData.push({ 
          Item: `${category.toUpperCase()} Net`, 
          Value: (amounts.income - amounts.expense).toLocaleString('th-TH') 
        })
      })
      
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')
    }
    
    // Create detailed data worksheet
    // XLSX.utils.json_to_sheet automatically handles values with commas correctly
    // as it creates proper Excel cells, not CSV-style comma-separated values
    const dataWorksheet = XLSX.utils.json_to_sheet(exportData.data)
    XLSX.utils.book_append_sheet(workbook, dataWorksheet, 'Detailed Records')
    
    // Generate and download the file
    XLSX.writeFile(workbook, exportData.filename)
    
    return { success: true, message: 'Excel file exported successfully' }
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    return { success: false, message: 'Failed to export Excel file' }
  }
}

export function downloadCSV(csvContent: string, filename: string) {
  try {
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent
    
    // Create blob with CSV content
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
    
    // Create download link
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    
    return { success: true, message: 'CSV file downloaded successfully' }
  } catch (error) {
    console.error('Error downloading CSV:', error)
    return { success: false, message: 'Failed to download CSV file' }
  }
}

export function formatDateForFilename(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthNumber - 1] || ''
}