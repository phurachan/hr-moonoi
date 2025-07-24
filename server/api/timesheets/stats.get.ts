import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions
    const { user, isHR, isAdmin } = await validateTimesheetPermission(event, 'timesheets.read')
    
    const query = getQuery(event)
    const { 
      startDate, 
      endDate, 
      employeeId,
      period = 'week' // week, month, year, custom
    } = query
    
    // Build filter object
    const filter: any = {}
    
    // For non-HR users, only show their own timesheets
    if (!isHR && !isAdmin) {
      filter.employeeId = user._id
    }
    
    // Handle employeeId filter (only for HR/Admin)
    if (employeeId && (isHR || isAdmin)) {
      filter.employeeId = employeeId
    }
    
    // Handle date range
    let dateFilter: any = {}
    
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    } else {
      // Default date ranges based on period
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (period) {
        case 'week':
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          const endOfWeek = new Date(startOfWeek)
          endOfWeek.setDate(startOfWeek.getDate() + 6)
          endOfWeek.setHours(23, 59, 59, 999)
          dateFilter = { $gte: startOfWeek, $lte: endOfWeek }
          break
          
        case 'month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          endOfMonth.setHours(23, 59, 59, 999)
          dateFilter = { $gte: startOfMonth, $lte: endOfMonth }
          break
          
        case 'year':
          const startOfYear = new Date(now.getFullYear(), 0, 1)
          const endOfYear = new Date(now.getFullYear(), 11, 31)
          endOfYear.setHours(23, 59, 59, 999)
          dateFilter = { $gte: startOfYear, $lte: endOfYear }
          break
          
        default:
          // Last 30 days
          const thirtyDaysAgo = new Date(today)
          thirtyDaysAgo.setDate(today.getDate() - 30)
          dateFilter = { $gte: thirtyDaysAgo, $lte: today }
      }
    }
    
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter
    }
    
    // Fetch timesheets for calculations
    const timesheets = await Timesheet.find(filter)
      .populate('employeeId', 'name email department')
      .sort({ date: -1 })
    
    // Calculate basic statistics
    const totalTimesheets = timesheets.length
    const totalHours = timesheets.reduce((sum, timesheet) => sum + (timesheet.totalHours || 0), 0)
    const totalBillableHours = timesheets.reduce((sum, timesheet) => sum + (timesheet.totalBillableHours || 0), 0)
    
    // Status breakdown
    const statusBreakdown = timesheets.reduce((acc, timesheet) => {
      acc[timesheet.status] = (acc[timesheet.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Category breakdown (from tasks)
    const categoryBreakdown = timesheets.reduce((acc, timesheet) => {
      timesheet.tasks?.forEach(task => {
        acc[task.category] = (acc[task.category] || 0) + (task.duration || 0) / 60 // Convert to hours
      })
      return acc
    }, {} as Record<string, number>)
    
    // Project breakdown (from tasks)
    const projectBreakdown = timesheets.reduce((acc, timesheet) => {
      timesheet.tasks?.forEach(task => {
        if (task.project) {
          acc[task.project] = (acc[task.project] || 0) + (task.duration || 0) / 60 // Convert to hours
        }
      })
      return acc
    }, {} as Record<string, number>)
    
    // Daily breakdown for charts
    const dailyBreakdown = timesheets.reduce((acc, timesheet) => {
      const dateKey = timesheet.date.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalHours: 0,
          billableHours: 0,
          timesheetCount: 0
        }
      }
      acc[dateKey].totalHours += timesheet.totalHours || 0
      acc[dateKey].billableHours += timesheet.totalBillableHours || 0
      acc[dateKey].timesheetCount += 1
      return acc
    }, {} as Record<string, any>)
    
    // Convert daily breakdown to array and sort by date
    const dailyStats = Object.values(dailyBreakdown).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // Employee breakdown (only for HR/Admin)
    let employeeBreakdown = {}
    if (isHR || isAdmin) {
      employeeBreakdown = timesheets.reduce((acc, timesheet) => {
        const employeeName = timesheet.employeeName || 'Unknown'
        if (!acc[employeeName]) {
          acc[employeeName] = {
            name: employeeName,
            totalHours: 0,
            billableHours: 0,
            timesheetCount: 0,
            department: timesheet.employeeId?.department || 'Unknown'
          }
        }
        acc[employeeName].totalHours += timesheet.totalHours || 0
        acc[employeeName].billableHours += timesheet.totalBillableHours || 0
        acc[employeeName].timesheetCount += 1
        return acc
      }, {} as Record<string, any>)
    }
    
    // Calculate averages and percentages
    const workingDays = dailyStats.length
    const averageHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0
    const billablePercentage = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0
    const approvalRate = totalTimesheets > 0 ? ((statusBreakdown.approved || 0) / totalTimesheets) * 100 : 0
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentActivity = timesheets.filter(timesheet => 
      timesheet.createdAt >= sevenDaysAgo
    ).length
    
    return {
      period,
      dateRange: {
        start: filter.date?.$gte?.toISOString() || null,
        end: filter.date?.$lte?.toISOString() || null
      },
      summary: {
        totalTimesheets,
        totalHours: Math.round(totalHours * 100) / 100,
        totalBillableHours: Math.round(totalBillableHours * 100) / 100,
        workingDays,
        averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
        billablePercentage: Math.round(billablePercentage * 100) / 100,
        approvalRate: Math.round(approvalRate * 100) / 100,
        recentActivity
      },
      breakdowns: {
        status: statusBreakdown,
        category: Object.entries(categoryBreakdown).map(([name, hours]) => ({
          name,
          hours: Math.round(hours * 100) / 100
        })).sort((a, b) => b.hours - a.hours),
        project: Object.entries(projectBreakdown).map(([name, hours]) => ({
          name,
          hours: Math.round(hours * 100) / 100
        })).sort((a, b) => b.hours - a.hours),
        employee: Object.values(employeeBreakdown).sort((a: any, b: any) => 
          b.totalHours - a.totalHours
        )
      },
      charts: {
        daily: dailyStats
      }
    }
  } catch (error: any) {
    console.error('Error fetching timesheet statistics:', error)
    
    // If it's already a createError, throw it as is
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching timesheet statistics',
      data: error,
    })
  }
})