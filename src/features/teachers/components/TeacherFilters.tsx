import React from 'react';
import { Paper, Grid, TextField, MenuItem } from '@mui/material';
import { SearchInput } from '@shared/components';


interface TeacherFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isActiveFilter: string;
  setIsActiveFilter: (filter: string) => void;
}

const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  isActiveFilter,
  setIsActiveFilter,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm theo tên giáo viên..."
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Trạng thái"
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="active">Đang hoạt động</MenuItem>
            <MenuItem value="inactive">Ngừng hoạt động</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeacherFilters;
