import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AvatarUpload } from '@shared/components';

interface TeacherProfileSummaryProps {
  avatar?: string;
  userName: string;
}

const TeacherProfileSummary: React.FC<TeacherProfileSummaryProps> = ({
  avatar,
  userName,
}) => {
  return (
    <Card sx={{
      height: 'fit-content',
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      overflow: 'visible'
    }}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        {/* Profile Picture */}
        <Box sx={{ mb: 3 }}>
          <AvatarUpload
            currentAvatar={avatar}
            userName={userName}
            width={200}
            height={280}
            onAvatarUpdate={(_newAvatarUrl) => {
              // Avatar will be updated through the context
            }}
          />
        </Box>

        {/* User Name */}
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {userName}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TeacherProfileSummary;
