import { Model } from 'survey-core';

export interface SubmitRequestFormData {
  // Request Details
  requestedName: string;
  nameType: 'descriptive' | 'suggestive' | 'coined' | 'acronym' | 'other';
  nameTypeOther?: string;
  
  // Asset Information
  assetType: 'product' | 'service' | 'feature' | 'initiative' | 'other';
  assetTypeOther?: string;
  assetDescription: string;
  targetAudience: string;
  
  // Branding
  brandGuidelines: string[];
  trademarked: boolean;
  trademarkNumber?: string;
  trademarkOffice?: string;
  
  // Additional Information
  isCoined: boolean;
  isAcronymHeavy: boolean;
  isConcatenated: boolean;
  
  // Internal Use
  submittedBy: string;
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';
}

export interface SubmitRequestProps {
  onSubmit: (data: SubmitRequestFormData) => Promise<void>;
  onCancel: () => void;
}

export interface SurveyModel extends Model {
  showCompletedPage: () => void;
  showPreviewBeforeComplete: string;
  showPreview: () => void;
  showErrorOnNext: boolean;
  showNavigationButtons: string;
  completeText: string;
  previewText: string;
  editText: string;
  startSurveyText: string;
  firstPageIsStarted: boolean;
  showStartButton: boolean;
  startSurveyText: string;
  completeText: string;
  previewText: string;
  editText: string;
  pagePrevText: string;
  pageNextText: string;
  completeHtml: string;
  completedHtml: string;
  showProgressBar: string;
  showTimerPanel: string;
  maxTimeToFinish: number;
  maxTimeToFinishPage: number;
  showTimerPanelMode: string;
  firstPageIsStarted: boolean;
  startSurveyText: string;
  pageNextText: string;
  pagePrevText: string;
  completeText: string;
  previewText: string;
  editText: string;
  width: string;
}
