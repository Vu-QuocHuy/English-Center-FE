import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';

export interface FilterOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: FilterOption[];
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  disabled?: boolean;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = React.memo(({
  value,
  onChange,
  options,
  label,
  placeholder = 'Chọn tùy chọn',
  fullWidth = true,
  size = 'medium',
  disabled = false,
  sx = {},
  'data-testid': dataTestId,
  ...props
}) => {
  const handleChange = (event: SelectChangeEvent<string | number>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      sx={sx}
      data-testid={dataTestId}
      {...props}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={value}
        onChange={handleChange}
        label={label}
        displayEmpty
        renderValue={(selected) => {
          if (selected === '' || selected === 'all') {
            return placeholder;
          }
          const option = options.find(opt => opt.value === selected);
          return option?.label || placeholder;
        }}
      >
        <MenuItem value="all" disabled>
          {placeholder}
        </MenuItem>
        {options.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

FilterSelect.displayName = 'FilterSelect';

export default FilterSelect;
