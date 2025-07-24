import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
import Role from '~/models/Role'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Check if users already exist
    const existingUsersCount = await User.countDocuments()
    
    if (existingUsersCount > 0) {
      return { 
        message: 'Users already exist', 
        count: existingUsersCount 
      }
    }
    
    // Create default users
    const defaultUsers = [
      {
        name: 'System Administrator',
        email: 'admin@hr-moonoi.com',
        password: 'admin123456',
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'HR Manager',
        email: 'hr@hr-moonoi.com',
        password: 'hr123456',
        role: 'hr',
        department: 'Human Resources',
        position: 'HR Manager',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'John Employee',
        email: 'employee@hr-moonoi.com',
        password: 'emp123456',
        role: 'employee',
        department: 'Engineering',
        position: 'Software Developer',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@hr-moonoi.com',
        password: 'jane123456',
        role: 'employee',
        department: 'Marketing',
        position: 'Marketing Specialist',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@hr-moonoi.com',
        password: 'mike123456',
        role: 'employee',
        department: 'Sales',
        position: 'Sales Representative',
        isActive: true,
        emailVerified: true
      }
    ]
    
    // Get roles from database
    const adminRole = await Role.findOne({ name: 'Admin' })
    const hrRole = await Role.findOne({ name: 'HR Manager' })
    const employeeRole = await Role.findOne({ name: 'Employee' })
    
    const createdUsers = []
    
    for (const userData of defaultUsers) {
      const user = new User(userData)
      
      // Assign appropriate roles based on user role
      if (userData.role === 'admin' && adminRole) {
        user.roles = [adminRole._id]
      } else if (userData.role === 'hr' && hrRole) {
        user.roles = [hrRole._id]
      } else if (userData.role === 'employee' && employeeRole) {
        user.roles = [employeeRole._id]
      }
      
      await user.save()
      createdUsers.push(user)
    }
    
    return {
      message: 'Default users created successfully',
      count: createdUsers.length,
      users: createdUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position
      }))
    }
  } catch (error: any) {
    console.error('Seed users error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating default users',
      data: error,
    })
  }
})