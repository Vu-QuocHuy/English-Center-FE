import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getPublicTeachersAPI } from '../../../services/teachers';
import { Teacher } from '../../../types';

const FeaturedTeachersHome = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<Slider>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch teachers from public API
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPublicTeachersAPI({ page: 1, limit: 100 });

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

        // Filter active teachers only
        const activeTeachers = teachersData.filter((teacher: any) => teacher.isActive !== false);

        setTeachers(activeTeachers);
      } catch (err) {
        console.error('Error fetching teachers:', err);
        setError('Không thể tải dữ liệu giáo viên');
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

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

  const handlePrevClick = () => {
    sliderRef.current?.slickPrev();
  };

  const handleNextClick = () => {
    sliderRef.current?.slickNext();
  };

  // Slider settings
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (teachers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Chưa có giáo viên nào
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', px: 4 }}>
      {/* Tiêu đề */}
      <Typography
        variant="h4"
        sx={{
          textAlign: 'center',
          mb: 4,
          color: '#000',
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
        }}
      >
        Đội ngũ giáo viên
      </Typography>

      {/* Navigation Arrows */}
      <Box sx={{ position: 'relative' }}>
        {/* Previous Button */}
        <IconButton
          onClick={handlePrevClick}
          sx={{
            position: 'absolute',
            left: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: 'grey.100',
            },
            '@media (max-width: 600px)': {
              left: -10,
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Next Button */}
        <IconButton
          onClick={handleNextClick}
          sx={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              bgcolor: 'grey.100',
            },
            '@media (max-width: 600px)': {
              right: -10,
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        {/* Slider */}
        <Box sx={{ px: 2 }}>
          <Slider ref={sliderRef} {...sliderSettings}>
            {teachers.map((teacher) => (
              <Box key={teacher.id} sx={{ px: 1 }}>
                <Card
                  onClick={() => handleTeacherClick(teacher)}
                  sx={{
                    height: 550,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }
                  }}
                >
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
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: 'bold', color: '#000', mb: 2 }}
                    >
                      {teacher.name}
                    </Typography>
                    <Box sx={{ flexGrow: 1, overflow: 'hidden', mb: 2 }}>
                      <Typography
                        variant="body1"
                        sx={{ 
                          lineHeight: 1.6, 
                          color: '#555',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word'
                        }}
                      >
                        {teacher.description || 'Chưa có mô tả'}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        mt: 'auto',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        flexShrink: 0,
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
              </Box>
            ))}
          </Slider>
        </Box>
      </Box>
    </Box>
  );
};

export default FeaturedTeachersHome;
