/**
 * Utility functions for proper CSV handling
 */

/**
 * Properly escapes a value for CSV output
 * - Wraps in quotes if contains comma, newline, or quote
 * - Escapes internal quotes by doubling them
 */
export function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // Check if value needs quoting (contains comma, quote, newline, or carriage return)
  const needsQuoting = stringValue.includes(',') || 
                      stringValue.includes('"') || 
                      stringValue.includes('\n') || 
                      stringValue.includes('\r')
  
  if (needsQuoting) {
    // Escape internal quotes by doubling them, then wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Converts an array of values to a properly escaped CSV row
 */
export function arrayToCsvRow(values: any[]): string {
  return values.map(escapeCsvValue).join(',')
}

/**
 * Converts array of objects to CSV string with headers
 */
export function objectArrayToCsv(data: Record<string, any>[], headers?: string[]): string {
  if (!data || data.length === 0) {
    return ''
  }
  
  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0])
  
  // Create header row
  const headerRow = arrayToCsvRow(csvHeaders)
  
  // Create data rows
  const dataRows = data.map(row => 
    arrayToCsvRow(csvHeaders.map(header => row[header]))
  )
  
  return [headerRow, ...dataRows].join('\n')
}

/**
 * Adds a summary section to CSV content
 */
export function addCsvSummary(csvContent: string, summaryData: Record<string, any>): string {
  const summaryRows = [
    '', // Empty row
    'SUMMARY',
    ...Object.entries(summaryData).map(([key, value]) => 
      arrayToCsvRow([key, value])
    )
  ]
  
  return csvContent + '\n' + summaryRows.join('\n')
}

/**
 * Creates a CSV structure with summary first, then detailed data
 */
export function createSummaryFirstCsv(
  title: string,
  summaryData: Record<string, any>,
  categoryData?: Record<string, any>,
  detailedData?: any[],
  headers?: string[]
): string {
  let csvContent = title
  
  // Add overall summary
  if (Object.keys(summaryData).length > 0) {
    csvContent += '\n\nOVERALL TOTALS'
    Object.entries(summaryData).forEach(([key, value]) => {
      csvContent += '\n' + arrayToCsvRow([key, value])
    })
  }
  
  // Add category breakdown if provided
  if (categoryData && Object.keys(categoryData).length > 0) {
    csvContent += '\n\nBY CATEGORY'
    Object.entries(categoryData).forEach(([key, value]) => {
      csvContent += '\n' + arrayToCsvRow([key, value])
    })
  }
  
  // Add detailed data if provided
  if (detailedData && detailedData.length > 0 && headers) {
    csvContent += '\n\nDETAILED RECORDS'
    csvContent += '\n' + arrayToCsvRow(headers)
    detailedData.forEach(row => {
      csvContent += '\n' + arrayToCsvRow(headers.map(header => row[header]))
    })
  }
  
  return csvContent
}