import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import { MenuItem } from '@shared/types';
import { useMenuItems } from '@features/menus';
import PublicLayout from '@shared/components/layouts/PublicLayout';
import AllTeachersPage from './AllTeachersPage';
import TestimonialsPage from './TestimonialsPage';
import SchedulePage from './SchedulePage';
import ArticleListTemplate from '@features/articles/components/ArticleListTemplate';


const DynamicMenuPage: React.FC = () => {
  console.log('🚀 DynamicMenuPage component mounted');
  const { slug, parentSlug, childSlug } = useParams<{ slug?: string; parentSlug?: string; childSlug?: string }>();
  console.log('📋 Route params:', { slug, parentSlug, childSlug });
  const { menuItems } = useMenuItems();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Combine slug from params - support both /:slug and /:parentSlug/:childSlug
  const fullSlug = childSlug ? `${parentSlug}/${childSlug}` : slug;

  console.log('🔍 DynamicMenuPage - fullSlug:', fullSlug, 'slug:', slug, 'parentSlug:', parentSlug, 'childSlug:', childSlug);

  // Check if this is a special page FIRST - before any loading/effects
  const normalizedSlug = fullSlug?.toLowerCase().trim().replace(/^\//, '');
  console.log('🔍 DynamicMenuPage - normalizedSlug:', normalizedSlug);
  
  // Check for special pages
  const isTeacherPage = normalizedSlug === 'teacher' || 
    normalizedSlug === 'giao-vien' ||
    normalizedSlug === 'doi-ngu-giang-vien' ||
    normalizedSlug === 'gioi-thieu/doi-ngu-giang-vien' ||
    normalizedSlug?.endsWith('/teacher') ||
    normalizedSlug?.endsWith('/giao-vien') ||
    normalizedSlug?.endsWith('/doi-ngu-giang-vien') ||
    normalizedSlug?.startsWith('teacher/') ||
    normalizedSlug?.startsWith('giao-vien/') ||
    normalizedSlug?.startsWith('doi-ngu-giang-vien/');

  const isTestimonialsPage = normalizedSlug === 'cam-nhan-hoc-vien' ||
    normalizedSlug?.includes('cam-nhan') ||
    normalizedSlug?.includes('testimonial');

  const isSchedulePage = normalizedSlug === 'lich-khai-giang' ||
    normalizedSlug?.includes('lich-khai-giang') ||
    normalizedSlug?.includes('schedule');

  console.log('🔍 DynamicMenuPage - Special pages:', { isTeacherPage, isTestimonialsPage, isSchedulePage });

  // Render special pages immediately
  if (isTeacherPage) {
    console.log('✅ Rendering AllTeachersPage');
    return <AllTeachersPage />;
  }

  if (isTestimonialsPage) {
    console.log('✅ Rendering TestimonialsPage');
    return <TestimonialsPage />;
  }

  if (isSchedulePage) {
    console.log('✅ Rendering SchedulePage');
    return <SchedulePage />;
  }
  
  console.log('❌ Not a special page, continuing with normal flow');

  useEffect(() => {
    const fetchMenuItem = async () => {
      if (!fullSlug) return;

      // ✅ Nếu menuItems chưa load (array rỗng), giữ loading state và chờ
      if (menuItems.length === 0) {
        setLoading(true);
        return;
      }

      try {
        setLoading(true);

        // Find menu item from existing menuItems data
        const foundMenuItem = findMenuItemBySlug(menuItems, fullSlug);

        if (foundMenuItem) {
          setMenuItem(foundMenuItem);
          setError(null); // Clear any previous error
        } else {
          // ✅ menuItems đã load nhưng không tìm thấy → Đây mới là lỗi thật
          setError('Không tìm thấy trang này');
        }

      } catch (error) {
        console.error('Error fetching menu item:', error);
        setError('Không tìm thấy trang này');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [fullSlug, menuItems]);

  // Helper function to find menu item by slug recursively
  const findMenuItemBySlug = (items: MenuItem[], targetSlug: string): MenuItem | null => {
    for (const item of items) {
      // Remove leading slash for comparison
      const itemSlug = item.slug?.replace(/^\//, '') || '';
      const cleanTargetSlug = targetSlug.replace(/^\//, '');

      if (itemSlug === cleanTargetSlug) {
        return item;
      }

      // Check children recursively
      if (item.childrenMenu && item.childrenMenu.length > 0) {
        const found = findMenuItemBySlug(item.childrenMenu, targetSlug);
        if (found) return found;
      }
    }
    return null;
  };







  // Show loading spinner while fetching data
  if (loading || (menuItems.length === 0 && !error)) {
    return (
      <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
      </PublicLayout>
    );
  }

  // Only show error if: has explicit error OR (menuItems loaded but menuItem not found)
  // But skip error if we're still loading or if it's a special page
  if ((error || (!menuItem && menuItems.length > 0)) && !isTeacherPage && !isTestimonialsPage && !isSchedulePage) {
    return (
      <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Không tìm thấy trang này'}
        </Alert>
        <Typography variant="h4" gutterBottom>
          Trang không tồn tại
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </Typography>
      </Container>
      </PublicLayout>
    );
  }

  // Render ArticleListTemplate for regular menu pages
  return (
    <PublicLayout>
      <ArticleListTemplate 
        menuId={menuItem?.id} 
        title={menuItem?.title}
      />
    </PublicLayout>
  );
};

export default DynamicMenuPage;
