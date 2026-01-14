import React from 'react';
import {

  SxProps,
  Theme,

} from '@mui/material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

const DatePicker: React.FC<DatePickerProps> = React.memo(({
  value,
  onChange,
  label,
  placeholder = 'Chọn ngày',
  fullWidth = true,
  size = 'medium',
  disabled = false,
  error = false,
  helperText,
  minDate,
  maxDate,
  format = 'dd/MM/yyyy',
  sx = {},
  'data-testid': dataTestId,
  ...props
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <MuiDatePicker
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        format={format}
        slotProps={{
          textField: {
            fullWidth,
            size,
            placeholder,
            error,
            helperText,
            sx,
            ...(dataTestId && { 'data-testid': dataTestId }),
            ...props,
          },
        }}
      />
    </LocalizationProvider>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
