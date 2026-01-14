import React from 'react';
import { Dialog, IconButton, Box, Card, CardMedia, Typography, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Advertisement } from '@shared/types';

interface WelcomeAdPopupProps {
  open: boolean;
  onClose: () => void;
  ads: Advertisement[];
  width?: number;
  height?: number;
  onRegisterClick?: (classId: string | null, className: string) => void;
}

const WelcomeAdPopup: React.FC<WelcomeAdPopupProps> = ({ open, onClose, ads, height = 450, onRegisterClick }) => {
  if (!ads || !Array.isArray(ads) || ads.length === 0) return null;

  // Chọn quảng cáo có priority nhỏ nhất, nếu cùng priority thì lấy createdAt sớm nhất
  const welcomeAd = [...ads].sort((a, b) => {
    if ((a.priority ?? 0) !== (b.priority ?? 0)) {
      return (a.priority ?? 0) - (b.priority ?? 0);
    }
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateA.getTime() - dateB.getTime();
  })[0];

  if (!welcomeAd) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
            borderRadius: 1,
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
            width: { xs: '90%', sm: '100%' },
            border: 'none',
            ...(height ? { height } : { aspectRatio: '4/3' }),
        },
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          animation: 'fadeInScale 0.4s ease-out',
          '@keyframes fadeInScale': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.95)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 10,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              width: 32,
              height: 32,
              boxShadow: 'none',
              border: 'none',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
              transition: 'background 0.2s',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Card
          sx={{
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              position: 'relative',
              width: '100%',
              border: 'none',
              ...(height ? { height } : { aspectRatio: '4/3' }),
          }}
        >
          <CardMedia
            component="img"
            image={welcomeAd.imageUrl || welcomeAd.image}
            alt={welcomeAd.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Overlay for text - Clean and minimal */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
              color: 'white',
              p: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                mb: 1,
                lineHeight: 1.3,
              }}
            >
              {welcomeAd.title}
            </Typography>

            {welcomeAd.content || welcomeAd.description ? (
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.95)',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  mb: onRegisterClick ? 2 : 0,
                }}
              >
                {welcomeAd.content || welcomeAd.description}
              </Typography>
            ) : null}
            {onRegisterClick && (
              <Button
                variant="contained"
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegisterClick((welcomeAd as any).class?.id || (welcomeAd as any).classId || null, welcomeAd.title);
                }}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)',
                  '&:hover': {
                    bgcolor: 'error.dark',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(211, 47, 47, 0.6)',
                  },
                  transition: 'all 0.3s ease',
                  mt: 1,
                  alignSelf: 'flex-start',
                }}
              >
                ĐĂNG KÝ NGAY
              </Button>
            )}
          </Box>
        </Card>
      </Box>
    </Dialog>
  );
};

export default WelcomeAdPopup;