import { connectMongoDB } from '~/lib/mongodb'
import Employee from '~/models/Employee'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Get basic counts
    const totalEmployees = await Employee.countDocuments()
    const activeEmployees = await Employee.countDocuments({ status: 'active' })
    const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' })
    const terminatedEmployees = await Employee.countDocuments({ status: 'terminated' })
    
    // Get department statistics
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ])
    
    const departmentStatsFormatted = departmentStats.reduce((acc, dept) => {
      acc[dept._id] = dept.count
      return acc
    }, {} as Record<string, number>)
    
    // Get salary statistics
    const salaryStats = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalSalary: { $sum: '$salary' },
          averageSalary: { $avg: '$salary' },
        },
      },
    ])
    
    const { totalSalary = 0, averageSalary = 0 } = salaryStats[0] || {}
    
    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      terminatedEmployees,
      departmentStats: departmentStatsFormatted,
      totalSalary,
      averageSalary,
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching employee statistics',
      data: error,
    })
  }
})