import mongoose, { Document, Schema } from 'mongoose';

export interface INameRequest extends Document {
  request_title: string;
  requestor_name: string;
  requestor_id: number;
  requestor_email: string;
  business_unit: string;
  asset_type: 'Product' | 'Platform' | 'Feature' | 'Internal Tool' | 'Program' | 'Initiative' | 'Solution' | 'Other';
  asset_type_specify: string;
  asset_description: string;
  proposed_name_1: string;
  proposed_name_2: string;
  monetized: boolean;
  rename: boolean;
  trademarked: boolean;
  trademark_region: string;
  file_attachment: string;
  status: 'New' | 'In Progress' | 'Legal Review' | 'On Hold' | 'Cancelled' | 'Approved';
  reviewer_name: 'JK' | 'VK' | 'JH';
  reviewer_notes: string;
  final_approved_name: string;
  updated_description: string;
  trademark_details: string;
  approval_notes: string;
  approval_date: Date;
  created_at: Date;
  updated_at: Date;
}

const NameRequestSchema: Schema = new Schema({
  request_title: { type: String, required: true },
  requestor_name: { type: String, required: true },
  requestor_id: { type: Number, required: true },
  requestor_email: { type: String, required: true, lowercase: true, trim: true },
  business_unit: { type: String, required: true },
  asset_type: {
    type: String,
    enum: ['Product', 'Platform', 'Feature', 'Internal Tool', 'Program', 'Initiative', 'Solution', 'Other'],
    required: true
  },
  asset_type_specify: { type: String, default: '' },
  asset_description: { type: String, required: true },
  proposed_name_1: { type: String, required: true },
  proposed_name_2: { type: String, default: '' },
  monetized: { type: Boolean, default: false },
  rename: { type: Boolean, default: false },
  trademarked: { type: Boolean, default: false },
  trademark_region: { type: String, default: '' },
  file_attachment: { type: String, default: '' },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Legal Review', 'On Hold', 'Cancelled', 'Approved'],
    default: 'New'
  },
  reviewer_name: {
    type: String,
    enum: ['JK', 'VK', 'JH'],
    required: true
  },
  reviewer_notes: { type: String, default: '' },
  final_approved_name: { type: String, default: '' },
  updated_description: { type: String, default: '' },
  trademark_details: { type: String, default: '' },
  approval_notes: { type: String, default: '' },
  approval_date: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update the updated_at timestamp before saving
NameRequestSchema.pre<INameRequest>('save', function(next) {
  this.updated_at = new Date();
  next();
});

export default mongoose.model<INameRequest>('NameRequest', NameRequestSchema);
