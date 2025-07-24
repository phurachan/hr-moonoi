import Permission from '~/models/Permission'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    console.log('Starting permission migration...')
    
    // Step 1: Remove old reports permissions
    const permissionsToRemove = [
      'timesheets.reports',
      'reports.employees',
      'reports.access',
      'reports.invoices', 
      'reports.export'
    ]
    
    let removedCount = 0
    for (const permissionName of permissionsToRemove) {
      const result = await Permission.deleteOne({ name: permissionName })
      if (result.deletedCount > 0) {
        removedCount++
        console.log(`Removed permission: ${permissionName}`)
      }
    }
    
    // Step 2: Add new invoice permissions
    const invoicePermissions = [
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
      }
    ]
    
    let createdCount = 0
    let skippedCount = 0
    
    for (const permissionData of invoicePermissions) {
      const existing = await Permission.findOne({ name: permissionData.name })
      
      if (!existing) {
        await Permission.create(permissionData)
        createdCount++
        console.log(`Created permission: ${permissionData.name}`)
      } else {
        skippedCount++
        console.log(`Skipped existing permission: ${permissionData.name}`)
      }
    }
    
    console.log('Permission migration completed.')
    
    return {
      success: true,
      message: `Migration completed. Removed ${removedCount} old permissions, created ${createdCount} new permissions, skipped ${skippedCount} existing permissions.`,
      data: {
        removed: removedCount,
        created: createdCount,
        skipped: skippedCount,
        removedPermissions: permissionsToRemove,
        createdPermissions: invoicePermissions.map(p => p.name)
      }
    }
  } catch (error) {
    console.error('Error during permission migration:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to migrate permissions'
    })
  }
})