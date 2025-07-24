import mongoose, { Schema, Document } from 'mongoose'

export interface IPermission extends Document {
  name: string
  description: string
  module: string
  action: string
  resource: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PermissionSchema: Schema = new Schema({
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
  module: {
    type: String,
    required: true,
    trim: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'access', 'hr_view', 'approve', 'reject', 'balance_manage', 'export', 'submit', 'reports'],
  },
  resource: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
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
PermissionSchema.index({ name: 1 })
PermissionSchema.index({ module: 1 })
PermissionSchema.index({ action: 1 })
PermissionSchema.index({ resource: 1 })
PermissionSchema.index({ isActive: 1 })

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema)