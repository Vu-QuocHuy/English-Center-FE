import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import dayjs from 'dayjs';
import { useAuth } from '../../contexts/AuthContext';
import { getStudentScheduleAPI, type StudentScheduleClass } from '@features/students';
import { ScheduleCalendar } from '@shared/components';
import { Lesson } from '@shared/types';
import DashboardLayout from '@shared/components/layouts/DashboardLayout';

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await getStudentScheduleAPI(user?.id || '');
      const lessons: Lesson[] = [];

      if (response.data && response.data.data) {
        const scheduleData: StudentScheduleClass[] = response.data.data;

        scheduleData.forEach((item: StudentScheduleClass) => {
          const classData = item.class;
          const schedule = classData.schedule;

          if (schedule) {

            const startDate = dayjs(schedule.start_date);
            const endDate = dayjs(schedule.end_date);
            let currentDate = startDate;

            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
              // Convert day of week from string to number (0 = Sunday, 1 = Monday, etc.)
              const dayOfWeeks = schedule.days_of_week.map(day => parseInt(day));
              const currentDay = currentDate.day();

              if (dayOfWeeks.includes(currentDay)) {
                const lessonDate = currentDate.format('YYYY-MM-DD');

                lessons.push({
                  date: lessonDate,
                  className: classData.name,
                  time: `${schedule.time_slots.start_time} - ${schedule.time_slots.end_time}`,
                  room: (classData as any).room || '',
                  teacher: (classData as any)?.teacher?.name || 'Chưa phân công',
                  type: 'student',
                  classId: classData.id,
                  status: 'active', // Default status
                  grade: classData.grade.toString(),
                  section: classData.section.toString()
                });

                // Log thông tin giảm giá
                console.log(`Lớp ${classData.name}: Giảm giá ${item.discountPercent}%`);
              }
              currentDate = currentDate.add(1, 'day');
            }
          }
        });

        setLessons(lessons);
      }
    } catch (error: any) {
      console.error('Error fetching student schedule:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchSchedule();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="student">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <ScheduleCalendar
        lessons={lessons}
        title="Lịch học"
        userType="student"
      />
    </DashboardLayout>
  );
};

export default Schedule;