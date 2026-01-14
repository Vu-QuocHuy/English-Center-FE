import React from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { commonStyles } from '@shared/utils';
import Transactions from './Transactions';
import Categories from './Categories';

const OtherTransactions: React.FC = () => {
  const [tab, setTab] = React.useState<number>(0);

  return (
    <DashboardLayout role="admin">
      <Box sx={commonStyles.pageContainer}>
        <Box sx={commonStyles.contentContainer}>
          <Box sx={commonStyles.pageHeader}>
            <Typography sx={commonStyles.pageTitle}>Thu chi khác</Typography>
          </Box>

          <Paper sx={{ mb: 3, boxShadow: 'none' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Hóa đơn" />
              <Tab label="Danh mục" />
            </Tabs>
            <Box sx={{ p: 2 }}>
              {tab === 0 && <Transactions />}
              {tab === 1 && <Categories />}
            </Box>
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default OtherTransactions;
