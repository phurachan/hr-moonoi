import IncomeExpense from '~/models/IncomeExpense'
import type { IInvoice } from '~/models/Invoice'

/**
 * Configuration for invoice status that should trigger income generation
 */
const INCOME_TRIGGER_STATUSES = ['paid']

/**
 * Check if a status change should trigger income generation
 */
export function shouldGenerateIncome(oldStatus: string, newStatus: string): boolean {
  // Only generate income if:
  // 1. The new status is in the trigger list
  // 2. The old status was not already a trigger status (avoid duplicates)
  return INCOME_TRIGGER_STATUSES.includes(newStatus) && !INCOME_TRIGGER_STATUSES.includes(oldStatus)
}

/**
 * Generate income records from invoice items
 */
export async function generateIncomeFromInvoice(invoice: IInvoice, userId: string): Promise<any[]> {
  const incomeRecords = []
  
  try {
    // Validate inputs
    if (!invoice || !invoice.invoiceNumber || !invoice.items || !Array.isArray(invoice.items)) {
      throw new Error('Invalid invoice data provided')
    }
    
    if (!userId) {
      throw new Error('User ID is required for income generation')
    }
    
    if (invoice.items.length === 0) {
      console.log(`No items found in invoice ${invoice.invoiceNumber}`)
      return []
    }
    
    // Check if income records already exist for this invoice
    const existingRecords = await IncomeExpense.find({
      description: { $regex: `Invoice ${invoice.invoiceNumber}`, $options: 'i' }
    })
    
    if (existingRecords.length > 0) {
      console.log(`Income records already exist for invoice ${invoice.invoiceNumber}`)
      return existingRecords
    }
    
    // Create income records for each invoice item
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i]
      
      // Validate item data
      if (!item.description || item.totalPrice === undefined || item.totalPrice < 0) {
        console.warn(`Skipping invalid item ${i + 1} in invoice ${invoice.invoiceNumber}:`, item)
        continue
      }
      
      const incomeRecord = new IncomeExpense({
        date: invoice.date || new Date(),
        description: `Invoice ${invoice.invoiceNumber} - ${item.description}`.substring(0, 200), // Limit description length
        amount: Math.round(item.totalPrice * 100) / 100, // Ensure 2 decimal places
        type: 'income',
        category: 'normal', // Default to normal, could be configured based on business rules
        note: `Auto-generated from invoice payment. Customer: ${invoice.customer?.name || 'Unknown'}. Qty: ${item.quantity || 1}, Unit Price: ${(item.unitPrice || 0).toLocaleString('th-TH')}`,
        createdBy: userId
      })
      
      const savedRecord = await incomeRecord.save()
      incomeRecords.push(savedRecord)
    }
    
    // Optionally, create a single consolidated income record instead of per-item
    // Uncomment this section if you prefer one record per invoice instead of per item
    /*
    const consolidatedRecord = new IncomeExpense({
      date: invoice.date,
      description: `Invoice ${invoice.invoiceNumber} - ${invoice.customer.name}`,
      amount: invoice.totals.total,
      type: 'income',
      category: 'normal',
      note: `Auto-generated from invoice payment. Items: ${invoice.items.length}, Customer: ${invoice.customer.name}`,
      createdBy: userId
    })
    
    const savedRecord = await consolidatedRecord.save()
    incomeRecords.push(savedRecord)
    */
    
    console.log(`Generated ${incomeRecords.length} income records for invoice ${invoice.invoiceNumber}`)
    return incomeRecords
    
  } catch (error) {
    console.error('Error generating income from invoice:', error)
    throw new Error(`Failed to generate income records: ${error.message}`)
  }
}

/**
 * Remove income records associated with an invoice (if status changes back)
 */
export async function removeIncomeFromInvoice(invoiceNumber: string): Promise<number> {
  try {
    const result = await IncomeExpense.deleteMany({
      description: { $regex: `Invoice ${invoiceNumber}`, $options: 'i' }
    })
    
    console.log(`Removed ${result.deletedCount} income records for invoice ${invoiceNumber}`)
    return result.deletedCount
  } catch (error) {
    console.error('Error removing income from invoice:', error)
    throw new Error(`Failed to remove income records: ${error.message}`)
  }
}

/**
 * Get configuration for income generation
 */
export function getIncomeGenerationConfig() {
  return {
    triggerStatuses: INCOME_TRIGGER_STATUSES,
    defaultCategory: 'normal',
    generatePerItem: true // Set to false for consolidated records
  }
}