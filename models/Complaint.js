const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Complainant name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    complaintText: {
      type: String,
      required: [true, 'Complaint text is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
        message: 'Status must be PENDING, IN_PROGRESS, RESOLVED, or REJECTED'
      },
      default: 'PENDING'
    },
    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: 'Priority must be LOW, MEDIUM, or HIGH'
      },
      default: 'MEDIUM'
    },
    adminNotes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
