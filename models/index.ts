// Import all models to ensure they are registered with Mongoose
// This is especially important for production builds

import Permission from './Permission'
import Role from './Role'
import User from './User'
import Employee from './Employee'
import Customer from './Customer'
import Timesheet from './Timesheet'
import IncomeExpense from './IncomeExpense'
import Invoice from './Invoice'
import Leave from './Leave'
import LeaveBalance from './LeaveBalance'

// Export for convenience
export {
  Permission,
  Role,
  User,
  Employee,
  Customer,
  Timesheet,
  IncomeExpense,
  Invoice,
  Leave,
  LeaveBalance
}