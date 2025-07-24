import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  try {
    // First, get the existing timesheet to check ownership
    const existingTimesheet = await Timesheet.findById(id)
    
    if (!existingTimesheet) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Timesheet not found',
      })
    }
    
    // Validate permissions with timesheet ownership
    const { user, isHR, isAdmin } = await validateTimesheetPermission(
      event, 
      'timesheets.update', 
      existingTimesheet.employeeId.toString()
    )
    
    // Check if this is an approval/rejection action
    if (body.status === 'approved' || body.status === 'rejected') {
      // Require approval permission for status changes
      if (!isHR && !isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Only HR and Admin can approve/reject timesheets',
        })
      }
      
      // Set the approvedBy field
      if (body.status === 'approved') {
        body.approvedBy = user._id
        body.approvedDate = new Date()
      }
    }
    // Calculate task durations if tasks are provided
    if (body.tasks) {
      body.tasks = body.tasks.map(task => {
        if (task.startTime && task.endTime) {
          const startTime = new Date(`2000-01-01 ${task.startTime}`)
          const endTime = new Date(`2000-01-01 ${task.endTime}`)
          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
          
          return {
            ...task,
            duration: duration > 0 ? duration : 0
          }
        }
        return task
      })
    }
    
    const timesheet = await Timesheet.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedBy: user._id,
        updatedDate: new Date()
      },
      { new: true, runValidators: true }
    ).populate('employeeId', 'name email department')
      .populate('approvedBy', 'name')
      .populate('updatedBy', 'name')
    
    return timesheet
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid timesheet ID',
      })
    }
    
    if (error.name === 'ValidationError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation error',
        data: error.errors,
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating timesheet',
      data: error,
    })
  }
})