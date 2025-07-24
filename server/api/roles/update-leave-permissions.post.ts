import Role from '~/models/Role'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Define leave permissions for each role
    const rolePermissions = {
      'Admin': [
        'leaves.access', 'leaves.create', 'leaves.read', 'leaves.update', 
        'leaves.delete', 'leaves.hr_view', 'leaves.approve', 'leaves.reject', 
        'leaves.balance_manage'
      ],
      'HR Manager': [
        'leaves.access', 'leaves.create', 'leaves.read', 'leaves.hr_view', 
        'leaves.approve', 'leaves.reject', 'leaves.balance_manage'
      ],
      'Employee': [
        'leaves.access', 'leaves.create', 'leaves.read', 'leaves.update'
      ]
    }
    
    let updatedCount = 0
    
    // Update each role
    for (const [roleName, leavePerms] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ name: roleName })
      
      if (role) {
        // Add leave permissions to existing permissions (avoid duplicates)
        const updatedPermissions = [...new Set([...role.permissions, ...leavePerms])]
        role.permissions = updatedPermissions
        await role.save()
        updatedCount++
      }
    }
    
    return {
      success: true,
      message: `Updated ${updatedCount} roles with leave permissions`,
      data: {
        updatedRoles: updatedCount,
        rolePermissions
      }
    }
  } catch (error) {
    console.error('Error updating roles with leave permissions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update roles with leave permissions'
    })
  }
})