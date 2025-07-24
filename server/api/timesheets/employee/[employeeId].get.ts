import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const employeeId = getRouterParam(event, 'employeeId')
  const query = getQuery(event)
  const { startDate, endDate, status } = query
  
  try {
    // Validate permissions with specific employee ID
    await validateTimesheetPermission(event, 'timesheets.read', employeeId)
    // Build filter object
    const filter: any = { employeeId }
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate as string) }
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate as string) }
    }
    
    if (status) {
      filter.status = status
    }
    
    const timesheets = await Timesheet.find(filter)
      .sort({ date: 1 })
      .populate('approvedBy', 'name')
    
    // Calculate summary statistics
    const totalHours = timesheets.reduce((sum, timesheet) => sum + timesheet.totalHours, 0)
    const totalBillableHours = timesheets.reduce((sum, timesheet) => sum + timesheet.totalBillableHours, 0)
    const totalDays = timesheets.length
    
    return {
      timesheets,
      summary: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalBillableHours: Math.round(totalBillableHours * 100) / 100,
        totalDays,
        averageHoursPerDay: totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0
      }
    }
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid employee ID',
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching employee timesheets',
      data: error,
    })
  }
})