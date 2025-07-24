import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
import { signToken } from '~/lib/jwt'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    const body = await readBody(event)
    const { name, email, password, department, position, role = 'employee' } = body
    
    // Validate required fields
    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, email, and password are required',
      })
    }
    
    // Validate password length
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long',
      })
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email)
    
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists',
      })
    }
    
    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      department: department?.trim(),
      position: position?.trim(),
      role,
      emailVerified: false
    })
    
    await user.save()
    
    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })
    
    // Return user data and token
    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        position: user.position,
        avatar: user.avatar
      }
    }
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists',
      })
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0]?.message || 'Validation error'
      throw createError({
        statusCode: 400,
        statusMessage: message,
      })
    }
    
    // Log unexpected errors
    console.error('Registration error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})