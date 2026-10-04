const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      trim: true,
      default: 'General Inquiry'
    },
    message: {
      type: String,
      required: [true, 'Inquiry message is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['NEW', 'READ', 'CONTACTED', 'ARCHIVED'],
        message: 'Status must be NEW, READ, CONTACTED, or ARCHIVED'
      },
      default: 'NEW'
    }
  },
  {
    timestamps: true
  }
);

contactInquirySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const ContactInquiry = mongoose.model('ContactInquiry', contactInquirySchema);

module.exports = ContactInquiry;
