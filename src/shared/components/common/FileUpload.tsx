import React, { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  SxProps,
  Theme,
  Alert,
  LinearProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

const FileUpload: React.FC<FileUploadProps> = React.memo(({
  onFileSelect,
  multiple = false,
  accept = '*/*',
  maxSize = 10,
  maxFiles = 5,
  disabled = false,
  loading = false,
  error,
  sx = {},
  'data-testid': dataTestId,
  ...props
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string>('');

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Chỉ được chọn tối đa ${maxFiles} file`);
      return { valid, errors };
    }

    files.forEach((file) => {
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name} vượt quá kích thước ${maxSize}MB`);
        return;
      }
      valid.push(file);
    });

    return { valid, errors };
  }, [maxSize, maxFiles]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const { valid, errors } = validateFiles(fileArray);

    if (errors.length > 0) {
      setDragError(errors.join(', '));
      return;
    }

    setDragError('');
    onFileSelect(valid);
  }, [validateFiles, onFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFileSelect(event.dataTransfer.files);
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  }, [handleFileSelect]);

  return (
    <Paper
      elevation={isDragOver ? 8 : 1}
      sx={{
        border: '2px dashed',
        borderColor: isDragOver ? 'primary.main' : 'divider',
        backgroundColor: isDragOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease-in-out',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...sx,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={dataTestId}
      {...props}
    >
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: isDragOver ? 'primary.main' : 'text.secondary',
            mb: 2,
          }}
        />

        <Typography variant="h6" gutterBottom>
          {isDragOver ? 'Thả file vào đây' : 'Kéo thả file hoặc click để chọn'}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Hỗ trợ: {accept === '*/*' ? 'Tất cả file types' : accept}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Kích thước tối đa: {maxSize}MB
        </Typography>

        {multiple && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Tối đa {maxFiles} file
          </Typography>
        )}

        <Button
          variant="outlined"
          component="label"
          disabled={disabled}
          sx={{ mt: 2 }}
        >
          Chọn File
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </Button>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Đang tải lên...
            </Typography>
          </Box>
        )}

        {(error || dragError) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || dragError}
          </Alert>
        )}
      </Box>
    </Paper>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
