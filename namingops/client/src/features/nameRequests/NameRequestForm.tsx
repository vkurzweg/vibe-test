import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Grid, 
  TextField, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText, 
  Paper, 
  Chip, 
  IconButton, 
  CircularProgress,
  useTheme,
  FormControlLabel,
  Switch,
  FormGroup,
  FormLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../app/store';
import { 
  createNameRequest, 
  updateNameRequest, 
  fetchNameRequestById,
  clearCurrentRequest 
} from './nameRequestSlice';
import { NameRequest, NameRequestStatus, NameRequestType } from './types';

const validationSchema = Yup.object({
  requestedName: Yup.string()
    .required('Name is required')
    .max(100, 'Name must be at most 100 characters'),
  domain: Yup.string()
    .required('Domain is required')
    .matches(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, 
      'Invalid domain format'
    ),
  type: Yup.string()
    .required('Type is required')
    .oneOf(Object.values(NameRequestType), 'Invalid type'),
  description: Yup.string()
    .required('Description is required')
    .max(1000, 'Description must be at most 1000 characters'),
  businessJustification: Yup.string()
    .required('Business justification is required')
    .max(1000, 'Business justification must be at most 1000 characters'),
  technicalDetails: Yup.string()
    .max(1000, 'Technical details must be at most 1000 characters'),
  complianceNotes: Yup.string()
    .max(1000, 'Compliance notes must be at most 1000 characters'),
  isConfidential: Yup.boolean(),
  targetDate: Yup.date()
    .min(new Date(), 'Target date must be in the future')
    .required('Target date is required'),
  // Add validation for other fields as needed
});

interface NameRequestFormProps {
  editMode?: boolean;
}

