import { useState, useEffect, useCallback } from 'react';
import { getAllTeachersAPI, deleteTeacherAPI, getTeacherByIdAPI } from '@features/teachers';
import { Teacher } from '@shared/types';

interface UseTeacherManagementReturn {
  data: Teacher[];
  teachers: Teacher[];
  selectedTeacher: Teacher | null;
  loading: boolean;
  loadingTable: boolean;
  loadingDetail: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isActiveFilter: string;
  setIsActiveFilter: (filter: string) => void;
  fetchData: (pageNum?: number) => Promise<void>;
  fetchTeachers: (pageNum?: number) => Promise<void>;
  getTeacherById: (id: string) => Promise<Teacher | null>;
  deleteItem: (id: string) => Promise<{ success: boolean; message: string }>;
  deleteTeacher: (id: string) => Promise<{ success: boolean; message: string }>;
  handlePageChange: (event: any, value: number) => void;
}

export const useTeacherManagement = (): UseTeacherManagementReturn => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isActiveFilter, setIsActiveFilter] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchTeachers = useCallback(async (pageNum: number = 1): Promise<void> => {
    setLoading(true);
    setLoadingTable(true);
    try {
      const params: Record<string, any> = {
        page: pageNum,
        limit: 10,
      };

      // Add name filter if search query exists
      if (debouncedSearch) {
        params.name = debouncedSearch;
      }

      // Add isActive filter if selected
      if (isActiveFilter === 'active') {
        params.isActive = true;
      } else if (isActiveFilter === 'inactive') {
        params.isActive = false;
      }

      const response = await getAllTeachersAPI(params);
      console.log('📊 Teachers API Response:', response);

      // Handle paginated API response structure similar to students/parents
      if (response && response.data && response.data.data) {
        const { data } = response.data;
        const teachersArray = data.result || [];
        setTeachers(teachersArray);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalRecords(data.meta?.totalItems || 0);
      } else if (response && response.data) {
        // Fallback for old API structure
        setTeachers(response.data);
        setTotalPages(response.data?.totalPages || 1);
        setTotalRecords(response.data?.totalRecords || 0);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Có lỗi xảy ra khi tải danh sách giáo viên');
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  }, [debouncedSearch, isActiveFilter]);

  const deleteTeacher = useCallback(async (teacherId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      await deleteTeacherAPI(teacherId);
      await fetchTeachers(); // Refresh teacher list
      return { success: true, message: 'Xóa giáo viên thành công!' };
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa giáo viên'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchTeachers]);

  const handlePageChange = useCallback((_event: any, value: number): void => {
    setPage(value);
  }, []);

  // Get teacher by ID
  const getTeacherById = useCallback(async (id: string): Promise<Teacher | null> => {
    setLoadingDetail(true);
    try {
      const response = await getTeacherByIdAPI(id);
      console.log('📊 Teacher Detail API Response:', response);

      if (response && response.data && response.data.data) {
        const teacher = response.data.data;
        setSelectedTeacher(teacher);
        return teacher;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching teacher detail:', error);
      setError(error.response?.data?.message || 'Không thể tải thông tin giáo viên');
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Fetch teachers when dependencies change
  useEffect(() => {
    fetchTeachers(page);
  }, [page, debouncedSearch, isActiveFilter, fetchTeachers]);

  return {
    data: teachers,
    teachers,
    selectedTeacher,
    loading,
    loadingTable,
    loadingDetail,
    error,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    isActiveFilter,
    setIsActiveFilter,
    fetchData: fetchTeachers,
    fetchTeachers,
    getTeacherById,
    deleteItem: deleteTeacher,
    deleteTeacher,
    handlePageChange,
  };
};
