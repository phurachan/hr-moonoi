import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  const id = getRouterParam(event, 'id')
  
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
    await validateTimesheetPermission(
      event, 
      'timesheets.delete', 
      existingTimesheet.employeeId.toString()
    )
    
    // Delete the timesheet
    const timesheet = await Timesheet.findByIdAndDelete(id)
    
    return { message: 'Timesheet deleted successfully', timesheet }
  } catch (error: any) {
    if (error.name === 'CastError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid timesheet ID',
      })
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error deleting timesheet',
      data: error,
    })
  }
})