#!/usr/bin/env node

// Script to update admin user permissions in MongoDB
// This ensures admin users have access to reports module

import { MongoClient } from 'mongodb';
import { execSync } from 'child_process';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-moonoi';

async function updateAdminPermissions() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const rolesCollection = db.collection('roles');
    const usersCollection = db.collection('users');
    
    // 1. First, ensure the Admin role has all report permissions
    console.log('\n📋 Updating Admin role permissions...');
    
    const adminRole = await rolesCollection.findOne({ name: 'Admin' });
    if (!adminRole) {
      console.log('❌ Admin role not found. Please run role seeding first.');
      return;
    }
    
    const requiredReportPermissions = [
      'reports.access',
      'reports.invoices', 
      'reports.employees',
      'reports.export'
    ];
    
    // Check if admin role has all report permissions
    const missingPermissions = requiredReportPermissions.filter(
      permission => !adminRole.permissions.includes(permission)
    );
    
    if (missingPermissions.length > 0) {
      console.log(`➕ Adding missing permissions: ${missingPermissions.join(', ')}`);
      
      await rolesCollection.updateOne(
        { name: 'Admin' },
        { 
          $addToSet: { 
            permissions: { $each: missingPermissions } 
          },
          $set: {
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Admin role updated with report permissions');
    } else {
      console.log('✅ Admin role already has all report permissions');
    }
    
    // 2. Update all admin users to have the updated role
    console.log('\n👤 Checking admin users...');
    
    const adminUsers = await usersCollection.find({ role: 'admin' }).toArray();
    console.log(`Found ${adminUsers.length} admin user(s)`);
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No admin users found. Creating a default admin user...');
      
      // Create default admin user
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.default.hash('admin123', 10);
      
      const newAdmin = {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        roles: [adminRole._id],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await usersCollection.insertOne(newAdmin);
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    } else {
      // Update existing admin users to include the role reference
      for (const user of adminUsers) {
        if (!user.roles || !user.roles.includes(adminRole._id)) {
          await usersCollection.updateOne(
            { _id: user._id },
            { 
              $addToSet: { roles: adminRole._id },
              $set: { updatedAt: new Date() }
            }
          );
          console.log(`✅ Updated user: ${user.username || user.email}`);
        } else {
          console.log(`✅ User ${user.username || user.email} already has admin role`);
        }
      }
    }
    
    // 3. Verify permissions
    console.log('\n🔍 Verification:');
    const updatedAdminRole = await rolesCollection.findOne({ name: 'Admin' });
    const reportPerms = updatedAdminRole.permissions.filter(p => p.startsWith('reports.'));
    console.log(`Admin role has ${reportPerms.length} report permissions:`, reportPerms);
    
    console.log('\n✅ Admin report permissions update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating admin permissions:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Handle missing bcrypt module
async function checkAndInstallBcrypt() {
  try {
    await import('bcrypt');
  } catch (error) {
    console.log('📦 Installing bcrypt...');
    execSync('npm install bcrypt', { stdio: 'inherit' });
  }
}

async function main() {
  console.log('🚀 Starting Admin Report Permissions Update');
  console.log('=' .repeat(50));
  
  await checkAndInstallBcrypt();
  await updateAdminPermissions();
}

main().catch(console.error);