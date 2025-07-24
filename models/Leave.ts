import mongoose, { Schema, Document } from 'mongoose'

export interface ILeave extends Document {
  employeeId: string
  employeeName: string
  employeeEmail: string
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'emergency' | 'unpaid'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvedBy?: string
  approverName?: string
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  appliedAt: Date
  documents?: string[] // file paths or URLs
  isHalfDay: boolean
  halfDayPeriod?: 'morning' | 'afternoon'
  emergencyContact?: string
  createdAt: Date
  updatedAt: Date
}

const LeaveSchema: Schema = new Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true,
  },
  employeeName: {
    type: String,
    required: true,
    trim: true,
  },
  employeeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'],
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
    min: 0.5,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    required: true,
  },
  approvedBy: {
    type: String,
    trim: true,
  },
  approverName: {
    type: String,
    trim: true,
  },
  approvedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  documents: [{
    type: String,
    trim: true,
  }],
  isHalfDay: {
    type: Boolean,
    default: false,
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
  },
  emergencyContact: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    },
  },
})

// Add indexes for better performance
LeaveSchema.index({ employeeId: 1 })
LeaveSchema.index({ status: 1 })
LeaveSchema.index({ leaveType: 1 })
LeaveSchema.index({ startDate: 1 })
LeaveSchema.index({ endDate: 1 })
LeaveSchema.index({ appliedAt: -1 })

export default mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema)