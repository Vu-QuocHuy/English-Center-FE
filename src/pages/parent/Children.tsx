import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, LinearProgress, Alert
} from '@mui/material';
import {
  FamilyRestroom as FamilyIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Class as ClassIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { ChildDetailsDialog, ChildrenList, useParentChildren } from '@features/parents';
import { commonStyles } from '@shared/utils';

const Children: React.FC = () => {
  const { user } = useAuth();
  const {
    loading,
    error,
    childrenData,
    selectedChild,
    childDetailsOpen,
    detailLoading,
    classDetails,
    attendanceData,
    handleViewChildDetails,
    handleCloseChildDetails,
  } = useParentChildren(user);

  const getGenderLabel = (gender?: string): string => {
    if (!gender) return 'Chưa cập nhật';
    const g = gender.toString().toLowerCase();
    if (g === 'male' || g === 'nam') return 'Nam';
    if (g === 'female' || g === 'nữ' || g === 'nu') return 'Nữ';
    if (g === 'other' || g === 'khác') return 'Khác';
    return gender;
  };

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="parent">
        <Box sx={commonStyles.container}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Thông tin con
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FamilyIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Tổng số con
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.totalChildren}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <SchoolIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Tổng lớp học
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.totalClasses}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đang học
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.activeClasses}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ClassIcon sx={{ mr: 2, fontSize: 40, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đã kết thúc
                    </Typography>
                    <Typography variant="h4">
                      {childrenData.completedClasses}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Children List */}
        <ChildrenList
          children={childrenData.children}
          onViewChildDetails={handleViewChildDetails}
          getGenderLabel={getGenderLabel}
        />

        {/* Child Details Dialog */}
        <ChildDetailsDialog
          open={childDetailsOpen}
          onClose={handleCloseChildDetails}
          child={selectedChild}
          loading={detailLoading}
          classDetails={classDetails}
          attendanceData={attendanceData}
        />
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Children;