import { useState, useEffect } from 'react';
import { getAllMenusAPI } from '@features/menus';
import { NavigationMenuItem } from '@shared/types';

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<NavigationMenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllMenusAPI();
        if (response.data?.data) {
          // Transform API data to match the new NavigationMenuItem shape
          const transformedItems: NavigationMenuItem[] = response.data.data.map((item: any) => {
            // API có thể trả về children hoặc childrenMenu
            const childrenArray = item.children || item.childrenMenu || [];

            return {
              id: item.id,
              slug: item.slug,
              title: item.title,
              order: item.order,
              isActive: item.isActive,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              deletedAt: item.deletedAt,
              childrenMenu: childrenArray.map((child: any) => ({
                id: child.id,
                slug: child.slug,
                title: child.title,
                order: child.order,
                isActive: child.isActive,
                createdAt: child.createdAt,
                updatedAt: child.updatedAt,
                deletedAt: child.deletedAt,
                childrenMenu: []
              }))
            };
          });
          setMenuItems(transformedItems);
        }
      } catch (error) {
        console.error('Error loading menu items:', error);
        setError('Failed to load menu items');
        // Fallback to empty array
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { menuItems, loading, error };
};
