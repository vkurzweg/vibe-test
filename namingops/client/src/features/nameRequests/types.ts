export enum NameRequestStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  CHANGES_REQUESTED = 'Changes Requested',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum NameRequestType {
  PRODUCT = 'Product',
  SERVICE = 'Service',
  FEATURE = 'Feature',
  PROJECT = 'Project',
  TEAM = 'Team',
  OTHER = 'Other'
}

export interface NameRequest {
  _id: string;
  requestedName: string;
  domain: string;
  type: NameRequestType;
  status: NameRequestStatus;
  description: string;
  businessJustification: string;
  targetDate: string;
  isConfidential: boolean;
  attachments: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  comments: Array<{
    _id: string;
    text: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  history: Array<{
    _id: string;
    action: string;
    changedBy: {
      _id: string;
      name: string;
      email: string;
    };
    changes: Record<string, { from: any; to: any }>;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
