import { useState, useEffect, useCallback } from 'react';
import { getAllStaffAPI, deleteStaffAPI, getStaffByIdAPI } from '../../services/users';
import { Staff } from '../../types';

interface UseStaffManagementReturn {
  staffs: Staff[];
  selectedStaff: Staff | null;
  loading: boolean;
  loadingTable: boolean;
  loadingDetail: boolean;
  error: string;
  page: number;
  totalPages: number;
  totalRecords: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchStaffs: (pageNum?: number) => Promise<void>;
  getStaffById: (id: string) => Promise<Staff | null>;
  deleteStaff: (id: string) => Promise<{ success: boolean; message: string }>;
  handlePageChange: (event: any, value: number) => void;
}

export const useStaffManagement = (): UseStaffManagementReturn => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
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

  const fetchStaffs = useCallback(async (pageNum: number = 1): Promise<void> => {
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

      const response = await getAllStaffAPI(params);

      console.log('📊 Staff API Response:', response);

      // Handle paginated API response structure
      if (response && response.data && response.data.data) {
        const { data } = response.data;
        const staffsArray = data.result || [];
        setStaffs(staffsArray);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalRecords(data.meta?.totalItems || 0);
      } else if (response && response.data) {
        // Fallback for old API structure
        setStaffs(response.data);
        setTotalPages(response.data?.totalPages || 1);
        setTotalRecords(response.data?.totalRecords || 0);
      }
    } catch (error) {
      console.error('Error fetching staffs:', error);
      setError('Có lỗi xảy ra khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  }, [debouncedSearch]);

  const deleteStaff = useCallback(async (staffId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      await deleteStaffAPI(staffId);
      await fetchStaffs(); // Refresh staff list
      return { success: true, message: 'Xóa nhân viên thành công!' };
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa nhân viên'
      };
    } finally {
      setLoading(false);
    }
  }, [fetchStaffs]);

  const handlePageChange = useCallback((_event: any, value: number): void => {
    setPage(value);
  }, []);

  // Get staff by ID
  const getStaffById = useCallback(async (id: string): Promise<Staff | null> => {
    setLoadingDetail(true);
    try {
      const response = await getStaffByIdAPI(id);
      console.log('📊 Staff Detail API Response:', response);

      if (response && response.data && response.data.data) {
        const staff = response.data.data;
        setSelectedStaff(staff);
        return staff;
      }
      return null;
    } catch (error: any) {
      console.error('❌ Error fetching staff detail:', error);
      setError(error.response?.data?.message || 'Không thể tải thông tin nhân viên');
      return null;
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Fetch staffs when dependencies change
  useEffect(() => {
    fetchStaffs(page);
  }, [page, debouncedSearch, fetchStaffs]);

  return {
    staffs,
    selectedStaff,
    loading,
    loadingTable,
    loadingDetail,
    error,
    page,
    totalPages,
    totalRecords,
    searchQuery,
    setSearchQuery,
    fetchStaffs,
    getStaffById,
    deleteStaff,
    handlePageChange,
  };
};
