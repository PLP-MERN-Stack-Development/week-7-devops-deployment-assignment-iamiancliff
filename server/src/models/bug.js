const mongoose = require('mongoose');

/**
 * Bug Model Schema
 * Defines the structure and validation for bug documents
 */
const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  severity: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: 'Severity must be Low, Medium, High, or Critical'
    },
    default: 'Medium'
  },
  status: {
    type: String,
    enum: {
      values: ['Open', 'In Progress', 'Resolved', 'Closed'],
      message: 'Status must be Open, In Progress, Resolved, or Closed'
    },
    default: 'Open'
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Urgent'],
      message: 'Priority must be Low, Medium, High, or Urgent'
    },
    default: 'Medium'
  },
  assignedTo: {
    type: String,
    trim: true,
    default: 'Unassigned'
  },
  reportedBy: {
    type: String,
    required: [true, 'Reporter name is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bugSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
bugSchema.index({ status: 1, severity: 1 });
bugSchema.index({ createdAt: -1 });

module.exports = mongoose.model('bug', bugSchema);