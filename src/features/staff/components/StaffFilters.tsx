import React from 'react';
import { Paper, Grid } from '@mui/material';
import { SearchInput } from '@shared/components';

interface StaffFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StaffFilters: React.FC<StaffFiltersProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={12}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên hoặc email nhân viên..."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default StaffFilters;
