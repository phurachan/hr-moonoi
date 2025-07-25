import mongoose, { Schema, Document } from 'mongoose'

export interface ILeaveBalance extends Document {
  employeeId: string
  employeeName: string
  year: number
  leaveBalances: {
    annual: {
      total: number
      used: number
      remaining: number
    }
    sick: {
      total: number
      used: number
      remaining: number
    }
    personal: {
      total: number
      used: number
      remaining: number
    }
    maternity: {
      total: number
      used: number
      remaining: number
    }
    paternity: {
      total: number
      used: number
      remaining: number
    }
    emergency: {
      total: number
      used: number
      remaining: number
    }
  }
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

const LeaveBalanceSchema: Schema = new Schema({
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
  year: {
    type: Number,
    required: true,
  },
  leaveBalances: {
    annual: {
      total: { type: Number, default: 21, min: 0 }, // Default 21 days annual leave
      used: { type: Number, default: 0, min: 0 },
      remaining: { type: Number, default: 21, min: 0 },
    },
    sick: {
      total: { type: Number, default: 10, min: 0 }, // Default 10 days sick leave
      used: { type: Number, default: 0, min: 0 },
      remaining: { type: Number, default: 10, min: 0 },
    },
    personal: {
      total: { type: Number, default: 5, min: 0 }, // Default 5 days personal leave
      used: { type: Number, default: 0, min: 0 },
      remaining: { type: Number, default: 5, min: 0 },
    },
    maternity: {
      total: { type: Number, default: 90, min: 0 }, // Default 90 days maternity leave
      used: { type: Number, default: 0, min: 0 },
      remaining: { type: Number, default: 90, min: 0 },
    },
    paternity: {
      total: { type: Number, default: 15, min: 0 }, // Default 15 days paternity leave
      used: { type: Number, default: 0, min: 0 },
      remaining: { type: Number, default: 15, min: 0 },
    },
    emergency: {
      total: { type: Number, default: 3, min: 0 }, // Default 3 days emergency leave
      used: { type: Number, default: 0, min: 0 },
      remaining: { type: Number, default: 3, min: 0 },
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
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
LeaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true })
LeaveBalanceSchema.index({ year: 1 })

export default (mongoose.models && mongoose.models.LeaveBalance) || mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema)