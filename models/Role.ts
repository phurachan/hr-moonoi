import mongoose, { Schema, Document } from 'mongoose'

export interface IRole extends Document {
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const RoleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  permissions: [{
    type: String,
    required: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
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
RoleSchema.index({ name: 1 })
RoleSchema.index({ isActive: 1 })
RoleSchema.index({ createdAt: -1 })

export default (mongoose.models && mongoose.models.Role) || mongoose.model<IRole>('Role', RoleSchema)