import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    const body = await readBody(event)
    
    // Validate permissions
    const { user, isHR, isAdmin } = await validateTimesheetPermission(event, 'timesheets.create')
    
    // For non-HR users, ensure they can only create their own timesheets
    if (!isHR && !isAdmin && body.employeeId !== user._id.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only create your own timesheets',
      })
    }
    
    // Validate required fields
    if (!body.employeeId || !body.employeeName || !body.date) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Employee ID, employee name, and date are required',
      })
    }
    
    // Check if timesheet already exists for this employee and date
    const existingTimesheet = await Timesheet.findOne({
      employeeId: body.employeeId,
      date: new Date(body.date)
    })
    
    if (existingTimesheet) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Timesheet already exists for this date',
      })
    }
    
    // Calculate task durations
    if (body.tasks) {
      body.tasks = body.tasks.map(task => {
        const startTime = new Date(`2000-01-01 ${task.startTime}`)
        const endTime = new Date(`2000-01-01 ${task.endTime}`)
        const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
        
        return {
          ...task,
          duration: duration > 0 ? duration : 0
        }
      })
    }
    
    const timesheet = new Timesheet({
      ...body,
      date: new Date(body.date),
      createdBy: user._id
    })
    
    await timesheet.save()
    
    return timesheet
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors,
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating timesheet',
      data: error,
    })
  }
})