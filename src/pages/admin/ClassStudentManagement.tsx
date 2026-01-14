import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AddStudentToClassDialog from '../../features/classes/components/AddStudentToClassDialog';
import { removeStudentFromClassAPI, getStudentsInClassAPI } from '@features/classes';
import { NotificationSnackbar, ConfirmDialog } from '@shared/components';

interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface StudentInfo {
  discountPercent: number;
  student: Student;
}

interface ClassData {
  id: string;
  name: string;
  students?: StudentInfo[];
}

interface ClassStudentManagementProps {
  classData: ClassData;
  onUpdate: () => void;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ClassStudentManagement: React.FC<ClassStudentManagementProps> = ({ classData, onUpdate }) => {
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Use students data from classData if available, otherwise fetch from API
  useEffect(() => {
    if (classData?.students) {
      setStudents(classData.students);
      setStudentsLoading(false);
    } else if (classData?.id) {
      const fetchStudents = async (): Promise<void> => {
        setStudentsLoading(true);
        try {
          const params = { page: 1, limit: 100 };
          const res = await getStudentsInClassAPI(classData.id, params);
          if (res.data && res.data.students) {
            setStudents(res.data.students);
          } else {
            setStudents([]);
          }
        } catch (error) {
          console.error('Error fetching students:', error);
          setStudents([]);
        } finally {
          setStudentsLoading(false);
        }
      };
      fetchStudents();
    }
  }, [classData?.id, classData?.students]);

  const handleOpenAddDialog = (): void => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = (): void => {
    setOpenAddDialog(false);
    // Refresh students list after adding
    const fetchStudents = async (): Promise<void> => {
      try {
        const params = { page: 1, limit: 100 };
        const res = await getStudentsInClassAPI(classData.id, params);
        if (res.data && res.data.students) {
          setStudents(res.data.students);
        }
      } catch (error) {
        console.error('Error refreshing students:', error);
      }
    };
    fetchStudents();
  };

  const handleOpenConfirmRemove = (student: Student): void => {
    setStudentToRemove(student);
  };

  const handleCloseConfirmRemove = (): void => {
    setStudentToRemove(null);
  };

  const handleRemoveStudent = async (): Promise<void> => {
    if (!studentToRemove) return;
    setLoading(true);
    try {
      await removeStudentFromClassAPI(classData.id, studentToRemove.id);
      setNotification({ open: true, message: 'Xóa học sinh khỏi lớp thành công!', severity: 'success' });
      // Refresh students list
      const params = { page: 1, limit: 100 };
      const res = await getStudentsInClassAPI(classData.id, params);
      if (res.data && res.data.students) {
        setStudents(res.data.students);
      }
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Error removing student:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa học sinh',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleCloseConfirmRemove();
    }
  };

  const handleCloseNotification = (): void => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Quản lý học sinh lớp: {classData?.name}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Thêm học sinh
          </Button>
        </Box>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>Tên học sinh</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Chưa có học sinh nào trong lớp
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((studentInfo, index) => (
                    <TableRow key={studentInfo.student.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{studentInfo.student.name}</TableCell>
                      <TableCell>{studentInfo.student.email || 'N/A'}</TableCell>
                      <TableCell>{studentInfo.student.phone || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => handleOpenConfirmRemove(studentInfo.student)}
                          title="Xóa học sinh khỏi lớp"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <AddStudentToClassDialog
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          classData={classData}
          onUpdate={onUpdate}
        />

        <ConfirmDialog
          open={!!studentToRemove}
          onClose={handleCloseConfirmRemove}
          onConfirm={handleRemoveStudent}
          title="Xác nhận xóa học sinh"
          message={`Bạn có chắc chắn muốn xóa học sinh "${studentToRemove?.name}" khỏi lớp "${classData?.name}"?`}
          confirmText="Xóa"
          cancelText="Hủy"
          confirmColor="error"
          loading={loading}
        />
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

export default ClassStudentManagement;
