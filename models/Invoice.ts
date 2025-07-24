import mongoose, { Schema, Document } from 'mongoose'

export interface IInvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  manualTotal?: boolean
}

export interface IInvoiceTotals {
  subtotal: number
  tax: number
  discount: number
  total: number
}

export interface IInvoiceCompany {
  name: string
  address: string
  tel: string
  email: string
  website?: string
}

export interface IInvoiceCustomer {
  name: string
  address: string
  tel: string
  taxId?: string
}

export interface IInvoicePayment {
  method: string
  terms: string
  dueDate: Date
}

export interface IInvoice extends Document {
  invoiceNumber: string
  date: Date
  dueDate: Date
  company: IInvoiceCompany
  customer: IInvoiceCustomer
  items: IInvoiceItem[]
  totals: IInvoiceTotals
  reference?: string
  payment: IInvoicePayment
  signer?: string
  createdBy: Schema.Types.ObjectId
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const InvoiceItemSchema = new Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  manualTotal: {
    type: Boolean,
    default: false
  }
})

const InvoiceTotalsSchema = new Schema({
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
})

const InvoiceCompanySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  tel: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  }
})

const InvoiceCustomerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  tel: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  }
})

const InvoicePaymentSchema = new Schema({
  method: {
    type: String,
    required: true,
    trim: true
  },
  terms: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  }
})

const InvoiceSchema: Schema = new Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  company: {
    type: InvoiceCompanySchema,
    required: true
  },
  customer: {
    type: InvoiceCustomerSchema,
    required: true
  },
  items: {
    type: [InvoiceItemSchema],
    required: true,
    validate: {
      validator: function(items: IInvoiceItem[]) {
        return items.length > 0
      },
      message: 'Invoice must have at least one item'
    }
  },
  totals: {
    type: InvoiceTotalsSchema,
    required: true
  },
  reference: {
    type: String,
    trim: true
  },
  payment: {
    type: InvoicePaymentSchema,
    required: true
  },
  signer: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
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
InvoiceSchema.index({ invoiceNumber: 1 })
InvoiceSchema.index({ status: 1 })
InvoiceSchema.index({ createdBy: 1 })
InvoiceSchema.index({ date: -1 })
InvoiceSchema.index({ 'customer.name': 'text' })

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema)