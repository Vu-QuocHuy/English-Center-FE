import React from 'react';
import {
  Box,
  Typography,
  Container
} from '@mui/material';
import {
  Block as BlockIcon
} from '@mui/icons-material';

const ForbiddenAccess: React.FC = () => {

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      py: 3
    }}>
      <Container maxWidth="sm">
        <Box sx={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BlockIcon sx={{
            fontSize: 120,
            color: '#d32f2f',
            mb: 3
          }} />

          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              color: '#d32f2f',
              mb: 2
            }}
          >
            Không có quyền truy cập
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            Bạn không có quyền truy cập vào chức năng này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default ForbiddenAccess;
