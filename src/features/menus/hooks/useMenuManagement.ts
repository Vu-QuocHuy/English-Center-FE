import { useState, useEffect } from 'react';
import { MenuItem } from '@shared/types';

interface UseMenuManagementReturn {
  menuItems: MenuItem[];
  loading: boolean;
  error: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchMenuItems: () => Promise<void>;
  createMenuItem: (data: any) => Promise<void>;
  updateMenuItem: (id: string, data: any) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleMenuItemActive: (id: string) => Promise<void>;
}

export const useMenuManagement = (): UseMenuManagementReturn => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchMenuItems = async (): Promise<void> => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call when backend is ready
      console.log('🍽️ Using mock menu data (API not implemented yet)');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock data for development
      const now = new Date().toISOString();
      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          slug: 'hero-section',
          title: 'Trang chủ',
          order: 1,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          childrenMenu: []
        },
        {
          id: '2',
          slug: 'about-section',
          title: 'Giới thiệu',
          order: 2,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          childrenMenu: []
        }
      ];

      // Filter by search query
      let filteredItems = mockMenuItems;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        filteredItems = mockMenuItems.filter((item: MenuItem) =>
          item.title.toLowerCase().includes(q) ||
          (item.slug || '').toLowerCase().includes(q)
        );
      }

      setMenuItems(filteredItems);

      console.log('✅ Mock menu items loaded successfully:', {
        count: filteredItems.length,
        totalItems: mockMenuItems.length
      });
    } catch (error: any) {
      console.error('❌ Error loading mock menu items:', error);
      setError('Có lỗi xảy ra khi tải danh sách menu');
    } finally {
      setLoading(false);
    }
  };

  const createMenuItem = async (data: any): Promise<void> => {
    try {
      console.log('Creating menu item:', data);
      // TODO: Implement API call
      const newItem: MenuItem = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMenuItems(prev => [...prev, newItem]);
    } catch (error: any) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  };

  const updateMenuItem = async (id: string, data: any): Promise<void> => {
    try {
      console.log('Updating menu item:', id, data);
      // TODO: Implement API call
      setMenuItems(prev => prev.map(item =>
        item.id === id
          ? { ...item, ...data, updatedAt: new Date().toISOString() }
          : item
      ));
    } catch (error: any) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (id: string): Promise<void> => {
    try {
      console.log('Deleting menu item:', id);
      // TODO: Implement API call
      setMenuItems(prev => prev.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  const toggleMenuItemActive = async (id: string): Promise<void> => {
    try {
      console.log('Toggling menu item active:', id);
      // TODO: Implement API call
      setMenuItems(prev => prev.map(item =>
        item.id === id
          ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString() }
          : item
      ));
    } catch (error: any) {
      console.error('Error toggling menu item active:', error);
      throw error;
    }
  };

  // Fetch menu items when dependencies change
  useEffect(() => {
    fetchMenuItems();
  }, [debouncedSearch]);

  return {
    menuItems,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemActive,
  };
};
