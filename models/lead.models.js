const mongoose = require('mongoose');

// Lead Schema
const leadSchema = new mongoose.Schema(
  {
  name: {
    type: String,
    required: [true, 'Lead name is required'],
  },
  source: {
    type: String,
    required: [true, 'Lead source is required'],
    enum: ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Email', 'Other'],  // Predefined lead sources
  },
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalesAgent',  // Reference to SalesAgent model
    required: [true, 'Sales Agent is required'],
  },
  status: {
    type: String,
    required: true,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'],  // Predefined lead statuses
    default: 'New', 
  },
  tags: {
    type: [String],  // Array of strings for tags (e.g., High Value, Follow-up)
  },
  timeToClose: {
    type: Number,
    required: [true, 'Time to Close is required'],
    min: [1, 'Time to Close must be a positive number'],  // Positive integer validation
  },
  priority: {
    type: String,
    required: true,
    enum: ['High', 'Medium', 'Low'],  // Predefined priority levels
    default: 'Medium',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,  // The date when the lead was closed (optional, used when status is "Closed")
  },
},
{ strictQuery: 'throw' });

// Middleware to update `updatedAt` and `closedAt` on each save
leadSchema.pre('save', function () {
  this.updatedAt = Date.now();
  if (this.status === 'Closed' && !this.closedAt) {
    this.closedAt = Date.now();
  } else if (this.status !== 'Closed') {
    this.closedAt = undefined;
  }
});

// Middleware to handle `closedAt` on findOneAndUpdate(findByIdAndUpdate)

leadSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  const status = update.status || (update.$set && update.$set.status);
  this.set({updatedAt:Date.now()});
if (status==='Closed') {
  if (!update.closedAt && !(update.$set && update.$set.closedAt)) {
    this.set({closedAt:Date.now()});
  }
  this.closedAt = Date.now();
} else if (status && status !== 'Closed') {
  this.set({closedAt:null});
  }
  } 
);

module.exports = mongoose.model('Lead', leadSchema);