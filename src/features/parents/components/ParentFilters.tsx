import React from 'react';
import { Paper, Grid } from '@mui/material';
import { SearchInput } from '@shared/components';

interface ParentFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ParentFilters: React.FC<ParentFiltersProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm phụ huynh..."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ParentFilters;
