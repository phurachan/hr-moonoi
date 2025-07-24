# Invoice to Income Integration

This document explains how the system automatically generates income records when invoice statuses change.

## Overview

When an invoice status changes to "paid", the system automatically:
1. Creates income records in the Income/Expense module
2. One income record per invoice item (configurable)
3. Links the income to the original invoice for tracking

## Configuration

### Status Triggers
Currently configured in `/server/utils/invoiceIncomeUtils.ts`:
- **Trigger Status**: `paid` 
- **Action**: Generate income records from invoice items

### Income Record Generation
- **Type**: `income`
- **Category**: `normal` (default)
- **Date**: Uses invoice date
- **Amount**: Uses item total price
- **Description**: `Invoice {number} - {item description}`
- **Note**: Includes customer name, quantity, and unit price

## Behavior Examples

### Example 1: Invoice Status Change to "Paid"
```
Invoice: INV-2024-001
Status: draft → paid
Items:
- Web Development Service: $1,500
- Hosting Setup: $200

Generated Income Records:
1. Date: 2024-01-15, Amount: $1,500, Description: "Invoice INV-2024-001 - Web Development Service"
2. Date: 2024-01-15, Amount: $200, Description: "Invoice INV-2024-001 - Hosting Setup"
```

### Example 2: Status Reverted from "Paid"
```
Invoice: INV-2024-001
Status: paid → draft

Action: Removes previously generated income records
```

## API Response

When updating invoice status, the API returns:
```json
{
  "success": true,
  "message": "Invoice updated successfully. Generated 2 income record(s).",
  "invoice": { ... },
  "incomeRecords": [ ... ],
  "statusChange": {
    "from": "draft",
    "to": "paid",
    "triggeredIncome": true
  }
}
```

## Frontend Integration

### Invoice Reports Page
- Shows success message when income is generated
- Displays count of generated records
- Handles status changes gracefully

### Income/Expense Page
- Auto-generated records appear immediately
- Clearly marked as invoice-related
- Can be viewed and managed like regular income records

## Technical Implementation

### Files Modified/Created:
1. `/server/utils/invoiceIncomeUtils.ts` - Core logic
2. `/server/api/invoices/[id].put.ts` - Invoice update endpoint
3. `/pages/reports/invoices.vue` - Frontend feedback

### Key Functions:
- `shouldGenerateIncome()` - Determines if status change triggers income
- `generateIncomeFromInvoice()` - Creates income records
- `removeIncomeFromInvoice()` - Removes records if status reverted

## Configuration Options

To modify behavior, edit `/server/utils/invoiceIncomeUtils.ts`:

```typescript
// Change trigger statuses
const INCOME_TRIGGER_STATUSES = ['paid', 'completed'] // Add more statuses

// Switch to consolidated records (one per invoice instead of per item)
// Uncomment the consolidated section in generateIncomeFromInvoice()

// Change default category
// Modify the category field in income record creation
```

## Error Handling

- Invoice updates never fail due to income generation errors
- Income generation errors are logged but don't block invoice updates
- Users receive informative messages about any issues
- Duplicate prevention: Won't create income records if they already exist

## Future Enhancements

Potential improvements:
1. **Configurable Categories**: Map invoice types to different income categories
2. **Custom Descriptions**: Allow templates for income descriptions
3. **Batch Processing**: Handle multiple invoice status changes
4. **Reverse Integration**: Update invoice status when income is modified
5. **Reporting**: Track invoice-to-income generation statistics