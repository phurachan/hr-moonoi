import mongoose, { Schema, Document } from 'mongoose'

export interface IEmployee extends Document {
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
  status: 'active' | 'inactive' | 'terminated'
  address: string
  birthDate: string
  emergencyContact: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const EmployeeSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  hireDate: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated'],
    default: 'active',
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  birthDate: {
    type: String,
    required: true,
  },
  emergencyContact: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
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
EmployeeSchema.index({ email: 1 })
EmployeeSchema.index({ department: 1 })
EmployeeSchema.index({ status: 1 })
EmployeeSchema.index({ 
  name: 'text', 
  email: 'text', 
  position: 'text', 
  department: 'text' 
})

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema)