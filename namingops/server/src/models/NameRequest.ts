import mongoose, { Document, Schema, Types } from 'mongoose';

export type NameType = 'descriptive' | 'suggestive' | 'coined' | 'acronym' | 'other';
export type AssetType = 'product' | 'service' | 'feature' | 'initiative' | 'other';
export type RequestStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'changes_requested';

export interface INameRequest extends Document {
  // Request Information
  requestedName: string;
  nameType: NameType;
  nameTypeOther?: string;
  
  // Asset Information
  assetType: AssetType;
  assetTypeOther?: string;
  assetDescription: string;
  targetAudience: string;
  
  // Branding
  brandGuidelines: string[];
  trademarked: boolean;
  trademarkNumber?: string;
  trademarkOffice?: string;
  
  // Name Analysis
  isCoined: boolean;
  isAcronymHeavy: boolean;
  isConcatenated: boolean;
  
  // Status and Metadata
  status: RequestStatus;
  submittedBy: Types.ObjectId;
  submittedAt: Date;
  updatedAt: Date;
  
  // Additional Fields
  comments?: string;
  attachments?: string[];
  
  // Review Information
  reviewerNotes?: string;
  reviewerId?: Types.ObjectId;
  reviewedAt?: Date;
  
  // System Fields
  isActive: boolean;
  version: number;
}

const NameRequestSchema: Schema = new Schema({
  // Request Information
  requestedName: { 
    type: String, 
    required: [true, 'Requested name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  nameType: { 
    type: String, 
    enum: ['descriptive', 'suggestive', 'coined', 'acronym', 'other'],
    required: [true, 'Name type is required']
  },
  nameTypeOther: { 
    type: String,
    required: [
      function(this: INameRequest) { return this.nameType === 'other'; },
      'Please specify the name type'
    ]
  },
  
  // Asset Information
  assetType: { 
    type: String, 
    enum: ['product', 'service', 'feature', 'initiative', 'other'],
    required: [true, 'Asset type is required']
  },
  assetTypeOther: { 
    type: String,
    required: [
      function(this: INameRequest) { return this.assetType === 'other'; },
      'Please specify the asset type'
    ]
  },
  assetDescription: { 
    type: String, 
    required: [true, 'Asset description is required'],
    minlength: [20, 'Description must be at least 20 characters long']
  },
  targetAudience: { 
    type: String, 
    required: [true, 'Target audience is required']
  },
  
  // Branding
  brandGuidelines: [{
    type: String,
    enum: ['tone', 'naming', 'legal', 'accessibility'],
    required: [true, 'At least one brand guideline must be selected']
  }],
  trademarked: { 
    type: Boolean, 
    default: false 
  },
  trademarkNumber: { 
    type: String,
    required: [
      function(this: INameRequest) { return this.trademarked === true; },
      'Trademark number is required for trademarked names'
    ]
  },
  trademarkOffice: { 
    type: String,
    required: [
      function(this: INameRequest) { return this.trademarked === true; },
      'Trademark office is required for trademarked names'
    ]
  },
  
  // Name Analysis
  isCoined: { type: Boolean, default: false },
  isAcronymHeavy: { type: Boolean, default: false },
  isConcatenated: { type: Boolean, default: false },
  
  // Status and Metadata
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'in_review', 'approved', 'rejected', 'changes_requested'],
    default: 'draft'
  },
  submittedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Additional Fields
  comments: { type: String },
  attachments: [{ type: String }],
  
  // Review Information
  reviewerNotes: { type: String },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  
  // System Fields
  isActive: { type: Boolean, default: true },
  version: { type: Number, default: 1 }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for frequently queried fields
NameRequestSchema.index({ requestedName: 1 });
NameRequestSchema.index({ status: 1 });
NameRequestSchema.index({ submittedBy: 1 });
NameRequestSchema.index({ assetType: 1 });
NameRequestSchema.index({ trademarked: 1 });
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
      requestedName: 10,
      assetDescription: 5,
      targetAudience: 3,
      comments: 2,
      reviewerNotes: 1
    },
    name: 'text_search_index'
  }
);

export default mongoose.model<INameRequest>('NameRequest', NameRequestSchema);