const NameRequestForm: React.FC<NameRequestFormProps> = ({ editMode = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  
  const { currentRequest, loading, error } = useSelector((state: RootState) => ({
    currentRequest: state.nameRequests.currentRequest,
    loading: state.nameRequests.loading,
    error: state.nameRequests.error
  }));

  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<{name: string, url: string}[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load request data if in edit mode
  useEffect(() => {
    if (editMode && id) {
      dispatch(fetchNameRequestById(id));
    }
    
    return () => {
      if (editMode) {
        dispatch(clearCurrentRequest());
      }
    };
  }, [dispatch, editMode, id]);

  // Initialize form with existing data in edit mode
  useEffect(() => {
    if (editMode && currentRequest) {
      setExistingAttachments(currentRequest.attachments || []);
      
      // Set form values from currentRequest
      formik.setValues({
        requestedName: currentRequest.requestedName || '',
        domain: currentRequest.domain || '',
        type: currentRequest.type || NameRequestType.WEBSITE,
        description: currentRequest.description || '',
        businessJustification: currentRequest.businessJustification || '',
        technicalDetails: currentRequest.technicalDetails || '',
        complianceNotes: currentRequest.complianceNotes || '',
        isConfidential: currentRequest.isConfidential || false,
        targetDate: currentRequest.targetDate 
          ? new Date(currentRequest.targetDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        // Set other fields as needed
      });
    }
  }, [currentRequest, editMode]);

  const formik = useFormik({
    initialValues: {
      requestedName: '',
      domain: '',
      type: NameRequestType.WEBSITE,
      description: '',
      businessJustification: '',
      technicalDetails: '',
      complianceNotes: '',
      isConfidential: false,
      targetDate: new Date().toISOString().split('T')[0],
      // Add other initial values as needed
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      
      try {
        const formData = new FormData();
        
        // Append all form fields to formData
        Object.entries(values).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });
        
        // Append attachments
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });
        
        // Append removed attachments if in edit mode
        if (editMode && removedAttachments.length > 0) {
          formData.append('removedAttachments', JSON.stringify(removedAttachments));
        }
        
        if (editMode && id) {
          await dispatch(updateNameRequest({ id, formData }));
        } else {
          await dispatch(createNameRequest(formData));
        }
        
        // Redirect to the request details page or dashboard
        navigate(editMode ? `/requests/${id}` : '/');
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setAttachments([...attachments, ...newFiles]);
      
      // Create previews for images
      const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
        setAttachmentPreviews([...attachmentPreviews, ...newPreviews]);
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    
    // Also remove from previews if it was an image
    if (index < attachmentPreviews.length) {
      const newPreviews = [...attachmentPreviews];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      setAttachmentPreviews(newPreviews);
    }
  };

  const handleRemoveExistingAttachment = (index: number, fileName: string) => {
    const newAttachments = [...existingAttachments];
    newAttachments.splice(index, 1);
    setExistingAttachments(newAttachments);
    setRemovedAttachments([...removedAttachments, fileName]);
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to discard your changes?')) {
      navigate(-1);
    }
  };

  if (loading && editMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && editMode) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {editMode ? 'Edit Name Request' : 'New Name Request'}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Request Details" 
                subheader="Fill in the basic information about your name request"
              />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="requestedName"
                      name="requestedName"
                      label="Requested Name"
                      value={formik.values.requestedName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.requestedName && Boolean(formik.errors.requestedName)}
                      helperText={formik.touched.requestedName && formik.errors.requestedName}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="domain"
                      name="domain"
                      label="Domain"
                      value={formik.values.domain}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.domain && Boolean(formik.errors.domain)}
                      helperText={
                        formik.touched.domain && formik.errors.domain 
                          ? formik.errors.domain 
                          : 'e.g., example.com'
                      }
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography>https://</Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      error={formik.touched.type && Boolean(formik.errors.type)}
                    >
                      <InputLabel id="type-label">Type *</InputLabel>
                      <Select
                        labelId="type-label"
                        id="type"
                        name="type"
                        value={formik.values.type}
                        label="Type *"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        {Object.values(NameRequestType).map((type) => (
                          <MenuItem key={type} value={type}>
                            {type.split('_').map(word => 
                              word.charAt(0) + word.slice(1).toLowerCase()
                            ).join(' ')}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.type && formik.errors.type && (
                        <FormHelperText>{formik.errors.type}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="targetDate"
                      name="targetDate"
                      label="Target Date"
                      type="date"
                      value={formik.values.targetDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.targetDate && Boolean(formik.errors.targetDate)}
                      helperText={formik.touched.targetDate && formik.errors.targetDate}
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      multiline
                      rows={3}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={
                        formik.touched.description && formik.errors.description
                          ? formik.errors.description
                          : 'Provide a clear description of the purpose of this name'
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="businessJustification"
                      name="businessJustification"
                      label="Business Justification"
                      multiline
                      rows={3}
                      value={formik.values.businessJustification}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.businessJustification && 
                        Boolean(formik.errors.businessJustification)
                      }
                      helperText={
                        formik.touched.businessJustification && formik.errors.businessJustification
                          ? formik.errors.businessJustification
                          : 'Explain why this name is needed and how it aligns with business goals'
                      }
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="technicalDetails"
                      name="technicalDetails"
                      label="Technical Details"
                      multiline
                      rows={3}
                      value={formik.values.technicalDetails}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.technicalDetails && 
                        Boolean(formik.errors.technicalDetails)
                      }
                      helperText={
                        formik.touched.technicalDetails && formik.errors.technicalDetails
                          ? formik.errors.technicalDetails
                          : 'Provide any technical details or requirements (optional)'
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Attachments Section */}
            <Card sx={{ mb: 3 }}>
              <CardHeader 
                title="Attachments" 
                subheader="Add any supporting documents or images"
              />
              <Divider />
              <CardContent>
                {/* Existing Attachments */}
                {existingAttachments.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Attachments
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {existingAttachments.map((file, index) => (
                        <Chip
                          key={index}
                          icon={<AttachFileIcon />}
                          label={file.name}
                          onDelete={() => handleRemoveExistingAttachment(index, file.name)}
                          variant="outlined"
                          sx={{ 
                            maxWidth: 200,
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            },
                          }}
                          onClick={() => window.open(file.url, '_blank')}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* New Attachments */}
                <Box>
                  <input
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Add Files
                    </Button>
                  </label>
                  
                  {attachments.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        New Files to Upload
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {attachments.map((file, index) => (
                          <Chip
                            key={index}
                            icon={<AttachFileIcon />}
                            label={file.name}
                            onDelete={() => handleRemoveAttachment(index)}
                            variant="outlined"
                            sx={{ 
                              maxWidth: 200,
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {attachmentPreviews.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" gutterBottom>
                        Image Previews
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={2}>
                        {attachmentPreviews.map((preview, index) => (
                          <Box 
                            key={index} 
                            position="relative"
                            sx={{ 
                              width: 150, 
                              height: 150,
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Box
                              component="img"
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveAttachment(index)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Status & Actions Card */}
            <Card sx={{ mb: 3 }}>
              <CardHeader title="Status & Actions" />
              <Divider />
              <CardContent>
                {editMode && currentRequest && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Current Status
                    </Typography>
                    <Chip 
                      label={currentRequest.status}
                      color={
                        currentRequest.status === NameRequestStatus.APPROVED
                          ? 'success'
                          : currentRequest.status === NameRequestStatus.REJECTED
                          ? 'error'
                          : 'default'
                      }
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                    
                    {currentRequest.reviewer && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Assigned Reviewer
                        </Typography>
                        <Box display="flex" alignItems="center">
                          <Avatar 
                            src={currentRequest.reviewer.avatar}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          >
                            {currentRequest.reviewer.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {currentRequest.reviewer.name}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                <Box mb={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.isConfidential}
                        onChange={formik.handleChange}
                        name="isConfidential"
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <Typography>Mark as Confidential</Typography>
                        <Tooltip title="Confidential requests will have restricted visibility">
                          <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                        </Tooltip>
                      </Box>
                    }
                  />
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={isSubmitting || !formik.isValid || !formik.dirty}
                  >
                    {editMode ? 'Update Request' : 'Submit Request'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    fullWidth
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  
                  {editMode && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      fullWidth
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this request?')) {
                          // Handle delete
                          // dispatch(deleteNameRequest(id));
                          // navigate('/');
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      Delete Request
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Help & Guidelines Card */}
            <Card>
              <CardHeader title="Naming Guidelines" />
              <Divider />
              <CardContent>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Please follow these guidelines when submitting a name request:
                </Typography>
                <Box component="ul" pl={2} mb={2}>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      Use clear, descriptive names that reflect the purpose
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      Avoid abbreviations unless they are widely recognized
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      Follow the company's naming conventions
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" color="textSecondary">
                      Check for existing names to avoid duplication
                    </Typography>
                  </li>
                </Box>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={() => window.open('/help/naming-guidelines', '_blank')}
                >
                  View Full Guidelines
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default NameRequestForm;
