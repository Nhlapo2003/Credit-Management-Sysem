const mongoose = require('mongoose');

const CreditRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  amountRequested: {
    type: Number,
    required: true
  },
  documents: [String], // GridFS file IDs
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  score: {
    type: Number,
    default: 0
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  comments: String,
}, { timestamps: true });

module.exports = mongoose.model('CreditRequest', CreditRequestSchema);
