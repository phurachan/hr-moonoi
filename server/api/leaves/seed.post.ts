import { connectMongoDB } from '~/lib/mongodb'
import Permission from '~/models/Permission'
import Role from '~/models/Role'
import Employee from '~/models/Employee'
import LeaveBalance from '~/models/LeaveBalance'
import { verifyToken } from '~/lib/jwt'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  // Verify authentication and admin role
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No authorization header provided'
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const user = verifyToken(token)
  
  if (!user || user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  try {
    // Create leave permissions
    const leavePermissions = [
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
      }
    ]

    // Insert permissions if they don't exist
    let createdPermissions = 0
    for (const permData of leavePermissions) {
      const existingPermission = await Permission.findOne({ name: permData.name })
      if (!existingPermission) {
        await Permission.create(permData)
        createdPermissions++
      }
    }

    // Update role permissions
    const adminRole = await Role.findOne({ name: 'admin' })
    const hrRole = await Role.findOne({ name: 'hr' })
    const employeeRole = await Role.findOne({ name: 'employee' })

    // Admin gets all leave permissions
    if (adminRole) {
      const allLeavePermissions = leavePermissions.map(p => p.name)
      const updatedPermissions = [...new Set([...adminRole.permissions, ...allLeavePermissions])]
      adminRole.permissions = updatedPermissions
      await adminRole.save()
    }

    // HR gets most leave permissions
    if (hrRole) {
      const hrLeavePermissions = [
        'leaves.access',
        'leaves.create',
        'leaves.read',
        'leaves.update',
        'leaves.hr_view',
        'leaves.approve',
        'leaves.reject',
        'leaves.balance_manage'
      ]
      const updatedPermissions = [...new Set([...hrRole.permissions, ...hrLeavePermissions])]
      hrRole.permissions = updatedPermissions
      await hrRole.save()
    }

    // Employee gets basic leave permissions
    if (employeeRole) {
      const employeeLeavePermissions = [
        'leaves.access',
        'leaves.create',
        'leaves.read',
        'leaves.update'
      ]
      const updatedPermissions = [...new Set([...employeeRole.permissions, ...employeeLeavePermissions])]
      employeeRole.permissions = updatedPermissions
      await employeeRole.save()
    }

    // Initialize leave balances for all active employees (current year)
    const currentYear = new Date().getFullYear()
    const activeEmployees = await Employee.find({ status: 'active' })
    
    let initializedBalances = 0
    for (const employee of activeEmployees) {
      const existingBalance = await LeaveBalance.findOne({ 
        employeeId: employee.id, 
        year: currentYear 
      })
      
      if (!existingBalance) {
        await LeaveBalance.create({
          employeeId: employee.id,
          employeeName: employee.name,
          year: currentYear,
          leaveBalances: {
            annual: { total: 21, used: 0, remaining: 21 },
            sick: { total: 10, used: 0, remaining: 10 },
            personal: { total: 5, used: 0, remaining: 5 },
            maternity: { total: 90, used: 0, remaining: 90 },
            paternity: { total: 15, used: 0, remaining: 15 },
            emergency: { total: 3, used: 0, remaining: 3 }
          }
        })
        initializedBalances++
      }
    }

    return {
      success: true,
      message: 'Leave system seeded successfully',
      data: {
        permissionsCreated: createdPermissions,
        rolesUpdated: [adminRole, hrRole, employeeRole].filter(Boolean).length,
        balancesInitialized: initializedBalances,
        totalEmployees: activeEmployees.length
      }
    }
  } catch (error) {
    console.error('Error seeding leave system:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error seeding leave system',
      data: error,
    })
  }
})