import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
} from '@mui/icons-material';
import { useFooterSettings } from '@features/footer-settings';

const Footer: React.FC = () => {
  const { footerSettings: settings } = useFooterSettings();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a1a1a',
        color: 'white',
        py: 6,
        mt: 'auto',
        borderTop: '4px solid #f62724',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Cột 1: Về chúng tôi */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
              {settings.companyName}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8, color: '#ccc' }}>
              {settings.description || 'Trung tâm Anh ngữ chất lượng cao với đội ngũ giáo viên giàu kinh nghiệm.'}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 1.5 }}>
                Theo dõi chúng tôi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <IconButton
                  component={settings.facebookUrl ? 'a' : 'div'}
                  href={settings.facebookUrl || undefined}
                  target={settings.facebookUrl ? '_blank' : undefined}
                  rel={settings.facebookUrl ? 'noopener noreferrer' : undefined}
                  sx={{
                    color: 'white',
                    bgcolor: settings.facebookUrl ? '#3b5998' : '#555',
                    '&:hover': settings.facebookUrl
                      ? { bgcolor: '#2d4373', transform: 'scale(1.1)' }
                      : { bgcolor: '#555' },
                    transition: 'all 0.3s',
                    width: 40,
                    height: 40,
                    cursor: settings.facebookUrl ? 'pointer' : 'default',
                    opacity: settings.facebookUrl ? 1 : 0.5,
                  }}
                >
                  <FacebookIcon fontSize="small" />
                </IconButton>
                <IconButton
                  component={settings.youtubeUrl ? 'a' : 'div'}
                  href={settings.youtubeUrl || undefined}
                  target={settings.youtubeUrl ? '_blank' : undefined}
                  rel={settings.youtubeUrl ? 'noopener noreferrer' : undefined}
                  sx={{
                    color: 'white',
                    bgcolor: settings.youtubeUrl ? '#ff0000' : '#555',
                    '&:hover': settings.youtubeUrl ? { bgcolor: '#cc0000', transform: 'scale(1.1)' } : { bgcolor: '#555' },
                    transition: 'all 0.3s',
                    width: 40,
                    height: 40,
                    cursor: settings.youtubeUrl ? 'pointer' : 'default',
                    opacity: settings.youtubeUrl ? 1 : 0.5,
                  }}
                >
                  <YouTubeIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          {/* Cột 2: Thông tin liên hệ (ĐỘNG) */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Address */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 0.2,
                  }}
                >
                  <LocationIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                    Địa chỉ
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {settings.address || 'Chưa cập nhật'}
                  </Typography>
                </Box>
              </Box>

              {/* Phone */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhoneIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                    Điện thoại
                  </Typography>
                  <Link
                    href={settings.phone ? `tel:${settings.phone.replace(/\s/g, '')}` : undefined}
                    sx={{
                      color: '#ccc',
                      textDecoration: 'none',
                      '&:hover': { color: '#f62724' },
                      fontSize: '0.875rem',
                      display: 'block',
                    }}
                  >
                    {settings.phone || 'Chưa cập nhật'}
                  </Link>
                </Box>
              </Box>

              {/* Email */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmailIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                    Email
                  </Typography>
                  <Link
                    href={settings.email ? `mailto:${settings.email}` : undefined}
                    sx={{
                      color: '#ccc',
                      textDecoration: 'none',
                      '&:hover': { color: '#f62724' },
                      fontSize: '0.875rem',
                      display: 'block',
                      wordBreak: 'break-word',
                    }}
                  >
                    {settings.email || 'Chưa cập nhật'}
                  </Link>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Cột 3: Bản đồ */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
              Bản đồ
            </Typography>
            {settings.mapEmbedUrl && settings.mapEmbedUrl.includes('google.com/maps/embed') ? (
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.1)',
                }}
              >
                <iframe
                  src={settings.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map Location"
                />
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                Bản đồ chưa được cấu hình
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: '#999' }}>
            © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
