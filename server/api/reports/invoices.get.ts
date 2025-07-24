import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import Employee from '~/models/Employee'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions - require invoice/reports access
    const { user, isHR, isAdmin } = await validateTimesheetPermission(event, 'reports.invoices')
    
    const query = getQuery(event)
    const { 
      startDate, 
      endDate, 
      employeeId,
      department,
      project,
      rateType,
      billableOnly = false
    } = query
    
    // Validate required date range
    if (!startDate || !endDate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Start date and end date are required'
      })
    }
    
    // Build filter object
    const filter: any = {
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      },
      status: { $in: ['submitted', 'approved'] } // Only include submitted/approved timesheets
    }
    
    // For non-HR users, only show their own timesheets
    if (!isHR && !isAdmin) {
      filter.employeeId = user._id
    }
    
    // Handle employeeId filter (only for HR/Admin)
    if (employeeId && (isHR || isAdmin)) {
      filter.employeeId = employeeId
    }
    
    // Fetch timesheets with employee data
    const timesheets = await Timesheet.find(filter)
      .populate('employeeId', 'name email department hourlyRate')
      .sort({ date: -1 })
    
    // Process timesheet data into invoice entries
    const invoiceEntries = []
    
    for (const timesheet of timesheets) {
      const employee = timesheet.employeeId
      if (!employee) continue
      
      // Filter by department if specified
      if (department && employee.department !== department) continue
      
      // Default hourly rate if not set
      const defaultRate = employee.hourlyRate || 50
      
      for (const task of timesheet.tasks || []) {
        // Filter by project if specified
        if (project && (!task.project || !task.project.toLowerCase().includes(project.toLowerCase()))) continue
        
        // Calculate billable status and rate
        const isBillable = task.category !== 'admin' && task.category !== 'training'
        
        // Skip non-billable if billableOnly filter is active
        if (billableOnly === 'true' && !isBillable) continue
        
        // Determine rate based on type
        let hourlyRate = defaultRate
        
        if (rateType) {
          switch (rateType) {
            case 'overtime':
              hourlyRate = task.isOT ? defaultRate * 1.5 : defaultRate
              if (!task.isOT && rateType === 'overtime') continue
              break
            case 'fixed':
              hourlyRate = 75 // Fixed rate projects
              break
            case 'hourly':
            default:
              hourlyRate = defaultRate
              break
          }
        } else if (task.isOT) {
          hourlyRate = defaultRate * 1.5 // Overtime rate
        }
        
        const hours = (task.duration || 0) / 60 // Convert minutes to hours
        
        invoiceEntries.push({
          id: `${timesheet._id}_${task.title}_${task.startTime}`,
          date: timesheet.date,
          employeeName: employee.name,
          employeeId: employee._id,
          department: employee.department,
          project: task.project || 'General',
          description: task.title,
          category: task.category,
          hours: parseFloat(hours.toFixed(2)),
          rate: hourlyRate,
          amount: parseFloat((hours * hourlyRate).toFixed(2)),
          isBillable,
          isOT: task.isOT || false,
          status: timesheet.status,
          timesheetId: timesheet._id
        })
      }
    }
    
    // Apply additional filters
    let filteredEntries = invoiceEntries
    
    // Calculate summary statistics
    const summary = {
      totalHours: filteredEntries.reduce((sum, entry) => sum + entry.hours, 0),
      billableHours: filteredEntries.filter(entry => entry.isBillable).reduce((sum, entry) => sum + entry.hours, 0),
      totalAmount: filteredEntries.reduce((sum, entry) => sum + entry.amount, 0),
      billableAmount: filteredEntries.filter(entry => entry.isBillable).reduce((sum, entry) => sum + entry.amount, 0),
      overtimeHours: filteredEntries.filter(entry => entry.isOT).reduce((sum, entry) => sum + entry.hours, 0),
      overtimeAmount: filteredEntries.filter(entry => entry.isOT).reduce((sum, entry) => sum + entry.amount, 0)
    }
    
    // Group by employee for additional insights
    const employeeBreakdown = filteredEntries.reduce((acc, entry) => {
      if (!acc[entry.employeeId]) {
        acc[entry.employeeId] = {
          name: entry.employeeName,
          department: entry.department,
          totalHours: 0,
          billableHours: 0,
          totalAmount: 0,
          entries: 0
        }
      }
      
      acc[entry.employeeId].totalHours += entry.hours
      acc[entry.employeeId].totalAmount += entry.amount
      acc[entry.employeeId].entries += 1
      
      if (entry.isBillable) {
        acc[entry.employeeId].billableHours += entry.hours
      }
      
      return acc
    }, {} as Record<string, any>)
    
    // Project breakdown
    const projectBreakdown = filteredEntries.reduce((acc, entry) => {
      const project = entry.project || 'General'
      if (!acc[project]) {
        acc[project] = {
          name: project,
          totalHours: 0,
          totalAmount: 0,
          entries: 0
        }
      }
      
      acc[project].totalHours += entry.hours
      acc[project].totalAmount += entry.amount
      acc[project].entries += 1
      
      return acc
    }, {} as Record<string, any>)
    
    return {
      period: {
        startDate,
        endDate
      },
      filters: {
        employeeId,
        department,
        project,
        rateType,
        billableOnly
      },
      summary: {
        ...summary,
        totalHours: Math.round(summary.totalHours * 100) / 100,
        billableHours: Math.round(summary.billableHours * 100) / 100,
        totalAmount: Math.round(summary.totalAmount * 100) / 100,
        billableAmount: Math.round(summary.billableAmount * 100) / 100,
        overtimeHours: Math.round(summary.overtimeHours * 100) / 100,
        overtimeAmount: Math.round(summary.overtimeAmount * 100) / 100,
        billablePercentage: summary.totalHours > 0 ? Math.round((summary.billableHours / summary.totalHours) * 10000) / 100 : 0
      },
      entries: filteredEntries,
      breakdowns: {
        employees: Object.values(employeeBreakdown).sort((a: any, b: any) => b.totalAmount - a.totalAmount),
        projects: Object.values(projectBreakdown).sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      },
      metadata: {
        totalEntries: filteredEntries.length,
        uniqueEmployees: Object.keys(employeeBreakdown).length,
        uniqueProjects: Object.keys(projectBreakdown).length,
        generatedAt: new Date().toISOString(),
        generatedBy: user.name || user.email
      }
    }
  } catch (error: any) {
    console.error('Error generating invoice report:', error)
    
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error generating invoice report',
      data: error,
    })
  }
})