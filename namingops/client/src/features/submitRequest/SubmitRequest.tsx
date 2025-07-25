import React, { useCallback, useMemo } from 'react';
import { Survey, Model } from 'survey-react';
import 'survey-react/modern.min.css';
import { SubmitRequestFormData } from './types';
import { useAuth } from '../../hooks/useAuth';
import { useSubmitNameRequest } from '../../hooks/useNameRequests';
import { toast } from 'react-toastify';

const SubmitRequest: React.FC = () => {
  const { user } = useAuth();
  const { submitRequest, isLoading } = useSubmitNameRequest();

  const surveyJson = useMemo(
    () => ({
      title: 'Submit a New Name Request',
      description: 'Please fill out this form to submit a new name request for review.',
      showProgressBar: 'top',
      showTimerPanel: 'none',
      firstPageIsStarted: true,
      startSurveyText: 'Start New Request',
      pageNextText: 'Continue',
      pagePrevText: 'Back',
      completeText: 'Submit Request',
      showNavigationButtons: 'on',
      pages: [
        {
          name: 'start',
          elements: [
            {
              type: 'html',
              html: '<h3>Welcome to the Name Request Form</h3><p>This form will guide you through the process of submitting a new name request. Please have all necessary information ready before you begin.</p>',
            },
          ],
        },
        {
          name: 'request-details',
          title: 'Request Details',
          elements: [
            {
              name: 'requestedName',
              type: 'text',
              title: 'Requested Name',
              isRequired: true,
              placeHolder: 'Enter the name you are requesting',
              validators: [
                {
                  type: 'text',
                  minLength: 2,
                  maxLength: 100,
                  allowDigits: true,
                },
              ],
            },
            {
              name: 'nameType',
              type: 'radiogroup',
              title: 'Name Type',
              isRequired: true,
              choices: [
                { value: 'descriptive', text: 'Descriptive (clearly describes the product/service)' },
                { value: 'suggestive', text: 'Suggestive (suggests qualities or benefits)' },
                { value: 'coined', text: 'Coined (invented word)' },
                { value: 'acronym', text: 'Acronym' },
                { value: 'other', text: 'Other (please specify)' },
              ],
            },
            {
              name: 'nameTypeOther',
              type: 'text',
              title: 'Please specify name type',
              visibleIf: '{nameType} == "other"',
              isRequired: true,
              requiredIf: '{nameType} == "other"',
            },
          ],
        },
        {
          name: 'asset-information',
          title: 'Asset Information',
          elements: [
            {
              name: 'assetType',
              type: 'dropdown',
              title: 'Type of Asset',
              isRequired: true,
              choices: [
                { value: 'product', text: 'Product' },
                { value: 'service', text: 'Service' },
                { value: 'feature', text: 'Feature' },
                { value: 'initiative', text: 'Initiative' },
                { value: 'other', text: 'Other' },
              ],
            },
            {
              name: 'assetTypeOther',
              type: 'text',
              title: 'Please specify asset type',
              visibleIf: '{assetType} == "other"',
              isRequired: true,
              requiredIf: '{assetType} == "other"',
            },
            {
              name: 'assetDescription',
              type: 'comment',
              title: 'Asset Description',
              isRequired: true,
              placeHolder: 'Please provide a detailed description of the asset',
              validators: [
                {
                  type: 'text',
                  minLength: 20,
                  maxLength: 2000,
                },
              ],
            },
            {
              name: 'targetAudience',
              type: 'comment',
              title: 'Target Audience',
              isRequired: true,
              placeHolder: 'Describe the primary audience for this asset',
            },
          ],
        },
        {
          name: 'branding',
          title: 'Branding Information',
          elements: [
            {
              name: 'brandGuidelines',
              type: 'checkbox',
              title: 'Brand Guidelines',
              description: 'Please confirm the following brand guidelines have been considered:',
              isRequired: true,
              validators: [
                {
                  type: 'answercount',
                  text: 'Please select at least one option',
                  minCount: 1,
                },
              ],
              choices: [
                { value: 'tone', text: 'Tone of voice guidelines' },
                { value: 'naming', text: 'Naming conventions' },
                { value: 'legal', text: 'Legal requirements' },
                { value: 'accessibility', text: 'Accessibility standards' },
              ],
            },
            {
              name: 'trademarked',
              type: 'boolean',
              title: 'Is this name already trademarked?',
              isRequired: true,
              labelTrue: 'Yes',
              labelFalse: 'No',
            },
            {
              name: 'trademarkNumber',
              type: 'text',
              title: 'Trademark Registration Number',
              visibleIf: '{trademarked} = true',
              isRequired: true,
              requiredIf: '{trademarked} = true',
            },
            {
              name: 'trademarkOffice',
              type: 'text',
              title: 'Trademark Office',
              visibleIf: '{trademarked} = true',
              isRequired: true,
              requiredIf: '{trademarked} = true',
            },
          ],
        },
        {
          name: 'name-analysis',
          title: 'Name Analysis',
          elements: [
            {
              name: 'isCoined',
              type: 'boolean',
              title: 'Is this a coined/made-up word?',
              isRequired: true,
            },
            {
              name: 'isAcronymHeavy',
              type: 'boolean',
              title: 'Does this name contain multiple acronyms or abbreviations?',
              isRequired: true,
            },
            {
              name: 'isConcatenated',
              type: 'boolean',
              title: 'Is this a concatenated name (e.g., Microsoft, Facebook)?',
              isRequired: true,
            },
          ],
        },
      ],
      completedHtml: `
        <div class="text-center">
          <h3>Thank you for your submission!</h3>
          <p>Your name request has been received and is under review. You will receive a confirmation email shortly.</p>
          <p>Request ID: <strong>{requestId}</strong></p>
          <p>You can check the status of your request in the dashboard.</p>
        </div>
      `,
    }),
    []
  );

  const survey = useMemo(() => new Model(surveyJson), [surveyJson]););

  const handleComplete = useCallback(
    async (sender: any) => {
      try {
        const formData: SubmitRequestFormData = {
          ...sender.data,
          submittedBy: user?.id || '',
          status: 'submitted',
          submittedAt: new Date().toISOString(),
        };

        // Submit the form data to the API
        await submitRequest(formData);
        
        // Show success message
        toast.success('Name request submitted successfully!');
        
        // Show completion page with request ID
        sender.showCompletedPage();
      } catch (error) {
        console.error('Error submitting name request:', error);
        toast.error('Failed to submit name request. Please try again.');
      }
    },
    [submitRequest, user?.id]
  );

  // Add validation for the requested name
  survey.onValidateQuestion.add((sender, options) => {
    if (options.name === 'requestedName') {
      const value = options.value?.toLowerCase() || '';
      
      // Check for common issues
      if (value.length < 2) {
        options.error = 'Name is too short';
      } else if (value.length > 100) {
        options.error = 'Name is too long (max 100 characters)';
      } else if (/\d{3,}/.test(value)) {
        options.error = 'Avoid using multiple numbers in a row';
      } else if (/[^\w\s-]/.test(value)) {
        options.error = 'Avoid using special characters';
      }
    }
  });

  // Add custom CSS for the survey
  survey.css = {
    ...survey.css,
    root: 'sv_main sv_bootstrap_css survey',
    header: 'card-header bg-primary text-white',
    body: 'card-body',
    footer: 'card-footer d-flex justify-content-between',
    navigationButton: 'btn btn-primary',
    navigationButtonPrev: 'btn btn-outline-secondary',
    completeButton: 'btn btn-success',
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title mb-4">Submit a New Name Request</h2>
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Please fill out all required fields. For assistance, refer to the{' '}
                <a href="/brand-guidelines" target="_blank" rel="noopener noreferrer">
                  Brand Guidelines
                </a>
                .
              </div>
              <Survey model={survey} onComplete={handleComplete} />
              {isLoading && (
                <div className="text-center mt-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Submitting...</span>
                  </div>
                  <p className="mt-2">Submitting your request...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitRequest;
