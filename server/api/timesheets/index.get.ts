import { connectMongoDB } from '~/lib/mongodb'
import Timesheet from '~/models/Timesheet'
import { validateTimesheetPermission } from '~/server/utils/timesheetPermissions'

export default defineEventHandler(async (event) => {
  await connectMongoDB()
  
  try {
    // Validate permissions
    const { user, isHR, isAdmin } = await validateTimesheetPermission(event, 'timesheets.read')
    
    const query = getQuery(event)
    const { employeeId, startDate, endDate, status, page = 1, limit = 10 } = query
    
    // Build filter object
    const filter: any = {}
    
    // For non-HR users, only show their own timesheets
    if (!isHR && !isAdmin) {
      filter.employeeId = user._id
    }
    
    if (employeeId) {
      filter.employeeId = employeeId
    }
    
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
    
    const skip = (Number(page) - 1) * Number(limit)
    
    const timesheets = await Timesheet.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('employeeId', 'name email')
      .populate('approvedBy', 'name')
    
    const total = await Timesheet.countDocuments(filter)
    
    return {
      timesheets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching timesheets',
      data: error,
    })
  }
})