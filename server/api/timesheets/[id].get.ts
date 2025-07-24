import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const id = getRouterParam(event, 'id')
  
  try {
    const timesheet = await Timesheet.findById(id)
      .populate('employeeId', 'name email department')
      .populate('approvedBy', 'name')
    
    if (!timesheet) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Timesheet not found',
      })
    }
    
    // Validate permissions with timesheet ownership
    await validateTimesheetPermission(event, 'timesheets.read', timesheet.employeeId.toString())
    
    return timesheet
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid timesheet ID',
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching timesheet',
      data: error,
    })
  }
})