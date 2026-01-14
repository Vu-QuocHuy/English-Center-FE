import React, { memo } from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import type { RoleFilters } from '../hooks/useRoleManagement';

interface RoleFiltersProps {
    filters: RoleFilters;
    onFilterChange: (filters: RoleFilters) => void;
}

const RoleFiltersComponent: React.FC<RoleFiltersProps> = memo(({
    filters,
    onFilterChange,
}) => {
    const handleChange = (field: keyof RoleFilters, value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <TextField
                size="small"
                placeholder="Tìm kiếm theo tên..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                sx={{ minWidth: 250 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                    ),
                }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                    value={filters.isActive}
                    label="Trạng thái"
                    onChange={(e) => handleChange('isActive', e.target.value)}
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="true">Hoạt động</MenuItem>
                    <MenuItem value="false">Không hoạt động</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Nhân viên</InputLabel>
                <Select
                    value={filters.isStaff}
                    label="Nhân viên"
                    onChange={(e) => handleChange('isStaff', e.target.value)}
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="true">Nhân viên</MenuItem>
                    <MenuItem value="false">Không phải nhân viên</MenuItem>
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Hệ thống</InputLabel>
                <Select
                    value={filters.isSystem}
                    label="Hệ thống"
                    onChange={(e) => handleChange('isSystem', e.target.value)}
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="true">Hệ thống</MenuItem>
                    <MenuItem value="false">Không phải hệ thống</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
});

RoleFiltersComponent.displayName = 'RoleFilters';

export default RoleFiltersComponent;
