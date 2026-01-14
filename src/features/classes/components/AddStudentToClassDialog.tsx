import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Checkbox,

  Box,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getAllStudentsAPI } from '@features/students';
import { enrollStudentAPI, getStudentsInClassAPI } from '@features/classes';
import { NotificationSnackbar, BaseDialog } from '@shared/components';

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ClassData {
  id: string;
  name: string;
}

interface AddStudentToClassDialogProps {
  open: boolean;
  onClose: () => void;
  classData: ClassData;
  onUpdate: () => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const AddStudentToClassDialog: React.FC<AddStudentToClassDialogProps> = ({ open, onClose, classData, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentDiscounts, setStudentDiscounts] = useState<Record<string, string>>({});
  const [existingStudentIds, setExistingStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch existing students in class
  useEffect(() => {
    const fetchExistingStudents = async (): Promise<void> => {
      try {
        const params = { page: 1, limit: 100 };
        const res = await getStudentsInClassAPI(classData.id, params);
        if (res.data && res.data.students) {
          setExistingStudentIds(res.data.students.map((s: Student) => s.id));
        } else {
          setExistingStudentIds([]);
        }
      } catch (error) {
        setExistingStudentIds([]);
      }
    };

    if (open && classData?.id) {
      fetchExistingStudents();
    }
  }, [open, classData?.id]);

  useEffect(() => {
    const fetchStudents = async (): Promise<void> => {
      setLoadingList(true);
      try {
        const params: any = { page: 1, limit: 30 };
        if (searchQuery) params.name = searchQuery;
        const response = await getAllStudentsAPI(params);
        console.log('API Response:', response); // Debug log

        // Handle new paginated API response structure
        let studentsArray: Student[] = [];
        if (response && response.data && response.data.data) {
          const { data } = response.data;
          studentsArray = data.result || [];
        } else if (response && response.data) {
          studentsArray = response.data || [];
        }

        // Filter out students who are already in the class
        const availableStudents = studentsArray.filter(
          (student: Student) => !existingStudentIds.includes(student.id)
        );
        console.log('Available students:', availableStudents); // Debug log
        setAllStudents(availableStudents);
      } catch (error) {
      } finally {
        setLoadingList(false);
      }
    };

    // Chỉ gọi API khi có từ khóa tìm kiếm
    if (searchQuery.trim()) {
      const debounceFetch = setTimeout(() => {
        fetchStudents();
      }, 700); // Debounce search query

      return () => clearTimeout(debounceFetch);
    } else {
      // Nếu không có từ khóa, xóa danh sách học sinh
      setAllStudents([]);
      setLoadingList(false);
    }
  }, [searchQuery, existingStudentIds]);

  const handleToggleStudent = (studentId: string): void => {
    const currentIndex = selectedStudents.indexOf(studentId);
    const newSelected = [...selectedStudents];
    const newDiscounts = { ...studentDiscounts };

    if (currentIndex === -1) {
      newSelected.push(studentId);
      newDiscounts[studentId] = '';
    } else {
      newSelected.splice(currentIndex, 1);
      delete newDiscounts[studentId];
    }
    setSelectedStudents(newSelected);
    setStudentDiscounts(newDiscounts);
  };

  const handleDiscountChange = (studentId: string, discount: string): void => {
    setStudentDiscounts(prev => ({
      ...prev,
      [studentId]: discount
    }));
  };

  const handleAddStudents = async (): Promise<void> => {
    if (selectedStudents.length === 0) {
      setNotification({
        open: true,
        message: 'Vui lòng chọn ít nhất một học sinh',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const enrollPromises = selectedStudents.map(studentId => {
        return enrollStudentAPI(classData.id, [{ studentId, discountPercent: Number(studentDiscounts[studentId]) || 0 }]);
      });

      await Promise.all(enrollPromises);

      setNotification({
        open: true,
        message: `Đã thêm ${selectedStudents.length} học sinh vào lớp thành công!`,
        severity: 'success'
      });

      setSelectedStudents([]);
      setStudentDiscounts({});
      setSearchQuery('');
      onUpdate();
      onClose();
    } catch (error: any) {
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi thêm học sinh',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (): void => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // API đã trả về kết quả đã được filter, không cần filter thêm
  const studentsToShow = allStudents;

  return (
    <>
      <BaseDialog
        open={open}
        onClose={onClose}
        title={`Thêm học sinh vào lớp: ${classData?.name}`}
        icon={<SearchIcon sx={{ fontSize: 28, color: 'white' }} />}
        maxWidth="md"
        loading={loadingList}
        hideDefaultAction={true}
        actions={
          <>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              onClick={handleAddStudents}
              variant="contained"
              disabled={loading || selectedStudents.length === 0}
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#667eea',
                '&:hover': { bgcolor: '#5a6fd8' },
              }}
            >
              {loading ? <CircularProgress size={20} /> : `Thêm ${selectedStudents.length} học sinh`}
            </Button>
          </>
        }
      >
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm học sinh theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loadingList ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {studentsToShow.map((student) => (
                <ListItem key={student.id} dense>
                  <Checkbox
                    edge="start"
                    checked={selectedStudents.indexOf(student.id) !== -1}
                    onChange={() => handleToggleStudent(student.id)}
                  />
                  <ListItemText
                    primary={student.name}
                    secondary={student.email}
                  />
                  {selectedStudents.indexOf(student.id) !== -1 && (
                    <TextField
                      size="small"
                      label="Giảm giá (%)"
                      type="number"
                      value={studentDiscounts[student.id] || ''}
                      onChange={(e) => handleDiscountChange(student.id, e.target.value)}
                      sx={{ width: 120, ml: 1 }}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  )}
                </ListItem>
              ))}
              {studentsToShow.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary={searchQuery.trim() ? "Không tìm thấy học sinh nào" : "Nhập từ khóa để tìm kiếm học sinh"}
                    secondary={searchQuery.trim() ? "Thử tìm kiếm với từ khóa khác" : "Vui lòng nhập tên hoặc email học sinh"}
                  />
                </ListItem>
              )}
            </List>
          )}
      </BaseDialog>

      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default AddStudentToClassDialog;