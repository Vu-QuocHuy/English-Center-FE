import { useState, useEffect } from 'react';
import { getAllStudentsAPI, deleteStudentAPI } from '@features/students';
import { Student } from '@shared/types';

interface UseStudentManagementReturn {
  students: Student[];
  loading: boolean;
  loadingTable: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchStudents: (pageNum?: number) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<{ success: boolean; message: string }>;
  handlePageChange: (event: React.SyntheticEvent, value: number) => void;
  resetFilters: () => void;
}

export const useStudentManagement = (): UseStudentManagementReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');


  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchStudents = async (pageNum: number = 1): Promise<void> => {
    setLoading(true);
    setLoadingTable(true);
    try {
      const params: any = {
        page: pageNum,
        limit: 10,
      };

      // Handle filters with {} format
      if (debouncedSearch) {
        params.name = debouncedSearch;
      }

      const response = await getAllStudentsAPI(params);

      if (response && response.data && response.data.data) {
        // Handle actual API response structure: { statusCode, message, data: { meta, result } }
        const { data } = response.data;
        const studentsArray = data.result || [];

        setStudents(studentsArray);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalRecords(data.meta?.totalItems || 0);


      }
    } catch (error) {
      setError('Có lỗi xảy ra khi tải danh sách học sinh');
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  };

  const deleteStudent = async (studentId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      await deleteStudentAPI(studentId);
      await fetchStudents(page); // Refresh student list with current page
      return { success: true, message: 'Xóa học sinh thành công!' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa học sinh'
      };
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.SyntheticEvent, value: number): void => {
    setPage(value);
  };

  const resetFilters = (): void => {
    setSearchQuery('');
    setPage(1);
  };

  // Fetch students on initial mount
  useEffect(() => {
    fetchStudents(1);
  }, []); // Only run once on mount

  // Fetch students when dependencies change
  useEffect(() => {
    fetchStudents(page);
  }, [page, debouncedSearch]);

  return {
    students,
    loading,
    loadingTable,
    error,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    fetchStudents,
    deleteStudent,
    handlePageChange,
    resetFilters,
  };
};
