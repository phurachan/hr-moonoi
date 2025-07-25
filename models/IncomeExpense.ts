import mongoose, { Schema, Document } from 'mongoose'

export interface IIncomeExpense extends Document {
  date: Date
  description: string
  amount: number
  type: 'income' | 'expense'
  category: 'normal' | 'od'
  note?: string
  createdBy: Schema.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const IncomeExpenseSchema: Schema = new Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    enum: ['normal', 'od'],
    required: true
  },
  note: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString()
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Add indexes for better performance
IncomeExpenseSchema.index({ date: -1 })
IncomeExpenseSchema.index({ type: 1 })
IncomeExpenseSchema.index({ category: 1 })
IncomeExpenseSchema.index({ createdBy: 1 })
IncomeExpenseSchema.index({ type: 1, date: -1 })

export default (mongoose.models && mongoose.models.IncomeExpense) || mongoose.model<IIncomeExpense>('IncomeExpense', IncomeExpenseSchema)