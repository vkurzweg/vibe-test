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

export ;
  assignedTo?: {
    _id;
    name;
    email;
  };
  comments: Array<{
    _id;
    text;
    createdBy: {
      _id;
      name;
      email;
    };
    createdAt;
    updatedAt;
  }>;
  history: Array<{
    _id;
    action;
    changedBy: {
      _id;
      name;
      email;
    };
    changes: Record<string, { from; to }>;
    timestamp;
  }>;
  createdAt;
  updatedAt;
}
