import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Divider,
  Paper,
  Grid,
  Skeleton,
  Button
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getPublicTeacherByIdAPI, getTeacherBySlugAPI, getTypicalTeacherDetailAPI } from '@features/teachers';
import { Teacher } from '@shared/types';
import PublicLayout from '@shared/components/layouts/PublicLayout';

const TeacherDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to top when component mounts or slug/teacherId changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, location.state?.teacherId]);

  useEffect(() => {
    const fetchTeacher = async () => {
      // Get teacher ID from location state (if available)
      const teacherId = location.state?.teacherId;
      const isTypical = location.state?.isTypical === true;

      if (teacherId) {
        // If we have the teacher ID from navigation state, try typical endpoint first when hinted
        try {
          setLoading(true);
          let response: any;
          if (isTypical) {
            response = await getTypicalTeacherDetailAPI(teacherId);
          } else {
            // Use public API for teacher detail
            response = await getPublicTeacherByIdAPI(teacherId);
          }
          setTeacher(response.data?.data || response.data);
        } catch (err) {
          // Fallback to public API if typical endpoint fails
          try {
            const fallback = await getPublicTeacherByIdAPI(teacherId);
            setTeacher(fallback.data?.data || fallback.data);
          } catch (innerErr) {
            console.error('Error fetching teacher detail:', innerErr);
            setError('Không thể tải thông tin giáo viên');
          }
        } finally {
          setLoading(false);
        }
      } else if (slug) {
        // If no teacher ID in state, try to find teacher by slug
        try {
          setLoading(true);
          const response = await getTeacherBySlugAPI(slug);
          setTeacher(response.data?.data || response.data);
        } catch (err) {
          console.error('Error fetching teacher by slug:', err);
          setError('Không thể tải thông tin giáo viên');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Không tìm thấy thông tin giáo viên');
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [slug, location.state]);

  const formatQualifications = (qualifications: string[]) => {
    if (!qualifications || qualifications.length === 0) return [];
    return qualifications;
  };

  const formatSpecializations = (specializations: string[]) => {
    if (!specializations || specializations.length === 0) return [];
    return specializations;
  };

  if (loading) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Skeleton variant="rectangular" height={400} />
              <Skeleton variant="text" sx={{ fontSize: '2rem', mt: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '1rem', mt: 1 }} />
            </Grid>
            <Grid item xs={12} md={8}>
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" sx={{ fontSize: '1.5rem', mb: 2 }} />
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          </Grid>
        </Container>
      </PublicLayout>
    );
  }

  if (error || !teacher) {
    return (
      <PublicLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" color="error" textAlign="center">
            {error || 'Không tìm thấy thông tin giáo viên'}
          </Typography>
        </Container>
      </PublicLayout>
    );
  }

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to teachers list page if no history
      navigate('/gioi-thieu/doi-ngu-giang-vien');
    }
  };

  return (
    <PublicLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Quay lại button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{
            mb: 4,
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          Quay lại
        </Button>

      <Grid container spacing={4}>
        {/* Left Column - Profile */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            {/* Profile Picture */}
            <Box sx={{ mb: 3 }}>
              {teacher.avatar ? (
                <Box
                  component="img"
                  src={teacher.avatar}
                  alt={teacher.name}
                  sx={{
                    width: 300,
                    height: 400,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: 1,
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 300,
                    height: 400,
                    mx: 'auto',
                    mb: 2,
                    fontSize: '4rem',
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  {teacher.name.charAt(0).toUpperCase()}
                </Box>
              )}
            </Box>

            {/* Name */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                color: '#000000',
                mb: 2,
                textTransform: 'uppercase'
              }}
            >
              {teacher.name}
            </Typography>

                         {/* Contact Information */}
             <Box sx={{ textAlign: 'left' }}>
              

               {teacher.phone && (
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                   <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                   <Typography variant="body2" sx={{ color: '#000000' }}>
                     {teacher.phone}
                   </Typography>
                 </Box>
               )}

               {teacher.email && (
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                   <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                   <Typography variant="body2" sx={{ color: '#000000' }}>
                     {teacher.email}
                   </Typography>
                 </Box>
               )}
             </Box>
          </Paper>
        </Grid>

        {/* Right Column - Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 4 }}>
              {/* Introduction Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    color: '#000000',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Lời giới thiệu
                </Typography>
                {teacher.introduction ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#000000' }}>
                    {teacher.introduction}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có lời giới thiệu
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Work Experience Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    color: '#000000',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Kinh nghiệm làm việc
                </Typography>
                {teacher.workExperience ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#000000' }}>
                    {teacher.workExperience}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có thông tin kinh nghiệm làm việc
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Qualifications Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    color: '#000000',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Bằng cấp
                </Typography>

                {formatQualifications(teacher.qualifications || []).length > 0 ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#000000' }}>
                    {formatQualifications(teacher.qualifications || []).join(', ')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có thông tin bằng cấp
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Specializations Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    color: '#000000',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Chuyên môn
                </Typography>

                {formatSpecializations(teacher.specializations || []).length > 0 ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#000000' }}>
                    {formatSpecializations(teacher.specializations || []).join(', ')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có thông tin chuyên môn
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Description */}
              <Box>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    mb: 2,
                    color: '#000000',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -8,
                      left: 0,
                      width: 60,
                      height: 3,
                      bgcolor: 'error.main'
                    }
                  }}
                >
                  Mô tả
                </Typography>
                {teacher.description ? (
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#000000' }}>
                    {teacher.description}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Chưa có mô tả
                  </Typography>
                )}
              </Box>
          </Paper>
        </Grid>
      </Grid>
      </Container>
    </PublicLayout>
  );
};

export default TeacherDetail;
