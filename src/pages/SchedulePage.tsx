import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  School as SchoolIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import PublicLayout from '../components/layouts/PublicLayout';
import { getPublicClassesAPI } from '../services/classes';
import { getArticlesByMenuIdAPI } from '../services/articles';
import { useMenuItems } from '../hooks/features/useMenuItems';
import { MenuItem } from '../types';
import ClassRegistrationModal from '../components/features/home/ClassRegistrationModal';

interface Class {
  id: string;
  name: string;
  description?: string;
  grade: number;
  section: number;
  year: number;
  schedule?: {
    start_date: string;
    end_date: string;
    days_of_week: string[];
    time_slots: {
      start_time: string;
      end_time: string;
    };
  };
  feePerLesson?: number;
  max_student?: number;
  status: string;
  room?: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

const SchedulePage: React.FC = () => {
  const location = useLocation();
  const { menuItems } = useMenuItems();
  const [classes, setClasses] = useState<Class[]>([]);
  const [articles, setArticles] = useState<any[]>([]); // Articles for banner/intro content
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false); // Control showing all classes or just first 2 rows
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>('');

  // Get slug from current pathname (remove leading slash)
  const fullSlug = location.pathname.replace(/^\//, '');

  // Find menu item by slug
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Find menu item for articles (optional)
        const foundMenuItem = menuItems.length > 0 ? findMenuItemBySlug(menuItems, fullSlug) : null;

        // Fetch articles for banner/intro content (optional)
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
            console.log('No articles found for this menu, continuing without banner/intro');
            setArticles([]);
          }
        }

        // Fetch upcoming classes from public API
        // API already filters by status: 'upcoming' on backend
        const response = await getPublicClassesAPI({
          page: 1,
          limit: 100,
        });

        const classesData = response.data?.data?.result || response.data?.data || [];
        setClasses(classesData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err?.response?.data?.message || 'Không thể tải dữ liệu');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fullSlug, menuItems]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa xác định';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDateRange = (classItem: Class): string => {
    if (!classItem.schedule) return '';
    const start = formatDate(classItem.schedule.start_date);
    const end = formatDate(classItem.schedule.end_date);
    return `${start} - ${end}`;
  };

  const formatDaysOfWeek = (schedule: any): string => {
    if (!schedule || !schedule.days_of_week || !Array.isArray(schedule.days_of_week)) {
      return 'Liên hệ';
    }

    const daysMap: { [key: string]: string } = {
      '0': 'CN',
      '1': 'T2',
      '2': 'T3',
      '3': 'T4',
      '4': 'T5',
      '5': 'T6',
      '6': 'T7'
    };

    return schedule.days_of_week
      .map((day: string) => daysMap[day.toString()] || day)
      .join(', ');
  };

  const formatTimeSlots = (schedule: any): string => {
    if (!schedule || !schedule.time_slots) {
      return 'Liên hệ';
    }

    if (typeof schedule.time_slots === 'object' && schedule.time_slots.start_time && schedule.time_slots.end_time) {
      return `${schedule.time_slots.start_time} - ${schedule.time_slots.end_time}`;
    }

    return 'Liên hệ';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return 'success';
      case 'upcoming':
        return 'info';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Đang học';
      case 'upcoming':
        return 'Sắp khai giảng';
      case 'closed':
        return 'Đã kết thúc';
      default:
        return status;
    }
  };

  const handleRegisterClick = (classId: string | null, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        </Container>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
        {/* Articles content (Banner/Intro) */}
        {articles.length > 0 && (
          <Box sx={{ width: '100%' }}>
            {articles.map((article, index) => (
              <Box key={article.id || index}>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </Box>
            ))}
          </Box>
        )}

        {/* Classes Grid - Always show container, even if no classes */}
        <Container maxWidth="lg" sx={{ pb: 6, pt: articles.length > 0 ? 4 : 8 }}>
          {classes.length === 0 ? (
            <Box textAlign="center" py={8}>
              <SchoolIcon sx={{ fontSize: 80, color: '#bbb', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có lớp sắp khai giảng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hiện tại chưa có lớp học nào sắp khai giảng. Vui lòng quay lại sau.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {(showAll ? classes : classes.slice(0, 6)).map((classItem) => (
                  <Grid item xs={12} sm={6} md={4} key={classItem.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          borderColor: '#1976d2',
                        },
                      }}
                    >
                      {/* Card Header */}
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          p: 2.5,
                          borderBottom: '1px solid #e0e0e0',
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography variant="h6" fontWeight={600} color="text.primary">
                              Lớp {classItem.name}
                            </Typography>
                            <Chip
                              label={`Khối ${classItem.grade}`}
                              size="small"
                              sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                fontWeight: 500,
                              }}
                            />
                          </Box>
                          <Chip
                            label={getStatusLabel(classItem.status)}
                            size="small"
                            color={getStatusColor(classItem.status)}
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          {/* Lịch học */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Lịch học:</strong> {formatDaysOfWeek(classItem.schedule)}
                            </Typography>
                          </Box>

                          {/* Giờ học */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Giờ học:</strong> {formatTimeSlots(classItem.schedule)}
                            </Typography>
                          </Box>

                          {/* Phòng học */}
                          {classItem.room && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Phòng:</strong> {classItem.room}
                              </Typography>
                            </Box>
                          )}

                          {/* Sĩ số */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Sĩ số tối đa:</strong> {classItem.max_student || 'N/A'} học sinh
                            </Typography>
                          </Box>

                          {/* Học phí */}
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Học phí:</strong> {formatCurrency(classItem.feePerLesson)}/buổi
                            </Typography>
                          </Box>

                          {/* Giáo viên */}
                          {classItem.teacher && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Giáo viên:</strong> {classItem.teacher.name}
                              </Typography>
                            </Box>
                          )}

                          {/* Thời gian khóa học */}
                          {classItem.schedule && (
                            <Box sx={{ mb: 1.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Thời gian:</strong> {getDateRange(classItem)}
                              </Typography>
                            </Box>
                          )}

                          {/* Mô tả - xuống cuối */}
                          {classItem.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                p: 1.5,
                                bgcolor: '#fafafa',
                                borderRadius: 1,
                                lineHeight: 1.6,
                                fontStyle: 'italic',
                              }}
                            >
                              {classItem.description}
                            </Typography>
                          )}
                        </Box>

                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleRegisterClick(classItem.id, classItem.name)}
                          sx={{
                            bgcolor: '#1976d2',
                            '&:hover': {
                              bgcolor: '#1565c0',
                            },
                            fontWeight: 500,
                            textTransform: 'none',
                            py: 1,
                          }}
                        >
                          Đăng ký ngay
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Show More / Show Less Button */}
              {classes.length > 6 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setShowAll(!showAll)}
                    endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                      },
                    }}
                  >
                    {showAll ? 'Thu gọn' : `Xem thêm ${classes.length - 6} khóa học`}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Registration Modal */}
      <ClassRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classId={selectedClassId}
        className={selectedClassName}
      />
    </PublicLayout>
  );
};

export default SchedulePage;
