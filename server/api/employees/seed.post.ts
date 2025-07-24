import { connectMongoDB } from '~/lib/mongodb'
import Employee from '~/models/Employee'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Check if data already exists
    const existingEmployees = await Employee.countDocuments()
    
    if (existingEmployees > 0) {
      return { message: 'Data already exists', count: existingEmployees }
    }
    
    const seedEmployees = [
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0123',
        position: 'Software Engineer',
        department: 'Engineering',
        hireDate: '2023-01-15',
        salary: 85000,
        status: 'active',
        address: '123 Main St, New York, NY 10001',
        birthDate: '1990-05-15',
        emergencyContact: 'Jane Doe - 555-0124',
        avatar: '',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        phone: '+1-555-0124',
        position: 'HR Manager',
        department: 'Human Resources',
        hireDate: '2022-08-20',
        salary: 75000,
        status: 'active',
        address: '456 Oak Ave, San Francisco, CA 94102',
        birthDate: '1988-12-03',
        emergencyContact: 'Bob Smith - 555-0125',
        avatar: '',
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1-555-0125',
        position: 'Sales Representative',
        department: 'Sales',
        hireDate: '2023-03-10',
        salary: 60000,
        status: 'active',
        address: '789 Pine St, Chicago, IL 60601',
        birthDate: '1992-07-22',
        emergencyContact: 'Sarah Johnson - 555-0126',
        avatar: '',
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1-555-0126',
        position: 'Marketing Specialist',
        department: 'Marketing',
        hireDate: '2023-02-14',
        salary: 55000,
        status: 'inactive',
        address: '321 Elm St, Los Angeles, CA 90210',
        birthDate: '1991-11-08',
        emergencyContact: 'Tom Wilson - 555-0127',
        avatar: '',
      },
    ]
    
    const createdEmployees = await Employee.insertMany(seedEmployees)
    
    return { 
      message: 'Seed data created successfully', 
      count: createdEmployees.length,
      employees: createdEmployees
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error seeding data',
      data: error,
    })
  }
})