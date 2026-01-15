import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Card, CardMedia, Box, Typography, IconButton, Button } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import type { Advertisement } from '@shared/types';

interface AdvertisementSliderProps {
  autoPlay?: boolean;
  interval?: number;
  ads: Advertisement[];
  showArrows?: boolean;
  showDots?: boolean;
  height?: number;
  onRegisterClick?: (classId: string | null, className: string) => void;
}

interface ArrowProps {
  style?: React.CSSProperties;
  onClick?: () => void;
}

// Custom arrow components, perfectly circular and icon centered
const NextArrow: React.FC<ArrowProps> = ({ style, onClick }) => {
  return (
    <IconButton
      style={{
        ...style,
        right: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        background: 'rgba(255,255,255,0.8)',
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        color: '#333',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClick}
      aria-label="next"
    >
      <ArrowForwardIos fontSize="medium" />
    </IconButton>
  );
};

const PrevArrow: React.FC<ArrowProps> = ({ style, onClick }) => {
  return (
    <IconButton
      style={{
        ...style,
        left: 16,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        background: 'rgba(255,255,255,0.8)',
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        color: '#333',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClick}
      aria-label="previous"
    >
      <ArrowBackIos fontSize="medium" />
    </IconButton>
  );
};

const AdvertisementSlider: React.FC<AdvertisementSliderProps> = ({
  autoPlay = true,
  interval = 8000,
  ads,
  showArrows = true,
  showDots = true,
  height,
  onRegisterClick
}) => {
  if (!ads || ads.length === 0) return null;

  // Sắp xếp theo priority tăng dần (priority nhỏ hơn là ưu tiên hơn), cùng priority thì createdAt tăng dần, lấy tối đa 5 quảng cáo
  const sortedAds = [...ads]
    .sort((a, b) => {
      if ((a.priority ?? 0) !== (b.priority ?? 0)) {
        return (a.priority ?? 0) - (b.priority ?? 0); // priority nhỏ hơn lên trước
      }
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  // Nếu chỉ có 1 banner thì hiển thị dạng tĩnh, không dùng slider để tránh cảm giác bị lặp
  if (sortedAds.length === 1) {
    const ad = sortedAds[0];
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          ...(height ? { height, minHeight: height } : { aspectRatio: '16/9' }),
        }}
      >
        <Card
          sx={{
            height: '100%',
            position: 'relative',
            borderRadius: 0,
            overflow: 'hidden',
          }}
        >
          <CardMedia
            component="img"
            image={ad.imageUrl || ad.image}
            alt={ad.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              color: 'white',
              p: { xs: 2.5, md: 4 },
              minHeight: { xs: '180px', md: '220px' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 1.5,
                lineHeight: 1.2,
              }}
            >
              {ad.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                opacity: 0.9,
                fontSize: { xs: '0.9rem', md: '1rem' },
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {ad.content || ad.description}
            </Typography>
            {onRegisterClick && (
              <Button
                variant="contained"
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegisterClick((ad as any).class?.id || (ad as any).classId || null, ad.title);
                }}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  px: 4,
                  py: 1.2,
                  borderRadius: 999,
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
              >
                Đăng ký ngay
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    );
  }

  const settings = {
    dots: showDots,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: showArrows,
    autoplay: autoPlay,
    autoplaySpeed: interval,
    cssEase: 'ease' as const,
    nextArrow: showArrows ? <NextArrow /> : undefined,
    prevArrow: showArrows ? <PrevArrow /> : undefined,
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        ...(height ? { height, minHeight: height } : { aspectRatio: '16/9' }),
      }}
    >
      <Slider {...settings}>
        {sortedAds.map((ad, idx) => (
          <Box
            key={ad.id || idx}
            sx={{
              position: 'relative',
              width: '100%',
              ...(height ? { height, minHeight: height } : { aspectRatio: '16/9' }), // If height provided, use it; otherwise keep ratio
              overflow: 'hidden',
              '@media (max-width: 768px)': {
                ...(height ? { height: Math.max(height * 0.7, 400), minHeight: Math.max(height * 0.7, 400) } : { aspectRatio: '16/9' }), // Responsive height on mobile
              }
            }}
          >
            <Card
              sx={{
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                borderRadius: 0,
                overflow: 'hidden',
              }}
            >
              <CardMedia
                component="img"
                image={ad.imageUrl || ad.image}
                alt={ad.title}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center' // Crop đều cả trên và dưới
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                color: 'white',
                p: { xs: 2.5, md: 4 },
                minHeight: { xs: '180px', md: '220px' }, // Ensure minimum height for content
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    mb: 1.5,
                    lineHeight: 1.2
                  }}
                >
                  {ad.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    opacity: 0.9,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {ad.content || ad.description}
                </Typography>
                {onRegisterClick && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegisterClick((ad as any).class?.id || (ad as any).classId || null, ad.title);
                    }}
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)',
                      '&:hover': {
                        bgcolor: 'error.dark',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(211, 47, 47, 0.6)',
                      },
                      transition: 'all 0.3s ease',
                      alignSelf: 'flex-start'
                    }}
                  >
                    ĐĂNG KÝ NGAY
                  </Button>
                )}
              </Box>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default AdvertisementSlider;