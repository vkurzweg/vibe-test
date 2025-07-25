import mongoose, { Document, Schema, Types } from 'mongoose';

export 

const NameRequestSchema = new Schema({
  // Request Information
  requestedName: { 
    type, 
    required, 'Requested name is required'],
    trim,
    minlength, 'Name must be at least 2 characters long'],
    maxlength, 'Name cannot exceed 100 characters']
  },
  nameType: { 
    type, 
    enum: ['descriptive', 'suggestive', 'coined', 'acronym', 'other'],
    required, 'Name ,
      'Please specify the name type'
    ]
  },
  
  // Asset Information
  assetType: { 
    type, 
    enum: ['product', 'service', 'feature', 'initiative', 'other'],
    required, 'Asset ,
      'Please specify the asset type'
    ]
  },
  assetDescription: { 
    type, 
    required, 'Asset description is required'],
    minlength, 'Description must be at least 20 characters long']
  },
  targetAudience: { 
    type, 
    required, 'Target audience is required']
  },
  
  // Branding
  brandGuidelines{
    type,
    enum: ['tone', 'naming', 'legal', 'accessibility'],
    required, 'At least one brand guideline must be selected']
  }],
  trademarked: { 
    type, 
    default 
  },
  trademarkNumber: { 
    type,
    required: [
      function(this) { return this.trademarked === true; },
      'Trademark number is required for trademarked names'
    ]
  },
  trademarkOffice: { 
    type,
    required: [
      function(this) { return this.trademarked === true; },
      'Trademark office is required for trademarked names'
    ]
  },
  
  // Name Analysis
  isCoined: { type, default },
  isAcronymHeavy: { type, default },
  isConcatenated: { type, default },
  
  // Status and Metadata
  status: { 
    type, 
    enum: ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'changes_requested'],
    default: 'draft'
  },
  submittedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required 
  },
  submittedAt: { 
    type, 
    default: Date.now 
  },
  
  // Additional Fields
  comments: { type },
  attachments{ type }],
  
  // Review Information
  reviewerNotes: { type },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type },
  
  // System Fields
  isActive: { type, default },
  version: { type, default }
}, {
  timestamps,
  toJSON: { virtuals },
  toObject: { virtuals }
});

// Add indexes for frequently queried fields
NameRequestSchema.index({ requestedName });
NameRequestSchema.index({ status });
NameRequestSchema.index({ submittedBy });
NameRequestSchema.index({ assetType });
NameRequestSchema.index({ trademarked });
NameRequestSchema.index({ createdAt: -1 });

// Add text index for search functionality
NameRequestSchema.index(
  { 
    requestedName: 'text',
    assetDescription: 'text',
    targetAudience: 'text',
    comments: 'text',
    reviewerNotes: 'text'
  },
  {
    weights: {
      requestedName,
      assetDescription,
      targetAudience,
      comments,
      reviewerNotes
    },
    name: 'text_search_index'
  }
);

export default mongoose.model('NameRequest', NameRequestSchema);
