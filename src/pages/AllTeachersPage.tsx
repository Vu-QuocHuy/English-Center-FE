import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Container,
  Grid,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllTeachersAPI, getPublicTeachersAPI } from '@features/teachers';
import { getArticlesByMenuIdAPI } from '@features/articles';
import { useMenuItems } from '@features/menus';
import { Teacher, MenuItem } from '@shared/types';
import PublicLayout from '@shared/components/layouts/PublicLayout';

const AllTeachersPage = () => {
  console.log('🎯 AllTeachersPage component rendered');
  const navigate = useNavigate();
  const location = useLocation();
  const { menuItems } = useMenuItems();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  console.log('📊 Current state:', { loading, teachersCount: teachers.length, error, showAll });

  const INITIAL_DISPLAY_COUNT = 8; // 2 hàng x 4 cột

  const fullSlug = location.pathname.replace(/^\//, '');

  // Always fetch teachers, regardless of menuItems or fullSlug
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        console.log('🔄 Fetching teachers...');
        setLoading(true);
        setError(null);

        // Try public API first, fallback to authenticated API if needed
        let response;
        try {
          response = await getPublicTeachersAPI({
            page: 1,
            limit: 100, // Lấy nhiều để hiển thị tất cả khi cần
          });
        } catch (publicError) {
          console.log('Public API failed, trying authenticated API...', publicError);
          // Fallback to authenticated API if public API doesn't exist
          response = await getAllTeachersAPI({
            page: 1,
            limit: 100,
          });
        }

        console.log('✅ Teachers API response:', response);

        // Handle different response formats
        let teachersData = [];
        if (response.data?.data?.result) {
          teachersData = response.data.data.result;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          teachersData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          teachersData = (response.data as any).result || (response.data as any).teachers || [];
        } else if (Array.isArray(response.data)) {
          teachersData = response.data;
        }

        console.log('📊 Teachers data extracted:', teachersData);

        // Filter active teachers only
        const activeTeachers = teachersData.filter((teacher: any) => teacher.isActive !== false);

        console.log('👥 Active teachers:', activeTeachers.length);

        setTeachers(activeTeachers);
      } catch (teacherError: any) {
        console.error('❌ Error fetching teachers:', teacherError);
        console.error('Error details:', teacherError?.response?.data || teacherError?.message);
        setError(teacherError?.response?.data?.message || 'Không thể tải dữ liệu giáo viên');
        setTeachers([]);
      } finally {
        console.log('🏁 Finished fetching teachers');
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []); // Only run once on mount

  const findMenuItemBySlug = (items: MenuItem[], targetSlug: string): MenuItem | null => {
    for (const item of items) {
      const itemSlug = item.slug?.replace(/^\//, '') || '';
      const cleanTargetSlug = targetSlug.replace(/^\//, '');

      if (itemSlug === cleanTargetSlug) {
        return item;
      }

      if (item.childrenMenu && item.childrenMenu.length > 0) {
        const found = findMenuItemBySlug(item.childrenMenu, targetSlug);
        if (found) return found;
      }
    }
    return null;
  };

  // Fetch articles if menu items are available (separate from teachers fetch)
  useEffect(() => {
    const fetchArticles = async () => {
      if (fullSlug && menuItems.length > 0) {
        const foundMenuItem = findMenuItemBySlug(menuItems, fullSlug);

        if (foundMenuItem?.id) {
          try {
            const articlesResponse = await getArticlesByMenuIdAPI(foundMenuItem.id);
            if (articlesResponse.data?.data?.result) {
              const sortedArticles = articlesResponse.data.data.result
                .filter((article: any) => article.isActive !== false)
                .sort((a: any, b: any) => {
                  if (a.order !== b.order) {
                    return (a.order || 999) - (b.order || 999);
                  }
                  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                });
              setArticles(sortedArticles);
            }
          } catch (articleError) {
            console.log('No articles found for this menu');
            setArticles([]);
          }
        }
      }
    };

    fetchArticles();
  }, [fullSlug, menuItems]);

  // Function to convert name to URL-friendly slug
  const createSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  };

  const handleTeacherClick = (teacher: Teacher) => {
    const slug = createSlug(teacher.name);
    navigate(`/gioi-thieu/doi-ngu-giang-vien/${slug}`, { state: { teacherId: teacher.id } });
  };

  // Helper function to format qualifications
  const formatQualifications = (qualifications: string[]) => {
    if (!qualifications || qualifications.length === 0) return 'Chưa có thông tin';
    return qualifications.join(', ');
  };

  // Determine which teachers to display
  const displayedTeachers = showAll ? teachers : teachers.slice(0, INITIAL_DISPLAY_COUNT);
  const hasMore = teachers.length > INITIAL_DISPLAY_COUNT;

  console.log('🎨 Rendering with:', { loading, teachersCount: teachers.length, displayedCount: displayedTeachers.length, error });

  if (loading) {
    console.log('⏳ Showing loading spinner');
    return (
      <PublicLayout>
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
          <Typography sx={{ mt: 2 }}>Đang tải danh sách giáo viên...</Typography>
        </Box>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  if (teachers.length === 0) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Chưa có giáo viên nào
            </Typography>
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
        {/* Articles content */}
        {articles.length > 0 && (
          <Box sx={{ width: '100%' }}>
            {articles.map((article, index) => (
              <Box key={article.id || index}>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </Box>
            ))}
          </Box>
        )}

        <Container maxWidth="lg" sx={{ pb: 6, pt: articles.length > 0 ? 4 : 8 }}>
          {/* Grid hiển thị giáo viên */}
        <Grid container spacing={3}>
          {displayedTeachers.map((teacher) => (
            <Grid item xs={12} sm={6} md={3} key={teacher.id}>
              <Card
                onClick={() => handleTeacherClick(teacher)}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 1,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                {/* Avatar */}
                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                  {teacher.avatar ? (
                    <CardMedia
                      component="img"
                      image={teacher.avatar}
                      alt={teacher.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        color: 'grey.500',
                        fontSize: '3rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {teacher.name.charAt(0).toUpperCase()}
                    </Box>
                  )}
                </Box>

                {/* Content */}
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h3"
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      fontSize: '1.1rem',
                      mb: 1
                    }}
                  >
                    {teacher.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1, fontSize: '0.85rem' }}
                  >
                    <strong>Bằng cấp:</strong> {formatQualifications(teacher.qualifications)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      fontSize: '0.85rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {teacher.description || 'Chưa có mô tả'}
                  </Typography>

                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 'auto',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white'
                      }
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Nút "Xem thêm" hoặc "Thu gọn" */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setShowAll(!showAll)}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                }
              }}
            >
              {showAll ? 'Thu gọn' : `Xem thêm (${teachers.length - INITIAL_DISPLAY_COUNT} giáo viên)`}
            </Button>
          </Box>
        )}
        </Container>
      </Box>
    </PublicLayout>
  );
};

export default AllTeachersPage;
