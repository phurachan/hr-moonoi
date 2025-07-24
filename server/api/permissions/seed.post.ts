import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Define initial permissions for the menu system
    const initialPermissions = [
      // Dashboard permissions
      {
        name: 'dashboard.access',
        description: 'Access to dashboard page',
        module: 'dashboard',
        action: 'access',
        resource: 'dashboard',
        isActive: true
      },
      
      // Employee permissions
      {
        name: 'employees.access',
        description: 'Access to employees module',
        module: 'employees',
        action: 'access',
        resource: 'employees',
        isActive: true
      },
      {
        name: 'employees.create',
        description: 'Create new employees',
        module: 'employees',
        action: 'create',
        resource: 'employee',
        isActive: true
      },
      {
        name: 'employees.read',
        description: 'View employee details',
        module: 'employees',
        action: 'read',
        resource: 'employee',
        isActive: true
      },
      {
        name: 'employees.update',
        description: 'Update employee information',
        module: 'employees',
        action: 'update',
        resource: 'employee',
        isActive: true
      },
      {
        name: 'employees.delete',
        description: 'Delete employees',
        module: 'employees',
        action: 'delete',
        resource: 'employee',
        isActive: true
      },
      
      // Customer permissions
      {
        name: 'customers.access',
        description: 'Access to customers module',
        module: 'customers',
        action: 'access',
        resource: 'customers',
        isActive: true
      },
      {
        name: 'customers.create',
        description: 'Create new customers',
        module: 'customers',
        action: 'create',
        resource: 'customer',
        isActive: true
      },
      {
        name: 'customers.read',
        description: 'View customer details',
        module: 'customers',
        action: 'read',
        resource: 'customer',
        isActive: true
      },
      {
        name: 'customers.update',
        description: 'Update customer information',
        module: 'customers',
        action: 'update',
        resource: 'customer',
        isActive: true
      },
      {
        name: 'customers.delete',
        description: 'Delete customers',
        module: 'customers',
        action: 'delete',
        resource: 'customer',
        isActive: true
      },
      
      // Timesheet permissions
      {
        name: 'timesheets.access',
        description: 'Access to timesheets module',
        module: 'timesheets',
        action: 'access',
        resource: 'timesheets',
        isActive: true
      },
      {
        name: 'timesheets.create',
        description: 'Create new timesheets',
        module: 'timesheets',
        action: 'create',
        resource: 'timesheet',
        isActive: true
      },
      {
        name: 'timesheets.read',
        description: 'View timesheet details',
        module: 'timesheets',
        action: 'read',
        resource: 'timesheet',
        isActive: true
      },
      {
        name: 'timesheets.update',
        description: 'Update timesheet entries',
        module: 'timesheets',
        action: 'update',
        resource: 'timesheet',
        isActive: true
      },
      {
        name: 'timesheets.delete',
        description: 'Delete timesheet entries',
        module: 'timesheets',
        action: 'delete',
        resource: 'timesheet',
        isActive: true
      },
      {
        name: 'timesheets.approve',
        description: 'Approve timesheet entries',
        module: 'timesheets',
        action: 'update',
        resource: 'timesheet_approval',
        isActive: true
      },
      {
        name: 'timesheets.hr_view',
        description: 'Access HR timesheet management',
        module: 'timesheets',
        action: 'access',
        resource: 'hr_timesheets',
        isActive: true
      },
      {
        name: 'timesheets.submit',
        description: 'Submit timesheets for approval',
        module: 'timesheets',
        action: 'update',
        resource: 'timesheet_status',
        isActive: true
      },
      {
        name: 'timesheets.reject',
        description: 'Reject timesheet entries',
        module: 'timesheets',
        action: 'update',
        resource: 'timesheet_rejection',
        isActive: true
      },
      {
        name: 'timesheets.export',
        description: 'Export timesheet data',
        module: 'timesheets',
        action: 'read',
        resource: 'timesheet_export',
        isActive: true
      },
      
      // Invoice permissions
      {
        name: 'invoices.access',
        description: 'Access to invoices module',
        module: 'invoices',
        action: 'access',
        resource: 'invoices',
        isActive: true
      },
      {
        name: 'invoices.create',
        description: 'Create new invoices',
        module: 'invoices',
        action: 'create',
        resource: 'invoice',
        isActive: true
      },
      {
        name: 'invoices.read',
        description: 'View invoice details',
        module: 'invoices',
        action: 'read',
        resource: 'invoice',
        isActive: true
      },
      {
        name: 'invoices.update',
        description: 'Update invoice information',
        module: 'invoices',
        action: 'update',
        resource: 'invoice',
        isActive: true
      },
      {
        name: 'invoices.delete',
        description: 'Delete invoices',
        module: 'invoices',
        action: 'delete',
        resource: 'invoice',
        isActive: true
      },
      {
        name: 'invoices.export',
        description: 'Export invoices to PDF/Excel',
        module: 'invoices',
        action: 'read',
        resource: 'invoice_export',
        isActive: true
      },
      
      // Income/Expense permissions
      {
        name: 'income_expense.access',
        description: 'Access to income/expense module',
        module: 'income_expense',
        action: 'access',
        resource: 'income_expense',
        isActive: true
      },
      {
        name: 'income_expense.create',
        description: 'Create new income/expense records',
        module: 'income_expense',
        action: 'create',
        resource: 'income_expense',
        isActive: true
      },
      {
        name: 'income_expense.read',
        description: 'View income/expense records',
        module: 'income_expense',
        action: 'read',
        resource: 'income_expense',
        isActive: true
      },
      {
        name: 'income_expense.update',
        description: 'Update income/expense records',
        module: 'income_expense',
        action: 'update',
        resource: 'income_expense',
        isActive: true
      },
      {
        name: 'income_expense.delete',
        description: 'Delete income/expense records',
        module: 'income_expense',
        action: 'delete',
        resource: 'income_expense',
        isActive: true
      },
      
      // Leave Management permissions
      {
        name: 'leaves.access',
        description: 'Access leave management system',
        module: 'leaves',
        action: 'access',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.create',
        description: 'Create leave requests',
        module: 'leaves',
        action: 'create',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.read',
        description: 'View leave requests',
        module: 'leaves',
        action: 'read',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.update',
        description: 'Update leave requests',
        module: 'leaves',
        action: 'update',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.delete',
        description: 'Delete leave requests',
        module: 'leaves',
        action: 'delete',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.hr_view',
        description: 'View all employee leave requests (HR)',
        module: 'leaves',
        action: 'hr_view',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.approve',
        description: 'Approve leave requests',
        module: 'leaves',
        action: 'approve',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.reject',
        description: 'Reject leave requests',
        module: 'leaves',
        action: 'reject',
        resource: 'leaves',
        isActive: true
      },
      {
        name: 'leaves.balance_manage',
        description: 'Manage employee leave balances',
        module: 'leaves',
        action: 'balance_manage',
        resource: 'leave_balances',
        isActive: true
      },
      
      // Settings permissions
      {
        name: 'settings.access',
        description: 'Access to settings module',
        module: 'settings',
        action: 'access',
        resource: 'settings',
        isActive: true
      },
      {
        name: 'settings.roles',
        description: 'Manage roles and permissions',
        module: 'settings',
        action: 'update',
        resource: 'roles',
        isActive: true
      },
      {
        name: 'settings.permissions',
        description: 'Manage permissions',
        module: 'settings',
        action: 'update',
        resource: 'permissions',
        isActive: true
      },
      {
        name: 'settings.user_roles',
        description: 'Assign roles to users',
        module: 'settings',
        action: 'update',
        resource: 'user_roles',
        isActive: true
      },
      
      // Profile permissions
      {
        name: 'profile.access',
        description: 'Access to profile page',
        module: 'profile',
        action: 'access',
        resource: 'profile',
        isActive: true
      },
      {
        name: 'profile.update',
        description: 'Update own profile',
        module: 'profile',
        action: 'update',
        resource: 'own_profile',
        isActive: true
      }
    ]
    
    // Insert permissions if they don't exist
    let createdCount = 0
    let skippedCount = 0
    
    for (const permissionData of initialPermissions) {
      const existing = await Permission.findOne({ name: permissionData.name })
      
      if (!existing) {
        await Permission.create(permissionData)
        createdCount++
      } else {
        skippedCount++
      }
    }
    
    return {
      success: true,
      message: `Permissions seeded successfully. Created: ${createdCount}, Skipped: ${skippedCount}`,
      data: {
        created: createdCount,
        skipped: skippedCount,
        total: initialPermissions.length
      }
    }
  } catch (error) {
    console.error('Error seeding permissions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed permissions'
    })
  }
})