import mongoose, { Schema, Document } from 'mongoose'

export interface ICustomer extends Document {
  name: string
  address: string
  tel: string
  taxId?: string
  email?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  tel: {
    type: String,
    required: true,
    trim: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: true,
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
CustomerSchema.index({ name: 1 })
CustomerSchema.index({ status: 1 })
CustomerSchema.index({ 
  name: 'text', 
  address: 'text'
})

export default (mongoose.models && mongoose.models.Customer) || mongoose.model<ICustomer>('Customer', CustomerSchema)