import { connectMongoDB } from '~/lib/mongodb'
import User from '~/models/User'
import Role from '~/models/Role'
import { signToken } from '~/lib/jwt'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    const body = await readBody(event)
    const { email, password } = body
    
    // Validate input
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      })
    }
    
    // Find user by email and populate roles
    const user = await User.findByEmail(email).populate('roles', 'name description permissions isActive')
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password',
      })
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Account has been deactivated',
      })
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid email or password',
      })
    }
    
    // Update last login
    user.lastLogin = new Date()
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
        avatar: user.avatar,
        roles: user.roles || []
      }
    }
  } catch (error: any) {
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }
    
    // Log unexpected errors
    console.error('Login error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})