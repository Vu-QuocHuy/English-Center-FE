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
import type { PermissionFilters } from '../hooks/usePermissionManagement';

interface PermissionFiltersProps {
    filters: PermissionFilters;
    modules: string[];
    onFilterChange: (filters: PermissionFilters) => void;
}

const PermissionFiltersComponent: React.FC<PermissionFiltersProps> = memo(({
    filters,
    modules,
    onFilterChange,
}) => {
    const handleChange = (field: keyof PermissionFilters, value: string) => {
        onFilterChange({ ...filters, [field]: value });
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <TextField
                size="small"
                placeholder="Tìm kiếm theo path hoặc mô tả..."
                value={filters.search}
                onChange={(e) => handleChange('search', e.target.value)}
                sx={{ minWidth: 300 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                    ),
                }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Module</InputLabel>
                <Select
                    value={filters.module}
                    label="Module"
                    onChange={(e) => handleChange('module', e.target.value)}
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    {modules.map((module) => (
                        <MenuItem key={module} value={module}>
                            {module}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
});

PermissionFiltersComponent.displayName = 'PermissionFilters';

export default PermissionFiltersComponent;
