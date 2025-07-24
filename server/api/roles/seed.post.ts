import Role from '~/models/Role'
import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // First seed permissions if they don't exist
    const permissionCount = await Permission.countDocuments()
    if (permissionCount === 0) {
      // Create basic permissions
      const permissions = [
        { name: 'dashboard.access', description: 'Access to dashboard', module: 'dashboard', action: 'access', resource: 'dashboard' },
        { name: 'employees.access', description: 'Access to employees module', module: 'employees', action: 'access', resource: 'employees' },
        { name: 'employees.create', description: 'Create employees', module: 'employees', action: 'create', resource: 'employee' },
        { name: 'employees.read', description: 'View employees', module: 'employees', action: 'read', resource: 'employee' },
        { name: 'employees.update', description: 'Update employees', module: 'employees', action: 'update', resource: 'employee' },
        { name: 'employees.delete', description: 'Delete employees', module: 'employees', action: 'delete', resource: 'employee' },
        { name: 'timesheets.access', description: 'Access to timesheets module', module: 'timesheets', action: 'access', resource: 'timesheets' },
        { name: 'timesheets.create', description: 'Create timesheets', module: 'timesheets', action: 'create', resource: 'timesheet' },
        { name: 'timesheets.read', description: 'View timesheets', module: 'timesheets', action: 'read', resource: 'timesheet' },
        { name: 'timesheets.update', description: 'Update timesheets', module: 'timesheets', action: 'update', resource: 'timesheet' },
        { name: 'timesheets.delete', description: 'Delete timesheets', module: 'timesheets', action: 'delete', resource: 'timesheet' },
        { name: 'timesheets.hr_view', description: 'HR timesheet management', module: 'timesheets', action: 'access', resource: 'hr_timesheets' },
        { name: 'settings.access', description: 'Access to settings', module: 'settings', action: 'access', resource: 'settings' },
        { name: 'settings.roles', description: 'Manage roles', module: 'settings', action: 'update', resource: 'roles' },
        { name: 'profile.access', description: 'Access to profile', module: 'profile', action: 'access', resource: 'profile' },
      ]
      
      await Permission.insertMany(permissions)
    }
    
    // Define initial roles
    const initialRoles = [
      {
        name: 'Admin',
        description: 'Full system access',
        permissions: [
          'dashboard.access',
          'employees.access', 'employees.create', 'employees.read', 'employees.update', 'employees.delete',
          'timesheets.access', 'timesheets.create', 'timesheets.read', 'timesheets.update', 'timesheets.delete', 'timesheets.hr_view', 'timesheets.approve', 'timesheets.reject', 'timesheets.reports', 'timesheets.export', 'timesheets.submit',
          'leaves.access', 'leaves.create', 'leaves.read', 'leaves.update', 'leaves.delete', 'leaves.hr_view', 'leaves.approve', 'leaves.reject', 'leaves.balance_manage',
          'reports.access', 'reports.invoices', 'reports.employees', 'reports.export',
          'settings.access', 'settings.roles', 'settings.user_roles',
          'profile.access'
        ],
        isActive: true,
        createdBy: 'system'
      },
      {
        name: 'HR Manager',
        description: 'HR department manager with full HR access',
        permissions: [
          'dashboard.access',
          'employees.access', 'employees.create', 'employees.read', 'employees.update',
          'timesheets.access', 'timesheets.read', 'timesheets.hr_view', 'timesheets.approve', 'timesheets.reject', 'timesheets.reports', 'timesheets.export',
          'leaves.access', 'leaves.create', 'leaves.read', 'leaves.hr_view', 'leaves.approve', 'leaves.reject', 'leaves.balance_manage',
          'reports.access', 'reports.invoices', 'reports.employees', 'reports.export',
          'settings.access', 'settings.user_roles',
          'profile.access'
        ],
        isActive: true,
        createdBy: 'system'
      },
      {
        name: 'Employee',
        description: 'Basic employee access',
        permissions: [
          'dashboard.access',
          'timesheets.access', 'timesheets.create', 'timesheets.read', 'timesheets.update', 'timesheets.submit',
          'leaves.access', 'leaves.create', 'leaves.read', 'leaves.update',
          'profile.access'
        ],
        isActive: true,
        createdBy: 'system'
      }
    ]
    
    // Insert roles if they don't exist
    let createdCount = 0
    let skippedCount = 0
    
    for (const roleData of initialRoles) {
      const existing = await Role.findOne({ name: roleData.name })
      
      if (!existing) {
        await Role.create(roleData)
        createdCount++
      } else {
        skippedCount++
      }
    }
    
    return {
      success: true,
      message: `Roles seeded successfully. Created: ${createdCount}, Skipped: ${skippedCount}`,
      data: {
        created: createdCount,
        skipped: skippedCount,
        total: initialRoles.length
      }
    }
  } catch (error) {
    console.error('Error seeding roles:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed roles'
    })
  }
})