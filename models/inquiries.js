const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  requestName: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Declined'], default: 'Pending' },
  declineNotes: { type: String, default: '' },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);