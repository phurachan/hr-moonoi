import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Define only leave permissions for testing
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
    
    let createdCount = 0
    let skippedCount = 0
    let errors = []
    
    // Insert permissions one by one with error handling
    for (const permissionData of leavePermissions) {
      try {
        const existing = await Permission.findOne({ name: permissionData.name })
        
        if (!existing) {
          await Permission.create(permissionData)
          createdCount++
          console.log(`Created permission: ${permissionData.name}`)
        } else {
          skippedCount++
          console.log(`Skipped existing permission: ${permissionData.name}`)
        }
      } catch (error) {
        errors.push({
          permission: permissionData.name,
          error: error.message
        })
        console.error(`Error creating permission ${permissionData.name}:`, error)
      }
    }
    
    return {
      success: errors.length === 0,
      message: `Leave permissions seeded. Created: ${createdCount}, Skipped: ${skippedCount}, Errors: ${errors.length}`,
      data: {
        created: createdCount,
        skipped: skippedCount,
        errors: errors,
        total: leavePermissions.length
      }
    }
  } catch (error) {
    console.error('Error seeding leave permissions:', error)
    return {
      success: false,
      error: error.message,
      stack: error.stack
    }
  }
})