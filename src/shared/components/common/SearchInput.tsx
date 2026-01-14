import React, { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useDebounceCommon as useDebounce } from '@shared/hooks';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceDelay?: number;
  fullWidth?: boolean;
  sx?: any;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  debounceDelay = 500,
  fullWidth = true,
  sx = {}
}) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceDelay);
  const isMounted = useRef(false);

  // Update parent when debounced value changes
  useEffect(() => {
    // Skip the first render to avoid calling onChange on mount
    if (isMounted.current) {
      onChange(debouncedValue);
    } else {
      isMounted.current = true;
    }
  }, [debouncedValue, onChange]);

  // Update local state when parent value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <TextField
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleInputChange}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#667eea',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#667eea',
          },
        },
        ...sx
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchInput;
