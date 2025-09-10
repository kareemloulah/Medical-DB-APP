import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  age: {
    type: Number,
    required: [true, 'Patient age is required'],
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot exceed 120']
  },
  diagnosis: {
    type: String,
    required: [true, 'Diagnosis is required'],
    trim: true,
    minlength: [5, 'Diagnosis must be at least 10 characters long'],
    maxlength: [2000, 'Diagnosis cannot exceed 2000 characters']
  },
  operation: {
    type: String,
    required: [true, 'Operation is required'],
    trim: true,
    minlength: [5, 'Operation must be at least 10 characters long'],
    maxlength: [2000, 'Operation cannot exceed 2000 characters']
  },
  details: {
    type: String,
    required: [true, 'Details is required'],
    trim: true,
    minlength: [5, 'Details must be at least 10 characters long'],
    maxlength: [2000, 'Details cannot exceed 2000 characters']
  },
  picture: {
    type: String, // Store file path or URL
    default: null
  },
  relatives: [{
    type: String,
    trim: true,
    validate: {
      validator: function(phone) {
        // Basic phone validation - accepts various formats
        return /^[+]?[1-9]?[0-9]{7,15}$/.test(phone.replace(/[\s\-()]/g, ''));
      },
      message: 'Please provide a valid phone number'
    }
  }]
}, {
  timestamps: true
});

// Add search index for better performance
patientSchema.index({ name: 'text', diagnosis: 'text', operation: 'text' });

// Add compound index for common queries
patientSchema.index({ name: 1, age: 1 });

// Virtual for patient ID display
patientSchema.virtual('displayId').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised
patientSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

// Pre-save middleware to format phone numbers
patientSchema.pre('save', function(next) {
  if (this.relatives && this.relatives.length > 0) {
    this.relatives = this.relatives.map(phone => {
      // Remove extra spaces and format consistently
      return phone.replace(/\s+/g, ' ').trim();
    });
  }
  next();
});

export default mongoose.model('Patient', patientSchema);