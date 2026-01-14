import { useEffect, useState } from 'react';
import { getParentByIdAPI } from '@features/parents';
import { getStudentByIdAPI } from '@features/students';
import { getClassByIdAPI } from '@features/classes';
import { getSessionsByStudentAPI } from '@shared/services';

interface ChildClass {
  id?: string;
  classId?: string;
  name: string;
  teacher?: string;
  schedule?: any;
  status: string;
  grade?: string;
  section?: string;
  attendanceRate?: number;
  progress?: number;
  room?: string;
  feePerLesson?: number;
  isActive?: boolean;
  discountPercent?: number;
  enrollmentDate?: string;
}

export interface Child {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  grade?: string;
  section?: string;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  attendanceRate?: number;
  classes: ChildClass[];
  // Optional studentId if API separates id vs studentId
  studentId?: string;
}

interface ChildrenData {
  children: Child[];
  totalChildren: number;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
}

export const getCurrentClassesForChild = (
  child: Child | null,
  classDetails: Record<string, any>
) => {
  if (!child) return [];
  return Object.values(classDetails).filter((classDetail: any) => {
    if (!classDetail?.classData) return false;
    const classData = classDetail.classData;
    const classId = classDetail.classId;
    const enrollment = (child as any)?.classes?.find((c: any) =>
      c.id === classId || c.classId === classId
    );
    const isActiveEnrollment = enrollment?.isActive === true;
    const status = (classData.status || '').toLowerCase();
    return isActiveEnrollment && (status === 'active' || status === 'upcoming' || !status);
  });
};

export const getPastClassesForChild = (
  child: Child | null,
  classDetails: Record<string, any>
) => {
  if (!child) return [];
  return Object.values(classDetails).filter((classDetail: any) => {
    if (!classDetail?.classData) return false;
    const classData = classDetail.classData;
    const classId = classDetail.classId;
    const enrollment = (child as any)?.classes?.find((c: any) =>
      c.id === classId || c.classId === classId
    );
    const isActiveEnrollment = enrollment?.isActive === true;
    const status = (classData.status || '').toLowerCase();
    // Đã hoàn thành hoặc đã nghỉ
    return status === 'closed' || status === 'completed' || isActiveEnrollment === false;
  });
};

interface UseParentChildrenReturn {
  loading: boolean;
  error: string;
  childrenData: ChildrenData;
  selectedChild: Child | null;
  childDetailsOpen: boolean;
  detailLoading: boolean;
  classDetails: Record<string, any>;
  attendanceData: any;
  handleViewChildDetails: (child: Child) => Promise<void>;
  handleCloseChildDetails: () => void;
}

