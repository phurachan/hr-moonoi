// Server-only plugin that runs first (00. prefix ensures early execution)
// This ensures all Mongoose models are registered before any API calls

export default defineNuxtPlugin({
  name: 'models-registration',
  async setup() {
    if (process.server) {
      try {
        // Dynamically import all models to ensure they're registered
        await Promise.all([
          import('~/models/Permission'),
          import('~/models/Role'),
          import('~/models/User'),
          import('~/models/Employee'),
          import('~/models/Customer'),
          import('~/models/Timesheet'),
          import('~/models/IncomeExpense'),
          import('~/models/Invoice'),
          import('~/models/Leave'),
          import('~/models/LeaveBalance')
        ])
        
        // console.log('✅ All Mongoose models registered successfully')
      } catch (error) {
        console.error('❌ Error registering models:', error)
      }
    }
  }
})