import { connectMongoDB } from '~/lib/mongodb'
import Permission from '~/models/Permission'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    // Test creating a single leave permission
    const testPermission = {
      name: 'leaves.test',
      description: 'Test leave permission',
      module: 'leaves',
      action: 'access',
      resource: 'leaves',
      isActive: true
    }
    
    // Check if permission already exists
    const existing = await Permission.findOne({ name: testPermission.name })
    
    if (existing) {
      return {
        success: true,
        message: 'Test permission already exists',
        permission: existing
      }
    }
    
    // Try to create the permission
    const created = await Permission.create(testPermission)
    
    // Clean up - delete the test permission
    await Permission.findByIdAndDelete(created._id)
    
    return {
      success: true,
      message: 'Permission model is working correctly',
      testResult: 'Permission created and deleted successfully'
    }
    
  } catch (error) {
    console.error('Permission test error:', error)
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
})