import React, { useState, useEffect } from 'react';
import { useDebounce } from '@shared/hooks';
import {
  Box,
  Typography,
  Button,
  FormControl,
  Paper,
  Autocomplete,
  TextField,
} from '@mui/material';
import { Person as PersonIcon, School as SchoolIcon } from '@mui/icons-material';
import { assignTeacherAPI, unassignTeacherAPI } from '@features/classes';
import { getAllTeachersAPI } from '@features/teachers';

import { NotificationSnackbar } from '@shared/components';

interface Teacher {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
}

interface ClassData {
  id: string;
  name: string;
  teacherId?: string | Teacher;
}

interface ClassTeacherManagementProps {
  classData: ClassData;
  onUpdate: () => void;
  onClose: () => void;
  onSuccessMessage?: (message: string) => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ClassTeacherManagement: React.FC<ClassTeacherManagementProps> = ({
  classData, onUpdate, onClose, onSuccessMessage
}) => {
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [searchTeacher, setSearchTeacher] = useState<string>('');

  // Debounce search query
  const debouncedSearchTeacher = useDebounce(searchTeacher, 500);
  const [loading, setLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [currentTeacherObj, setCurrentTeacherObj] = useState<Teacher | null>(null);

  // Cập nhật currentTeacherObj khi classData thay đổi
  useEffect(() => {
    const updateCurrentTeacher = async (): Promise<void> => {
      let teacherObj: Teacher | null = null;

      if (typeof classData?.teacherId === 'string' && classData.teacherId) {
        // Nếu teacherId là string, tìm trong allTeachers trước
        if (allTeachers.length > 0) {
          teacherObj = allTeachers.find(
            (t) => String(t.id || t._id) === classData.teacherId
          ) || null;
        }

        // Nếu không tìm thấy trong allTeachers, fetch từ API
        if (!teacherObj) {
          try {
            const params = { page: 1, limit: 1000 }; // Lấy tất cả giáo viên để tìm
            const response = await getAllTeachersAPI(params);

            // Handle new paginated API response structure
            let teachersArray: Teacher[] = [];
            if (response && response.data && response.data.data) {
              const { data } = response.data;
              teachersArray = data.result || [];
            } else if (response && response.data) {
              teachersArray = response.data || [];
            }

            const foundTeacher = teachersArray.find(
              (t: Teacher) => String(t.id || t._id) === classData.teacherId
            );
            if (foundTeacher) {
              teacherObj = foundTeacher;
            }
          } catch (error) {
            console.error('Error fetching teacher data:', error);
          }
        }
      } else if (typeof classData?.teacherId === 'object' && classData.teacherId) {
        teacherObj = classData.teacherId as Teacher;
      }

      setCurrentTeacherObj(teacherObj);
    };

    updateCurrentTeacher();
  }, [classData, allTeachers]);
  
  useEffect(() => {
    const fetchTeachers = async (): Promise<void> => {
      try {
        if (!debouncedSearchTeacher) {
          setAllTeachers([]);
          return;
        }
        const params = { page: 1, limit: 20, name: debouncedSearchTeacher };
        const response = await getAllTeachersAPI(params);

        // Handle new paginated API response structure
        if (response && response.data && response.data.data) {
          const { data } = response.data;
          setAllTeachers(data.result || []);
        } else if (response && response.data) {
          setAllTeachers(response.data || []);
        } else {
          setAllTeachers([]);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setAllTeachers([]);
      }
    };
    fetchTeachers();
  }, [debouncedSearchTeacher]);

  useEffect(() => {
    // Set the initial selected teacher if one is already assigned
    if (currentTeacherObj && (currentTeacherObj.id || currentTeacherObj._id)) {
      setSelectedTeacherId(String(currentTeacherObj.id || currentTeacherObj._id));
    } else {
      setSelectedTeacherId('');
    }
  }, [currentTeacherObj]);

  const handleAssignTeacher = async (): Promise<void> => {
    if (!selectedTeacherId) {
      setNotification({
        open: true,
        message: 'Vui lòng chọn giáo viên',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      await assignTeacherAPI(classData.id, selectedTeacherId);
      setNotification({
        open: true,
        message: 'Phân công giáo viên thành công!',
        severity: 'success'
      });
      if (onSuccessMessage) onSuccessMessage('Phân công giáo viên thành công!');

      // Thêm delay trước khi refresh để đảm bảo backend đã xử lý xong
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi phân công giáo viên',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignTeacher = async (): Promise<void> => {
    if (!currentTeacherObj) {
      setNotification({
        open: true,
        message: 'Không có giáo viên để hủy phân công',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const teacherId = String(currentTeacherObj.id || currentTeacherObj._id);
      await unassignTeacherAPI(classData.id, teacherId);
      setNotification({
        open: true,
        message: 'Hủy phân công giáo viên thành công!',
        severity: 'success'
      });
      if (onSuccessMessage) onSuccessMessage('Hủy phân công giáo viên thành công!');

      // Thêm delay trước khi refresh để đảm bảo backend đã xử lý xong
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error unassigning teacher:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi hủy phân công giáo viên',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = (): void => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tìm kiếm và chọn giáo viên:
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Autocomplete
              options={allTeachers}
              getOptionLabel={(option: Teacher) => option.name}
              value={allTeachers.find(t => String(t.id || t._id) === selectedTeacherId) || null}
              onChange={(_, newValue) => {
                setSelectedTeacherId(newValue ? String(newValue.id || newValue._id) : '');
              }}
              inputValue={searchTeacher}
              onInputChange={(_, newInputValue) => {
                setSearchTeacher(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tìm kiếm giáo viên"
                  placeholder="Nhập tên giáo viên..."
                />
              )}
              renderOption={(props, option: Teacher) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">{option.name}</Typography>
                    {option.email && (
                      <Typography variant="body2" color="text.secondary">
                        {option.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              loading={debouncedSearchTeacher !== searchTeacher}
              noOptionsText="Không tìm thấy giáo viên"
            />
          </FormControl>

          {selectedTeacherId && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAssignTeacher}
                disabled={loading}
                fullWidth
              >
                Phân công giáo viên này
              </Button>
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Giáo viên hiện tại:
          </Typography>
          {currentTeacherObj ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
              <PersonIcon color="primary" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight="medium">
                  {currentTeacherObj.name}
                </Typography>
                {currentTeacherObj.email && (
                  <Typography variant="body2" color="text.secondary">
                    {currentTeacherObj.email}
                  </Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                color="error"
                onClick={handleUnassignTeacher}
                disabled={loading}
                startIcon={<SchoolIcon />}
              >
                Hủy phân công
              </Button>
            </Box>
          ) : (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, textAlign: 'center' }}>
              <Typography color="text.secondary">
                Chưa có giáo viên phụ trách
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      <NotificationSnackbar
        open={notification.open}
        onClose={handleCloseNotification}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
};

export default ClassTeacherManagement;
