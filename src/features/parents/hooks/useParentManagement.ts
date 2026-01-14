import { useState, useEffect } from 'react';
import { getAllParentsAPI, deleteParentAPI, getParentByIdAPI } from '@features/parents';
import { getAllStudentsAPI } from '@features/students';
import { Parent, Student } from '@shared/types';

interface UseParentManagementReturn {
  parents: Parent[];
  loading: boolean;
  loadingTable: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchParents: (pageNum?: number) => Promise<void>;
  getParentById: (id: string) => Promise<Parent | null>;
  deleteParent: (parentId: string) => Promise<{ success: boolean; message: string }>;
  searchStudents: (query: string) => Promise<Student[]>;
  handlePageChange: (event: React.SyntheticEvent, value: number) => void;
}

export const useParentManagement = (): UseParentManagementReturn => {
  const [parents, setParents] = useState<Parent[]>([]);
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

  const fetchParents = async (pageNum: number = 1): Promise<void> => {
    setLoading(true);
    setLoadingTable(true);
    try {
      const params = {
        page: pageNum,
        limit: 10,
        ...(debouncedSearch && { name: debouncedSearch })
      };

      const response = await getAllParentsAPI(params);

      // Handle paginated API response structure similar to students
      if (response && response.data && response.data.data) {
        const { data } = response.data;
        const parentsArray = data.result || [];
        setParents(parentsArray);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalRecords(data.meta?.totalItems || 0);
      } else if (response && response.data) {
        // Fallback for old API structure
        setParents(response.data);
        setTotalPages((response as any).totalPages || 1);
        setTotalRecords((response as any).totalRecords || 0);
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi tải danh sách phụ huynh');
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  };

  const deleteParent = async (parentId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      await deleteParentAPI(parentId);
      await fetchParents(); // Refresh parent list
      return { success: true, message: 'Xóa phụ huynh thành công!' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa phụ huynh'
      };
    } finally {
      setLoading(false);
    }
  };

  const getParentById = async (id: string): Promise<Parent | null> => {
    try {
      const response = await getParentByIdAPI(id);
      if (response && response.data && response.data.data) {
        return response.data.data as Parent;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const searchStudents = async (query: string): Promise<Student[]> => {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await getAllStudentsAPI({ name: query, limit: 10, page: 1 });

      // Handle new API response structure
      if (response && response.data && response.data.data) {
        return response.data.data.result || [];
      }

      // Fallback for old API structure
      return response?.data || [];
    } catch (error) {
      return [];
    }
  };

  const handlePageChange = (_event: React.SyntheticEvent, value: number): void => {
    setPage(value);
  };

  // Fetch parents when dependencies change
  useEffect(() => {
    fetchParents(page);
  }, [page, debouncedSearch]);

  return {
    parents,
    loading,
    loadingTable,
    error,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    fetchParents,
    getParentById,
    deleteParent,
    searchStudents,
    handlePageChange,
  };
};
