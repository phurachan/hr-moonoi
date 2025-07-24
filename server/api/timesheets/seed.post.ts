import Timesheet from '~/models/Timesheet'
import Employee from '~/models/Employee'
import { connectMongoDB } from '~/lib/mongodb'

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    
    console.log('🌱 Seeding sample timesheet data...')
    
    // Get existing employees
    const employees = await Employee.find({ status: 'active' })
    
    if (employees.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No employees found. Please seed employees first.'
      })
    }
    
    console.log(`Found ${employees.length} employees`)
    
    // Sample project and task data
    const projects = ['Website Redesign', 'Mobile App', 'Database Migration', 'Client Portal', 'API Development']
    const categories = ['development', 'meeting', 'training', 'support', 'admin', 'other']
    const taskTitles = [
      'Frontend Development',
      'Backend API Work',
      'UI/UX Design',
      'Code Review',
      'Bug Fixes',
      'Team Meeting',
      'Client Meeting',
      'Database Optimization',
      'Testing & QA',
      'Documentation',
      'Project Planning',
      'System Architecture'
    ]
    
    let createdCount = 0
    const existingTimesheets = await Timesheet.countDocuments()
    
    if (existingTimesheets > 50) {
      console.log(`Found ${existingTimesheets} existing timesheets, skipping seed`)
      return {
        success: true,
        message: 'Timesheet data already exists',
        data: { existing: existingTimesheets }
      }
    }
    
    // Generate timesheets for the last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    for (const employee of employees) {
      // Generate 15-25 random days of work
      const workDays = Math.floor(Math.random() * 10) + 15
      
      for (let i = 0; i < workDays; i++) {
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
        
        // Skip weekends (roughly)
        if (randomDate.getDay() === 0 || randomDate.getDay() === 6) continue
        
        // Generate 2-5 tasks per day
        const taskCount = Math.floor(Math.random() * 4) + 2
        const tasks = []
        
        for (let j = 0; j < taskCount; j++) {
          const startHour = 8 + Math.floor(Math.random() * 6) // 8 AM to 2 PM
          const startMinute = Math.floor(Math.random() * 60)
          const duration = (Math.random() * 120) + 30 // 30 minutes to 2.5 hours
          
          // Calculate end time
          const startTimeMinutes = startHour * 60 + startMinute
          const endTimeMinutes = startTimeMinutes + Math.round(duration)
          const endHour = Math.floor(endTimeMinutes / 60)
          const endMinute = endTimeMinutes % 60
          
          const task = {
            title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
            project: projects[Math.floor(Math.random() * projects.length)],
            category: categories[Math.floor(Math.random() * categories.length)],
            startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
            endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
            duration: Math.round(duration)
          }
          
          tasks.push(task)
        }
        
        // Determine status (most approved, some submitted, few draft)
        const statusRandom = Math.random()
        let status = 'approved'
        if (statusRandom < 0.1) status = 'draft'
        else if (statusRandom < 0.3) status = 'submitted'
        
        // Get admin user for approvedBy field
        const adminUser = await Employee.findOne({ status: 'active' }).limit(1)
        
        const timesheet = new Timesheet({
          employeeId: employee._id,
          employeeName: employee.name,
          date: randomDate,
          tasks: tasks,
          totalHours: Math.round((tasks.reduce((sum, task) => sum + task.duration, 0) / 60) * 100) / 100,
          status,
          submittedAt: status !== 'draft' ? randomDate : undefined,
          approvedAt: status === 'approved' ? new Date(randomDate.getTime() + 24 * 60 * 60 * 1000) : undefined,
          approvedBy: status === 'approved' && adminUser ? adminUser._id : undefined,
          createdAt: randomDate,
          updatedAt: randomDate
        })
        
        await timesheet.save()
        createdCount++
      }
    }
    
    console.log(`✅ Created ${createdCount} sample timesheets`)
    
    // Get summary stats
    const stats = await Timesheet.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: '$totalHours' }
        }
      }
    ])
    
    return {
      success: true,
      message: `Successfully created ${createdCount} sample timesheets`,
      data: {
        created: createdCount,
        employees: employees.length,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        stats: stats.reduce((acc, stat) => {
          acc[stat._id] = {
            count: stat.count,
            totalHours: Math.round(stat.totalHours * 100) / 100
          }
          return acc
        }, {} as Record<string, any>)
      }
    }
    
  } catch (error: any) {
    console.error('Error seeding timesheets:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed timesheet data: ' + error.message
    })
  }
})