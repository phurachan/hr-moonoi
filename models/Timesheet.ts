import mongoose from 'mongoose'

const timesheetSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  employeeName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  tasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    project: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['development', 'meeting', 'training', 'support', 'admin', 'other'],
      default: 'other'
    },
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedAt: {
    type: Date
  },
  approvedDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound index for efficient queries
timesheetSchema.index({ employeeId: 1, date: 1 }, { unique: true })
timesheetSchema.index({ date: 1, status: 1 })

// Pre-save middleware to calculate totals
timesheetSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    this.totalHours = this.tasks.reduce((total, task) => total + (task.duration / 60), 0)
  } else {
    this.totalHours = 0
  }
  next()
})

// Virtual for formatted date
timesheetSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString()
})

// Virtual for total billable hours (assuming all hours are billable for now)
timesheetSchema.virtual('totalBillableHours').get(function() {
  return this.totalHours
})

export default (mongoose.models && mongoose.models.Timesheet) || mongoose.model('Timesheet', timesheetSchema)