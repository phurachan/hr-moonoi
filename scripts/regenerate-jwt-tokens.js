/**
 * Script to handle JWT secret change
 * When JWT secret changes, all existing tokens become invalid
 * This script provides information and utilities for token management
 */

const mongoose = require('mongoose')
const crypto = require('crypto')

// Load environment variables
require('dotenv').config()

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-moonoi'

// Generate a new strong JWT secret
function generateNewJWTSecret() {
  return crypto.randomBytes(64).toString('hex')
}

// User schema (simplified for this script)
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', UserSchema)

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Get current JWT secret
    const currentSecret = process.env.JWT_SECRET
    console.log('\n📋 JWT Token Management Report:')
    console.log('=====================================')
    
    if (currentSecret) {
      console.log('✅ JWT_SECRET is configured in environment')
      console.log(`📝 Current secret length: ${currentSecret.length} characters`)
    } else {
      console.log('⚠️  JWT_SECRET not found in environment - using default')
    }

    // Generate a new strong secret suggestion
    const newSecret = generateNewJWTSecret()
    console.log('\n🔑 Suggested new JWT secret:')
    console.log(`JWT_SECRET=${newSecret}`)

    // Get user statistics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isActive: true })
    const recentUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
    })

    console.log('\n👥 User Statistics:')
    console.log(`📊 Total users: ${totalUsers}`)
    console.log(`✅ Active users: ${activeUsers}`)
    console.log(`🕒 Users logged in last 7 days: ${recentUsers}`)

    console.log('\n📢 Important Notes:')
    console.log('• When JWT secret changes, ALL existing tokens become invalid')
    console.log('• Users will need to log in again to get new valid tokens')
    console.log('• No user passwords are affected - only JWT tokens')
    console.log('• This is a security feature, not a bug')

    console.log('\n🔧 Next Steps:')
    console.log('1. Update your .env file with the new JWT_SECRET above')
    console.log('2. Restart your application')
    console.log('3. Inform users they need to log in again')
    console.log('4. Monitor for any authentication issues')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('\n✅ Disconnected from MongoDB')
  }
}

// Run the script
main().catch(console.error)