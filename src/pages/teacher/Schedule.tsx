import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';
import { ScheduleCalendar } from '@shared/components';
import { getTeacherScheduleAPI, type TeacherScheduleClass } from '@features/teachers';
import { useAuth } from '../../contexts/AuthContext';

interface Lesson {
  date: string;
  className: string;
  time: string;
  room?: string;
  teacher: string;
  type: string;
  classId: string;
  grade: number;
  section: number;
}

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherSchedule = async (): Promise<void> => {
      if (!user) {
        console.error('No user found');
        setError('Không tìm thấy thông tin người dùng');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const teacherId = user?.id;
        if (!teacherId) {
          throw new Error('No teacher ID available');
        }

        const response = await getTeacherScheduleAPI(teacherId);

        if (response?.data?.data) {
          const classes: TeacherScheduleClass[] = response.data.data;
          const formattedLessons: Lesson[] = [];

          classes.forEach((classItem: TeacherScheduleClass) => {
            if (classItem.schedule) {
              const { schedule } = classItem;
              const startDate: Dayjs = dayjs(schedule.start_date);
              const endDate: Dayjs = dayjs(schedule.end_date);

              // Sử dụng cách tiếp cận đơn giản như trang học sinh
              let currentDate: Dayjs = startDate;
              while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                const currentDay: string = currentDate.day().toString(); // 0=Sunday, 1=Monday, ..., 6=Saturday

                if (schedule.days_of_week.includes(currentDay)) {
                  const lesson: Lesson = {
                    date: currentDate.format('YYYY-MM-DD'),
                    className: classItem.name,
                    time: `${schedule.time_slots.start_time} - ${schedule.time_slots.end_time}`,
                    room: (classItem as any).room,
                    teacher: user.name,
                    type: 'teacher',
                    classId: classItem.id,
                    grade: classItem.grade,
                    section: classItem.section,
                  };

                  formattedLessons.push(lesson);
                }

                currentDate = currentDate.add(1, 'day');
              }
            }
          });

          // Sắp xếp theo ngày
          formattedLessons.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setLessons(formattedLessons);
        } else {
          setLessons([]);
        }
      } catch (err: any) {
        console.error('Error fetching teacher schedule:', err);

        let errorMessage: string = 'Không thể tải lịch dạy học. Vui lòng thử lại sau.';

        if (err.response?.status === 404) {
          errorMessage = 'Không tìm thấy thông tin lịch dạy của giáo viên.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập thông tin này.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherSchedule();
  }, [user?.id, user?.name]);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="teacher">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      <ScheduleCalendar
        lessons={lessons}
        title="Lịch dạy"
        userType="teacher"
      />
    </DashboardLayout>
  );
};

export default Schedule;