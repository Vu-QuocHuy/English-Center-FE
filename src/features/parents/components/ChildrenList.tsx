import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import type { Child } from '@features/parents';

interface ChildrenListProps {
  children: Child[];
  onViewChildDetails: (child: Child) => void;
  getGenderLabel: (gender?: string) => string;
}

const ChildrenList: React.FC<ChildrenListProps> = ({
  children,
  onViewChildDetails,
}) => {
  const getCurrentClassCount = (child: Child): number => {
    const classes = child.classes || [];
    return classes.filter((cls: any) => {
      const status = (cls.status || '').toLowerCase();
      const isActive = cls.isActive === true;
      return isActive && (status === 'active' || status === 'upcoming' || !status);
    }).length;
  };

  const getPastClassCount = (child: Child): number => {
    const classes = child.classes || [];
    return classes.filter((cls: any) => {
      const status = (cls.status || '').toLowerCase();
      const isActive = cls.isActive === true;
      return status === 'closed' || status === 'completed' || !isActive;
    }).length;
  };
  if (!children.length) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="textSecondary">
          Chưa có thông tin con
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {children.map((child) => (
        <Grid item xs={12} md={6} key={child.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{child.name}</Typography>
                  </Box>
                </Box>
                <Box />
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Số điện thoại
                    </Typography>
                    <Typography variant="body1">
                      {child.phone || 'Chưa có số điện thoại'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {child.email || 'Chưa có email'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2} mb={2}>
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Tổng lớp học
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {child.totalClasses}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đang học
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {getCurrentClassCount(child)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Lớp đã học
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {getPastClassCount(child)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Button
                  size="small"
                  color="primary"
                  onClick={() => onViewChildDetails(child)}
                >
                  Xem chi tiết
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ChildrenList;