import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { Card, CardContent, Avatar, Typography, Box, Button, IconButton, CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { getFeedbacksAPI } from '../../../services/feedback';
import { Feedback } from '../../../types';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AVATAR_SIZE = 110;
const AVATAR_BORDER = 4;
const AVATAR_MARGIN = 12;

// Helper function to get social media icon based on URL
const getSocialIcon = (url: string) => {
  const domain = url.toLowerCase();

  if (domain.includes('facebook.com') || domain.includes('fb.com')) {
    return (
      <svg
        fill="#1877F2"
        strokeWidth="0"
        viewBox="0 0 16 16"
        style={{ width: 20, height: 20, marginLeft: 4 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"></path>
      </svg>
    );
  }

  if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
    return (
      <svg
        fill="#FF0000"
        strokeWidth="0"
        viewBox="0 0 24 24"
        style={{ width: 20, height: 20, marginLeft: 4 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    );
  }

  if (domain.includes('tiktok.com')) {
    return (
      <svg
        fill="#000000"
        strokeWidth="0"
        viewBox="0 0 24 24"
        style={{ width: 20, height: 20, marginLeft: 4 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    );
  }

  if (domain.includes('instagram.com')) {
    return (
      <svg
        fill="#E4405F"
        strokeWidth="0"
        viewBox="0 0 24 24"
        style={{ width: 20, height: 20, marginLeft: 4 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    );
  }

  if (domain.includes('twitter.com') || domain.includes('x.com')) {
    return (
      <svg
        fill="#000000"
        strokeWidth="0"
        viewBox="0 0 24 24"
        style={{ width: 20, height: 20, marginLeft: 4 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    );
  }

  // Default icon for other domains
  return (
    <svg
      fill="#6c757d"
      strokeWidth="0"
      viewBox="0 0 16 16"
      style={{ width: 20, height: 20, marginLeft: 4 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  );
};

const FeedbackCard = ({ feedback }: { feedback: Feedback }) => (
  <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
    {/* Avatar nằm ngoài card, không che nội dung */}
    <Box
      sx={{
        width: AVATAR_SIZE + AVATAR_BORDER * 2,
        height: AVATAR_SIZE + AVATAR_BORDER * 2,
        borderRadius: "50%",
        bgcolor: "#fff",
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: `-${AVATAR_SIZE / 2 + AVATAR_MARGIN / 2}px`, // kéo card lên gần avatar
        zIndex: 2,
        position: "relative"
      }}
    >
      <Avatar
        src={feedback.imageUrl}
        alt={feedback.name}
        sx={{
          width: AVATAR_SIZE,
          height: AVATAR_SIZE,
          border: `${AVATAR_BORDER}px solid #e53935`,
          background: "#fff"
        }}
      >
        {feedback.name?.charAt(0)?.toUpperCase()}
      </Avatar>
    </Box>
    <Card
      sx={{
        border: "2px solid #e53935",
        borderRadius: 3,
        height: 510,
        pt: `${AVATAR_SIZE / 2 + AVATAR_MARGIN}px`, // đủ lớn để không bị che
        px: 2,
        boxShadow: "0 2px 8px rgba(229,57,53,0.08)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#fff",
        width: "100%",
        position: "relative"
      }}
    >
      <CardContent sx={{ width: "100%", p: 0, pb: 1, display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
        <Box sx={{ flexGrow: 1, overflow: 'hidden', mb: 1 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: "justify", 
              fontSize: '1.1rem', 
              lineHeight: 1.6,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 13,
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word'
            }}
          >
            {feedback.description}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 'auto', flexShrink: 0 }}>
          <Typography variant="h6" sx={{ color: "#e53935", fontWeight: "bold" }}>
            {feedback.name}
          </Typography>
          {feedback.socialUrl && (
            <Button
              href={feedback.socialUrl}
              target="_blank"
              sx={{ color: "#1976d2", textTransform: "none", fontWeight: 600, ml: 1 }}
            >
              Xem
              {getSocialIcon(feedback.socialUrl)}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  </Box>
);

const FeedbackHome = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<any>();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch feedbacks from API
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await getFeedbacksAPI();
        if (response.data?.data?.result) {
          setFeedbacks(response.data.data.result);
        } else {
          setFeedbacks([]);
        }
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError('Không thể tải dữ liệu đánh giá');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Khi slider chuyển
  const handleBeforeChange = (_oldIndex: number, _newIndex: number) => {
    // Handle slide change if needed
  };

  // Xử lý điều hướng mũi tên
  const handlePrev = () => {
    sliderRef.current?.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current?.slickNext();
  };

  const settings = {
    dots: false,
    infinite: feedbacks.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, feedbacks.length),
    slidesToScroll: 1,
    arrows: false,
    beforeChange: handleBeforeChange,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, feedbacks.length),
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
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

  if (feedbacks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Chưa có đánh giá nào
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
        Phụ huynh và học sinh nói gì sau khóa học
      </Typography>

      {/* Mũi tên trái */}
      {feedbacks.length > 3 && (
        <IconButton
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: '#f5f5f5 !important',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: 48,
            height: 48,
            '&:hover': {
              bgcolor: '#e0e0e0 !important',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            },
            '&:active': {
              bgcolor: '#d0d0d0 !important',
            },
            '&:focus': {
              bgcolor: '#f5f5f5 !important',
              outline: 'none',
            },
            '@media (max-width: 600px)': {
              left: 8,
            }
          }}
        >
          <ChevronLeft sx={{ color: '#e53935', fontSize: 28 }} />
        </IconButton>
      )}

      {/* Mũi tên phải */}
      {feedbacks.length > 3 && (
        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            bgcolor: '#f5f5f5 !important',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: 48,
            height: 48,
            '&:hover': {
              bgcolor: '#e0e0e0 !important',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            },
            '&:active': {
              bgcolor: '#d0d0d0 !important',
            },
            '&:focus': {
              bgcolor: '#f5f5f5 !important',
              outline: 'none',
            },
            '@media (max-width: 600px)': {
              right: 8,
            }
          }}
        >
          <ChevronRight sx={{ color: '#e53935', fontSize: 28 }} />
        </IconButton>
      )}

      <Slider
        {...settings}
        ref={sliderRef}
        className="feedback-home-slider"
      >
        {feedbacks.map((feedback) => (
          <FeedbackCard feedback={feedback} key={feedback.id} />
        ))}
      </Slider>

      {/* Nút xem tất cả đánh giá */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/cam-nhan-hoc-vien')}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#e53935',
            color: '#e53935',
            '&:hover': {
              borderColor: '#c62828',
              bgcolor: 'rgba(229, 57, 53, 0.04)',
            },
          }}
        >
          Xem tất cả đánh giá
        </Button>
      </Box>
    </Box>
  );
};

export default FeedbackHome;
