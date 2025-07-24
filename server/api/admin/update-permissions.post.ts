import Role from '~/models/Role'
import User from '~/models/User'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    console.log('🔄 Updating admin permissions for reports access...')
    
    // 1. Ensure Admin role has all report permissions
    const adminRole = await Role.findOne({ name: 'Admin' })
    if (!adminRole) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Admin role not found. Please run role seeding first.'
      })
    }
    
    const requiredReportPermissions = [
      'reports.access',
      'reports.invoices', 
      'reports.employees',
      'reports.export'
    ]
    
    // Check if admin role has all report permissions
    const missingPermissions = requiredReportPermissions.filter(
      permission => !adminRole.permissions.includes(permission)
    )
    
    let roleUpdated = false
    if (missingPermissions.length > 0) {
      console.log(`➕ Adding missing permissions: ${missingPermissions.join(', ')}`)
      
      await Role.updateOne(
        { name: 'Admin' },
        { 
          $addToSet: { 
            permissions: { $each: missingPermissions } 
          },
          $set: {
            updatedAt: new Date()
          }
        }
      )
      roleUpdated = true
      console.log('✅ Admin role updated with report permissions')
    } else {
      console.log('✅ Admin role already has all report permissions')
    }
    
    // 2. Update all admin users to have the updated role
    console.log('👤 Checking admin users...')
    
    const adminUsers = await User.find({ 
      $or: [
        { role: 'admin' },
        { roles: adminRole._id }
      ]
    })
    
    console.log(`Found ${adminUsers.length} admin user(s)`)
    
    let usersUpdated = 0
    for (const user of adminUsers) {
      let userNeedsUpdate = false
      let updates = {}
      
      // Ensure user has admin role reference
      if (!user.roles || !user.roles.includes(adminRole._id)) {
        if (!updates.$addToSet) updates.$addToSet = {}
        updates.$addToSet.roles = adminRole._id
        userNeedsUpdate = true
      }
      
      // Ensure user has admin role string
      if (user.role !== 'admin') {
        if (!updates.$set) updates.$set = {}
        updates.$set.role = 'admin'
        userNeedsUpdate = true
      }
      
      if (userNeedsUpdate) {
        if (!updates.$set) updates.$set = {}
        updates.$set.updatedAt = new Date()
        
        await User.updateOne({ _id: user._id }, updates)
        usersUpdated++
        console.log(`✅ Updated user: ${user.username || user.email}`)
      } else {
        console.log(`✅ User ${user.username || user.email} already has admin role`)
      }
    }
    
    // 3. Verify permissions
    console.log('🔍 Verification:')
    const updatedAdminRole = await Role.findOne({ name: 'Admin' })
    const reportPerms = updatedAdminRole.permissions.filter(p => p.startsWith('reports.'))
    console.log(`Admin role has ${reportPerms.length} report permissions:`, reportPerms)
    
    return {
      success: true,
      message: 'Admin report permissions updated successfully',
      data: {
        roleUpdated,
        usersUpdated,
        totalAdminUsers: adminUsers.length,
        reportPermissions: reportPerms,
        adminRoleId: adminRole._id
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating admin permissions:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update admin permissions: ' + error.message
    })
  }
})