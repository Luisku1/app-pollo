import mongoose from 'mongoose'

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: { // opcional: nombre legible
    type: String,
    trim: true
  },
  rank: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    index: true
  },
  permissions: {
    type: [String],
    default: [],
    validate: {
      validator: arr => Array.isArray(arr) && arr.every(p => typeof p === 'string'),
      message: 'permissions debe ser arreglo de strings'
    }
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  }
}, {
  timestamps: true
})

// Índice compuesto útil para queries por actividad y rango
roleSchema.index({ active: 1, rank: 1 })

// Normaliza permissions a lowercase sin espacios extra
roleSchema.pre('save', function (next) {
  if (this.permissions?.length) {
    this.permissions = [...new Set(this.permissions.map(p => p.trim().toLowerCase()))]
  }
  next()
})

const Role = mongoose.model('Role', roleSchema)
export default Role