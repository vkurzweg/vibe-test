import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, Typography, Button, Paper, Divider, Chip, Avatar, 
  Grid, Card, CardContent, CardHeader, IconButton, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  CircularProgress, useTheme, Tooltip, List, ListItem, ListItemIcon,
  ListItemText, Tabs, Tab, TextField
} from '@mui/material';
import {
  ArrowBack, Edit, Delete, FileCopy, CheckCircle, Cancel,
  Pending, AttachFile, Visibility, Comment, History, Person,
  Email, Event, AccessTime, Info, Lock, HelpOutline
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../../app/store';
import { 
  fetchNameRequestById, deleteNameRequest, approveNameRequest,
  rejectNameRequest, requestChangesNameRequest, clearCurrentRequest
} from './nameRequestSlice';
import { NameRequest, NameRequestStatus, NameRequestType } from './types';
import { format } from 'date-fns';
import { differenceInDays } from 'date-fns';

// Helper Components
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `request-tab-${index}`,
    'aria-controls': `request-tabpanel-${index}`,
  };
}

const NameRequestDetails: React.FC = () => {
  const { id } = useParams<{ id }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { currentRequest, loading, error } = useSelector((state) => ({
    currentRequest: state.nameRequests.currentRequest,
    loading: state.nameRequests.loading,
    error: state.nameRequests.error
  }));

  const { user } = useSelector((state) => ({
    user: state.auth.user
  }));

  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [changesDialogOpen, setChangesDialogOpen] = useState(false);
  const [changesRequested, setChangesRequested] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Fetch request data
  useEffect(() => {
    if (id) {
      dispatch(fetchNameRequestById(id));
    }
    return () => {
      dispatch(clearCurrentRequest());
    };
  }, [dispatch, id]);

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case NameRequestStatus.APPROVED: return 'success';
      case NameRequestStatus.REJECTED: return 'error';
      case NameRequestStatus.PENDING: return 'warning';
      case NameRequestStatus.CHANGES_REQUESTED: return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case NameRequestStatus.APPROVED: return <CheckCircle />;
      case NameRequestStatus.REJECTED: return <Cancel />;
      case NameRequestStatus.PENDING: return <Pending />;
      case NameRequestStatus.CHANGES_REQUESTED: return <Info />;
      default: return null;
    }
  };

  // Action handlers
  const handleDelete = () => setDeleteDialogOpen(true);
  const handleApprove = () => setApproveDialogOpen(true);
  const handleReject = () => setRejectDialogOpen(true);
  const handleRequestChanges = () => setChangesDialogOpen(true);
  const handleEdit = () => navigate(`/requests/${id}/edit`);
  const handleCopy = (text) => navigator.clipboard.writeText(text);

  // Dialog confirm handlers
  const confirmDelete = () => {
    if (id) {
      dispatch(deleteNameRequest(id));
      navigate('/');
    }
  };

  const confirmApprove = () => {
    if (id) {
      dispatch(approveNameRequest({ id, notes }));
      setApproveDialogOpen(false);
    }
  };

  const confirmReject = () => {
    if (id) {
      dispatch(rejectNameRequest({ id, reason }));
      setRejectDialogOpen(false);
    }
  };

  const confirmRequestChanges = () => {
    if (id) {
      dispatch(requestChangesNameRequest({ id, changesRequested }));
      setChangesDialogOpen(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error || !currentRequest) return <div>Error || 'Request not found'}</div>;

  const { 
    requestedName, domain, type, description, businessJustification,
    technicalDetails, complianceNotes, status, isConfidential,
    targetDate, createdAt, updatedAt, createdBy, reviewer, attachments = []
  } = currentRequest;

  const isOwner = user?.id === createdBy?.id;
  const isReviewer = user?.id === reviewer?.id;
  const canEdit = isOwner && status === NameRequestStatus.DRAFT;
  const canDelete = isOwner && [
    NameRequestStatus.DRAFT, 
    NameRequestStatus.CHANGES_REQUESTED
  ].includes(status);

  const daysRemaining = differenceInDays(new Date(targetDate), new Date());
  const daysText = daysRemaining < 0 
    ? `${Math.abs(daysRemaining)} days overdue` 
    : `Due in ${daysRemaining} days`;
  const daysColor = daysRemaining < 0 ? 'error' : daysRemaining <= 7 ? 'warning' : 'success';

  return (
    
      {/* Header */}
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr }}>
          <ArrowBack />
        </IconButton>
        <Box flexGrow={1}>
          <Typography variant="h4">{requestedName}</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Chip
              icon={getStatusIcon(status)}
              label={status}
              color={getStatusColor(status)}
              variant="outlined"
              size="small"
            />
            {isConfidential && (
              <Chip
                icon={<Lock />}
                label="Confidential"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </Box>
        
        {/* Action Buttons */}
        <Box display="flex" gap={1}>
          {canEdit && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          
          {isReviewer && status === NameRequestStatus.PENDING && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleApprove}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button
                variant="outlined"
                color="info"
                startIcon={<Edit />}
                onClick={handleRequestChanges}
              >
                Request Changes
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          aria-label="request details tabs"
        >
          <Tab label="Overview" {...a11yProps(0)} />
          <Tab label="Details" {...a11yProps(1)} />
          <Tab label={`Attachments (${attachments.length})`} {...a11yProps(2)} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb }}>
              <CardHeader title="Description" />
              <Divider />
              
                {description || 'No description provided.'}</Typography>
              </CardContent>
            </Card>
            <Card>
              <CardHeader title="Business Justification" />
              <Divider />
              
                {businessJustification || 'No business justification provided.'}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ mb }}>
              <CardHeader title="Details" />
              <Divider />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Status" 
                      secondary={
                        <Chip
                          icon={getStatusIcon(status)}
                          label={status}
                          color={getStatusColor(status)}
                          size="small"
                        />
                      } 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Target Date" 
                      secondary={
                        
                          {format(new Date(targetDate), 'MMM d, yyyy')}</Typography>
                          <Typography color={daysColor} variant="caption">
                            {daysText}
                          </Typography>
                        </Box>
                      } 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Requested By" 
                      secondary={
                        <Box display="flex" alignItems="center">
                          <Avatar src={createdBy?.avatar} sx={{ width, height, mr }}>
                            {createdBy?.name?.charAt(0) || '?'}
                          </Avatar>
                          
                            {createdBy?.name || 'Unknown'}</Typography>
                            {createdBy?.email && (
                              <Typography variant="caption" color="textSecondary">
                                {createdBy.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      } 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Details Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Technical Details" />
              <Divider />
              <CardContent>
                <Typography variant="body2" whiteSpace="pre-line">
                  {technicalDetails || 'No technical details provided.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Compliance Notes" />
              <Divider />
              <CardContent>
                <Typography variant="body2" whiteSpace="pre-line">
                  {complianceNotes || 'No compliance notes provided.'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Attachments Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardHeader title={`Attachments (${attachments.length})`} />
          <Divider />
          
            {attachments.length > 0 ? (
              
                {attachments.map((file, index) => (
                  <ListItem 
                    key={index}
                    button
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <ListItemIcon>
                      <AttachFile />
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box textAlign="center" p={3}>
                <AttachFile fontSize="large" color="action" sx={{ mb }} />
                <Typography>No attachments found</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Dialogs */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this name request? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={approveDialogOpen} onClose={() => setApproveDialogOpen(false)}>
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add any notes about this approval (optional):
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={4}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmApprove} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this request:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={4}
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmReject} 
            color="error" 
            variant="contained"
            disabled={!rejectReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={changesDialogOpen} onClose={() => setChangesDialogOpen(false)}>
        <DialogTitle>Request Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please describe the changes needed for this request:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            multiline
            rows={4}
            required
            value={changesRequested}
            onChange={(e) => setChangesRequested(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangesDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmRequestChanges} 
            color="info" 
            variant="contained"
            disabled={!changesRequested.trim()}
          >
            Request Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NameRequestDetails;
