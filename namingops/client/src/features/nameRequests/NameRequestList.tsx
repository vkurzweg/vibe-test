import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  Divider, 
  Grid, 
  IconButton, 
  Menu, 
  MenuItem, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  TableSortLabel, 
  TextField, 
  Toolbar, 
  Tooltip, 
  Typography, 
  useTheme,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  FilterList as FilterListIcon, 
  Search as SearchIcon, 
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Info as InfoIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { AppDispatch, RootState } from '../../app/store';
import { fetchNameRequests } from './nameRequestSlice';
import { NameRequest, NameRequestStatus, NameRequestType } from './types';
import { format } from 'date-fns';

interface HeadCell {
  id: keyof NameRequest;
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'requestedName', label: 'Name', numeric: false, sortable: true },
  { id: 'domain', label: 'Domain', numeric: false, sortable: true },
  { id: 'type', label: 'Type', numeric: false, sortable: true },
  { id: 'status', label: 'Status', numeric: false, sortable: true },
  { id: 'createdAt', label: 'Created', numeric: true, sortable: true },
  { id: 'targetDate', label: 'Target Date', numeric: true, sortable: true },
  { id: 'actions', label: '', numeric: false, sortable: false },
];

interface EnhancedTableProps {
  onRequestSort: (property: keyof NameRequest) => void;
  order: 'asc' | 'desc';
  orderBy: string;
  rowCount: number;
  adminView?: boolean;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort, adminView } = props;
  const createSortHandler = (property: keyof NameRequest) => () => {
    onRequestSort(property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => {
          // Skip certain columns based on view mode
          if (headCell.id === 'actions' && !adminView) return null;
          
          return (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {headCell.sortable ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                headCell.label
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

interface NameRequestListProps {
  adminView?: boolean;
  myRequests?: boolean;
}

const NameRequestList: React.FC<NameRequestListProps> = ({ adminView = false, myRequests = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { nameRequests, loading, total, page, limit } = useSelector((state: RootState) => ({
    nameRequests: state.nameRequests.nameRequests,
    loading: state.nameRequests.loading,
    total: state.nameRequests.total,
    page: state.nameRequests.page,
    limit: state.nameRequests.limit,
  }));

  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof NameRequest>('createdAt');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<NameRequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<NameRequestType | 'all'>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRequest, setSelectedRequest] = useState<NameRequest | null>(null);

  const handleRequestSort = (property: keyof NameRequest) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    fetchData(0, limit, property, isAsc ? 'desc' : 'asc', searchTerm, statusFilter, typeFilter);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchData(newPage, limit, orderBy, order, searchTerm, statusFilter, typeFilter);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    fetchData(0, newLimit, orderBy, order, searchTerm, statusFilter, typeFilter);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    // Debounce search
    const timer = setTimeout(() => {
      fetchData(0, limit, orderBy, order, value, statusFilter, typeFilter);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleStatusFilterChange = (event: any) => {
    const value = event.target.value as NameRequestStatus | 'all';
    setStatusFilter(value);
    fetchData(0, limit, orderBy, order, searchTerm, value, typeFilter);
  };

  const handleTypeFilterChange = (event: any) => {
    const value = event.target.value as NameRequestType | 'all';
    setTypeFilter(value);
    fetchData(0, limit, orderBy, order, searchTerm, statusFilter, value);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: NameRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRequest(null);
  };

  const handleViewDetails = () => {
    if (selectedRequest) {
      navigate(`/requests/${selectedRequest._id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedRequest) {
      navigate(`/requests/${selectedRequest._id}/edit`);
    }
    handleMenuClose();
  };

  const fetchData = (
    pageNum: number, 
    pageSize: number, 
    sortBy: keyof NameRequest, 
    sortOrder: 'asc' | 'desc',
    search: string,
    status: NameRequestStatus | 'all',
    type: NameRequestType | 'all'
  ) => {
    const filters: any = {};
    if (search) filters.search = search;
    if (status !== 'all') filters.status = status;
    if (type !== 'all') filters.type = type;
    if (myRequests) filters.myRequests = true;
    
    dispatch(fetchNameRequests({
      page: pageNum + 1,
      limit: pageSize,
      sortBy,
      sortOrder,
      ...filters
    }));
  };

  useEffect(() => {
    fetchData(0, limit, orderBy, order, searchTerm, statusFilter, typeFilter);
  }, []);

  const getStatusChip = (status: NameRequestStatus) => {
    let icon = null;
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    
    switch (status) {
      case NameRequestStatus.APPROVED:
        icon = <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />;
        color = 'success';
        break;
      case NameRequestStatus.REJECTED:
        icon = <CancelIcon fontSize="small" sx={{ mr: 0.5 }} />;
        color = 'error';
        break;
      case NameRequestStatus.PENDING:
        icon = <PendingIcon fontSize="small" sx={{ mr: 0.5 }} />;
        color = 'warning';
        break;
      case NameRequestStatus.CHANGES_REQUESTED:
        icon = <InfoIcon fontSize="small" sx={{ mr: 0.5 }} />;
        color = 'info';
        break;
      default:
        break;
    }

    return (
      <Chip
        icon={icon}
        label={status}
        color={color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getTypeChip = (type: NameRequestType) => {
    return (
      <Chip
        label={type}
        size="small"
        variant="outlined"
      />
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * limit - total) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(loading && {
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? 'rgba(0, 0, 0, 0.02)'
                  : 'rgba(255, 255, 255, 0.05)',
            }),
          }}
        >
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            {adminView ? 'All Name Requests' : myRequests ? 'My Name Requests' : 'Name Requests'}
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/requests/new')}
            sx={{ mr: 2 }}
          >
            New Request
          </Button>
          
          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
        
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {Object.values(NameRequestStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  value={typeFilter}
                  label="Type"
                  onChange={handleTypeFilterChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {Object.values(NameRequestType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={nameRequests.length}
              adminView={adminView}
            />
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + (adminView ? 0 : 1)} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : nameRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length + (adminView ? 0 : 1)} align="center" sx={{ py: 4 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <SearchIcon fontSize="large" color="disabled" sx={{ mb: 1 }} />
                      <Typography variant="subtitle1" color="textSecondary">
                        No name requests found
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'Create a new name request to get started'}
                      </Typography>
                      {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/requests/new')}
                          sx={{ mt: 2 }}
                        >
                          New Request
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                nameRequests.map((request) => {
                  return (
                    <TableRow
                      hover
                      key={request._id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer' }}
                      onClick={() => navigate(`/requests/${request._id}`)}
                    >
                      <TableCell component="th" scope="row">
                        <Box display="flex" alignItems="center">
                          {request.isConfidential && (
                            <Tooltip title="Confidential">
                              <LockIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                            </Tooltip>
                          )}
                          <Typography variant="body2" fontWeight="medium">
                            {request.requestedName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {request.domain}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getTypeChip(request.type)}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(request.status)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatDate(request.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          color={new Date(request.targetDate) < new Date() ? 'error' : 'inherit'}
                        >
                          {formatDate(request.targetDate)}
                        </Typography>
                      </TableCell>
                      {adminView && (
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuOpen(e, request);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={headCells.length + (adminView ? 0 : 1)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={limit}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            if (selectedRequest) {
              // Handle delete
              console.log('Delete:', selectedRequest._id);
              handleMenuClose();
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default NameRequestList;
