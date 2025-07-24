// Import all models to ensure they are registered with Mongoose
// This is especially important for production builds

// Import models in order of dependencies (models without references first)
import './Permission'
import './Role'
import './User'
import './Employee'
import './Customer'
import './Timesheet'
import './IncomeExpense'
import './Invoice'
import './Leave'
import './LeaveBalance'

// Re-export models for convenience
export { default as User } from './User'
export { default as Role } from './Role'
export { default as Permission } from './Permission'
export { default as Employee } from './Employee'
export { default as Customer } from './Customer'
export { default as Timesheet } from './Timesheet'
export { default as IncomeExpense } from './IncomeExpense'
export { default as Invoice } from './Invoice'
export { default as Leave } from './Leave'
export { default as LeaveBalance } from './LeaveBalance'