import { useState, useEffect } from 'react';
import { getAllClassesAPI, getClassByIdAPI, getStudentsInClassAPI } from '@features/classes';
import { Class } from '@shared/types';

interface UseClassManagementReturn {
  classes: Class[];
  loading: boolean;
  loadingTable: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  yearFilter: string;
  setYearFilter: (year: string) => void;
  gradeFilter: string;
  setGradeFilter: (grade: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  fetchClasses: (pageNum?: number) => Promise<void>;
  fetchClassById: (classId: string) => Promise<any>;
  fetchClassStudents: (classId: string) => Promise<any>;
  handlePageChange: (event: React.SyntheticEvent, value: number) => void;
  resetFilters: () => void;
}

export const useClassManagement = (): UseClassManagementReturn => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchClasses = async (pageNum: number = 1): Promise<void> => {
    setLoading(true);
    setLoadingTable(true);
    try {
      const params: any = {
        page: pageNum,
        limit: 10,
      };

      // Build filters object
      const filters: any = {};
      
      if (debouncedSearch) {
        filters.name = debouncedSearch;
      }

      if (yearFilter && yearFilter !== '') {
        filters.year = parseInt(yearFilter, 10);
      }

      if (gradeFilter && gradeFilter !== '') {
        filters.grade = parseInt(gradeFilter, 10);
      }

      if (statusFilter && statusFilter !== '') {
        filters.status = statusFilter;
      }

      // Add filters to params if any filter is set
      if (Object.keys(filters).length > 0) {
        params.filters = filters;
      }

      const response = await getAllClassesAPI(params);

      if (response && response.data && response.data.data) {
        const { data } = response.data;
        const classesArray = data.result || [];
        setClasses(classesArray);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalRecords(data.meta?.totalItems || 0);
      } else if (response && response.data) {
        // Fallback for old API structure
        setClasses(response.data);
        setTotalPages(response.data?.totalPages || 1);
        setTotalRecords(response.data?.totalRecords || 0);
      }
    } catch (error: any) {
      setError('Có lỗi xảy ra khi tải danh sách lớp học');
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  };

  const fetchClassById = async (classId: string): Promise<any> => {
    try {
      const response = await getClassByIdAPI(classId);
      return response;
    } catch (error) {
      console.error('Error fetching class by ID:', error);
      throw error;
    }
  };

  const fetchClassStudents = async (classId: string): Promise<any> => {
    try {
      const response = await getStudentsInClassAPI(classId);
      return response;
    } catch (error) {
      console.error('Error fetching class students:', error);
      throw error;
    }
  };

  const handlePageChange = (_event: React.SyntheticEvent, value: number): void => {
    setPage(value);
  };

  const resetFilters = (): void => {
    setSearchQuery('');
    setYearFilter('');
    setGradeFilter('');
    setStatusFilter('');
  };

  // Fetch classes on initial mount
  useEffect(() => {
    fetchClasses(1);
  }, []); // Only run once on mount

  // Fetch classes when dependencies change
  useEffect(() => {

    fetchClasses(page);
  }, [page, debouncedSearch, yearFilter, gradeFilter, statusFilter]);

  return {
    classes,
    loading,
    loadingTable,
    error,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    yearFilter,
    setYearFilter,
    gradeFilter,
    setGradeFilter,
    statusFilter,
    setStatusFilter,
    fetchClasses,
    fetchClassById,
    fetchClassStudents,
    handlePageChange,
    resetFilters,
  };
};