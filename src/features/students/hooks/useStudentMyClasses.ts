import { useEffect, useState } from 'react';
import { getStudentScheduleAPI, getStudentDashboardAPI } from '@features/students';
import { getClassByIdAPI } from '@features/classes';
import { getSessionsByStudentAPI } from '@shared/services';

interface DashboardAttendance {
  totalSessions: number;
  presentSessions: number;
  absentSessions: number;
  lateSessions: number;
  attendanceRate: number;
}

interface DashboardData {
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendance: DashboardAttendance;
}

interface UseStudentMyClassesReturn {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedTab: number;
  handleTabChange: (_event: any, newValue: number) => void;
  classes: any[];
  filteredClasses: any[];
  loading: boolean;
  dashboardData: DashboardData;
  openDialog: boolean;
  selectedClass: any | null;
  classDetailLoading: boolean;
  attendanceInfo: any;
  attendanceLoading: boolean;
  handleOpenDialog: (classData: any) => Promise<void>;
  handleCloseDialog: () => void;
}

export const useStudentMyClasses = (user: any | null): UseStudentMyClassesReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
    attendance: {
      totalSessions: 0,
      presentSessions: 0,
      absentSessions: 0,
      lateSessions: 0,
      attendanceRate: 0,
    },
  });
  const [classDetailLoading, setClassDetailLoading] = useState(false);
  const [attendanceInfo, setAttendanceInfo] = useState<any>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        let studentId = user?.id;
        if (user?.role === 'student' && user?.studentId) {
          studentId = user.studentId;
        }
        if (!studentId) {
          throw new Error('Không tìm thấy thông tin học sinh');
        }

        const [dashRes, scheduleRes] = await Promise.all([
          getStudentDashboardAPI(studentId).catch(() => null),
          getStudentScheduleAPI(studentId).catch(() => null),
        ]);

        if (dashRes) {
          const dashData = dashRes?.data?.data || dashRes?.data || {};
          setDashboardData({
            totalClasses: dashData.totalClasses || 0,
            activeClasses: dashData.activeClasses || 0,
            completedClasses: dashData.completedClasses || 0,
            attendance: dashData.attendance || {
              totalSessions: 0,
              presentSessions: 0,
              absentSessions: 0,
              lateSessions: 0,
              attendanceRate: 0,
            },
          });
        }

        const scheduleData = scheduleRes?.data?.data || [];
        const dashboardClassList = dashRes?.data?.data?.classList || [];

        if (!Array.isArray(scheduleData)) {
          setClasses([]);
          return;
        }

        const dashboardClassMap = new Map();
        dashboardClassList.forEach((dashboardClass: any) => {
          dashboardClassMap.set(dashboardClass.className, {
            status: dashboardClass.status,
            teacherName: dashboardClass.teacherName,
          });
        });

        const realClasses = scheduleData.map((item: any) => {
          const classInfo = item.class;
          const schedule = classInfo.schedule;

          const dashboardInfo = dashboardClassMap.get(classInfo.name) || {};
          const classStatus = dashboardInfo.status || 'active';
          const teacherName =
            classInfo?.teacher?.name ||
            dashboardInfo.teacherName ||
            'Chưa phân công';

          const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          const dayText =
            schedule?.days_of_week?.length > 0
              ? schedule.days_of_week
                  .map((d: string) => weekdays[Number(d)])
                  .join(', ')
              : 'Chưa có lịch';

          const startTime = schedule?.time_slots?.start_time || '';
          const endTime = schedule?.time_slots?.end_time || '';
          let scheduleTime = '';
          if (startTime && endTime) {
            scheduleTime = `${startTime} - ${endTime}`;
          } else if (startTime || endTime) {
            scheduleTime = startTime || endTime;
          }

          return {
            id: classInfo.id,
            name: classInfo.name,
            teacher: teacherName,
            scheduleDays: dayText,
            scheduleTime,
            status: classStatus,
            isActive: item.isActive,
            enrollStatus: item.isActive ? 'active' : 'inactive',
            room: classInfo.room || 'Chưa phân phòng',
            startDate: schedule?.start_date,
            endDate: schedule?.end_date,
            grade: classInfo.grade,
            section: classInfo.section,
            year: new Date(schedule?.start_date).getFullYear(),
            discountPercent: item.discountPercent,
            enrollmentDate: new Date().toISOString(),
          };
        });

        setClasses(realClasses);
      } catch {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      void fetchClasses();
    }
  }, [user]);

  const handleOpenDialog = async (classData: any = null) => {
    if (!classData || !classData.id) return;
    setClassDetailLoading(true);
    setAttendanceLoading(true);
    setAttendanceInfo(null);

    try {
      const res = await getClassByIdAPI(classData.id);
      const detail = res?.data?.data || res?.data || res;

      const updatedClassData = {
        ...classData,
        ...detail,
        name: detail.name || classData.name,
        grade: detail.grade || classData.grade,
        section: detail.section || classData.section,
        year: detail.year || classData.year,
        description: detail.description || '',
        feePerLesson: detail.feePerLesson || 0,
        status: detail.status || classData.status,
        max_student: detail.max_student || 0,
        room: detail.room || classData.room,
        schedule: detail.schedule || classData.schedule,
        teacher: detail.teacher || classData.teacher || { name: 'Chưa phân công' },
      };

      setSelectedClass(updatedClassData);
    } catch {
      setSelectedClass(classData);
    } finally {
      setClassDetailLoading(false);
    }

    try {
      let studentId = user?.id;
      if (user?.role === 'student' && user?.studentId) {
        studentId = user.studentId;
      }
      if (studentId) {
        const attRes = await getSessionsByStudentAPI(studentId);
        const attData = attRes?.data?.data || attRes?.data || attRes;

        const selectedClassId = (classData as any).id;
        const selectedClassName = (classData as any).name;

        const filteredDetailed = (attData.detailedAttendance || []).filter(
          (a: any) =>
            (a.class?.id && a.class.id === selectedClassId) ||
            (a.class?.name && a.class.name === selectedClassName)
        );
        const filteredAbsent = (attData.absentSessionsDetails || []).filter(
          (a: any) =>
            (a.class?.id && a.class.id === selectedClassId) ||
            (a.class?.name && a.class.name === selectedClassName)
        );

        const attendanceStats: any = {
          totalSessions: filteredDetailed.length,
          presentSessions: filteredDetailed.filter(
            (a: any) => a.status === 'present'
          ).length,
          absentSessions: filteredDetailed.filter(
            (a: any) => a.status === 'absent'
          ).length,
          lateSessions: filteredDetailed.filter(
            (a: any) => a.status === 'late'
          ).length,
          attendanceRate: 0,
        };
        attendanceStats.attendanceRate =
          attendanceStats.totalSessions > 0
            ? Math.round(
                ((attendanceStats.presentSessions +
                  attendanceStats.lateSessions) /
                  attendanceStats.totalSessions) *
                  100
              )
            : 0;

        const filteredAttendance = {
          ...attData,
          attendanceStats,
          absentSessionsDetails: filteredAbsent,
          detailedAttendance: filteredDetailed,
        };

        setAttendanceInfo(filteredAttendance);
      }
    } catch {
      setAttendanceInfo(null);
    } finally {
      setAttendanceLoading(false);
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setSelectedClass(null);
    setOpenDialog(false);
  };

  const handleTabChange = (_event: any, newValue: number) => {
    setSelectedTab(newValue);
  };

  const filteredClasses = classes.filter((classItem) => {
    const name = classItem.name || '';
    const matchesSearch = name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (selectedTab === 0) {
      matchesStatus =
        classItem.status === 'active' && classItem.isActive === true;
    } else if (selectedTab === 1) {
      matchesStatus = classItem.status === 'upcoming';
    } else if (selectedTab === 2) {
      matchesStatus =
        classItem.status === 'closed' || classItem.status === 'completed';
    }

    return matchesSearch && matchesStatus;
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedTab,
    handleTabChange,
    classes,
    filteredClasses,
    loading,
    dashboardData,
    openDialog,
    selectedClass,
    classDetailLoading,
    attendanceInfo,
    attendanceLoading,
    handleOpenDialog,
    handleCloseDialog,
  };
};