export const useParentChildren = (user: any | null): UseParentChildrenReturn => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [childrenData, setChildrenData] = useState<ChildrenData>({
    children: [],
    totalChildren: 0,
    totalClasses: 0,
    activeClasses: 0,
    completedClasses: 0,
  });
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childDetailsOpen, setChildDetailsOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [classDetails, setClassDetails] = useState<Record<string, any>>({});
  const [attendanceData, setAttendanceData] = useState<any>({});

  useEffect(() => {
    if (user) {
      void fetchChildrenData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchChildrenData = async (): Promise<void> => {
    try {
      setLoading(true);
      const parentId =
        (user as any)?.parentId ||
        localStorage.getItem('parent_id') ||
        (user as any)?.id ||
        '';

      const res = await getParentByIdAPI(String(parentId));
      const parentPayload = (res as any)?.data?.data ?? (res as any)?.data;
      const students = Array.isArray(parentPayload?.students)
        ? parentPayload.students
        : [];

      // Fetch each student details to get academic info and class ids
      const detailed = await Promise.all(
        students.map(async (s: any) => {
          try {
            const det = await getStudentByIdAPI(String(s.id));
            // eslint-disable-next-line no-console
            console.log('[Children] GET /students/:id raw response for', s.id, det);
            const payload: any =
              (det as any)?.data?.data || (det as any)?.data || det || {};
            // eslint-disable-next-line no-console
            console.log('[Children] Parsed student payload for', s.id, payload);
            const rawClasses: any[] = Array.isArray(payload?.classes)
              ? payload.classes
              : Array.isArray(payload?.enrolledClasses)
              ? payload.enrolledClasses
              : Array.isArray(payload?.classIds)
              ? payload.classIds.map((id: any) => ({ classId: id }))
              : [];

            // Normalize class entries: API returns {discountPercent, class: {...}, isActive}
            const classes: ChildClass[] = rawClasses.map((c: any) => {
              // If class data is nested under 'class' property
              const classData = c.class || c;
              const rawStatus = (classData.status || '').toLowerCase();
              return {
                id: String(classData.id || c.classId || ''),
                classId: classData.id || c.classId,
                name: classData.name,
                grade: classData.grade,
                section: classData.section,
                room: classData.room,
                feePerLesson: classData.feePerLesson,
                schedule: classData.schedule,
                description: classData.description,
                status: rawStatus || (c.isActive ? 'active' : 'inactive'),
                isActive: c.isActive,
                discountPercent: c.discountPercent,
                enrollmentDate: c.enrollmentDate,
              };
            });
            // eslint-disable-next-line no-console
            console.log('[Children] Mapped classes for', s.id, classes);
            const classCount = classes.length;
            // Logic mới: Lớp đang học = isActive === true và status là 'active' | 'upcoming' | ''
            const activeCount = classes.filter((c: any) => {
              const status = (c.status || '').toLowerCase();
              const isActive = c.isActive === true;
              return isActive && (status === 'active' || status === 'upcoming' || !status);
            }).length;
            // Logic mới: Lớp đã học = status là 'closed' | 'completed' hoặc isActive === false
            const completedCount = classes.filter((c: any) => {
              const status = (c.status || '').toLowerCase();
              const isActive = c.isActive === true;
              return status === 'closed' || status === 'completed' || !isActive;
            }).length;

            return {
              id: s.id,
              studentId: s.id,
              name: s.name || payload.name,
              email: s.email || payload.email,
              phone: s.phone || payload.phone,
              dateOfBirth: payload.dayOfBirth,
              address: payload.address,
              gender: payload.gender,
              totalClasses: classCount,
              activeClasses: activeCount,
              completedClasses: completedCount,
              classes,
            } as Child;
          } catch {
            // eslint-disable-next-line no-console
            console.warn('[Children] GET /students/:id failed for', s.id);
            return {
              id: s.id,
              studentId: s.id,
              name: s.name,
              email: s.email,
              phone: s.phone,
              address: (s as any).address,
              gender: (s as any).gender,
              totalClasses: 0,
              activeClasses: 0,
              completedClasses: 0,
              classes: [],
            } as Child;
          }
        })
      );

      setChildrenData({
        children: detailed,
        totalChildren: detailed.length,
        totalClasses: detailed.reduce(
          (sum, c) => sum + (c.totalClasses || 0),
          0
        ),
        activeClasses: detailed.reduce(
          (sum, c) => sum + (c.activeClasses || 0),
          0
        ),
        completedClasses: detailed.reduce(
          (sum, c) => sum + (c.completedClasses || 0),
          0
        ),
      });
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          'Có lỗi xảy ra khi tải thông tin con'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewChildDetails = async (child: Child): Promise<void> => {
    setSelectedChild(child);
    setChildDetailsOpen(true);
    setDetailLoading(true);
    try {
      // Luôn gọi API thống kê điểm danh khi mở dialog chi tiết
      try {
        const att = await getSessionsByStudentAPI(
          String((child as any).studentId || child.id)
        );
        const payload: any =
          (att as any)?.data?.data || (att as any)?.data || att || {};
        const sessionsList: any[] = Array.isArray(payload?.detailedAttendance)
          ? payload.detailedAttendance
          : Array.isArray(payload?.result)
          ? payload.result
          : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.sessions)
          ? payload.sessions
          : [];

        const stats = payload.attendanceStats || {
          totalSessions: sessionsList.length,
          presentSessions: sessionsList.filter(
            (s: any) =>
              String(s?.status || '').toLowerCase() === 'present'
          ).length,
          absentSessions: sessionsList.filter(
            (s: any) =>
              String(s?.status || '').toLowerCase() === 'absent'
          ).length,
          lateSessions: sessionsList.filter(
            (s: any) =>
              String(s?.status || '').toLowerCase() === 'late'
          ).length,
        };

        const attendanceRate =
          stats.totalSessions > 0
            ? Math.round(
                ((stats.presentSessions + stats.lateSessions) /
                  stats.totalSessions) *
                  100
              )
            : 0;

        setAttendanceData({
          ...stats,
          attendanceRate,
          sessions: sessionsList,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(
          'getSessionsByStudentAPI failed or returned no sessions',
          e
        );
        setAttendanceData({
          totalSessions: 0,
          presentSessions: 0,
          absentSessions: 0,
          lateSessions: 0,
          attendanceRate: 0,
          sessions: [],
        });
      }

      // 2) Use class IDs from student detail
      const classes: any[] =
        Array.isArray((child as any).classes) &&
        (child as any).classes.length > 0
          ? (child as any).classes
          : [];
      // eslint-disable-next-line no-console
      console.log(
        'Class IDs used for fetching details:',
        classes.map((c: any) => c.classId || c.id)
      );

      // 3) Fetch class details for each class id
      const classPromises = classes.map(async (c: any) => {
        const classId = String(c.classId || c.id || '');
        if (!classId) return { classId, classData: null };
        try {
          const res = await getClassByIdAPI(classId);
          const classData =
            (res as any)?.data?.data || (res as any)?.data || res;
          return { classId, classData };
        } catch {
          return { classId, classData: null };
        }
      });
      const classResults = await Promise.all(classPromises);
      // eslint-disable-next-line no-console
      console.log(
        'Fetched class details count:',
        classResults.filter((r) => r.classData).length
      );
      const map: Record<string, any> = {};
      classResults.forEach((r) => {
        if (r.classId) map[r.classId] = r;
      });
      setClassDetails(map);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseChildDetails = (): void => {
    setChildDetailsOpen(false);
    setSelectedChild(null);
  };

  return {
    loading,
    error,
    childrenData,
    selectedChild,
    childDetailsOpen,
    detailLoading,
    classDetails,
    attendanceData,
    handleViewChildDetails,
    handleCloseChildDetails,
  };
};