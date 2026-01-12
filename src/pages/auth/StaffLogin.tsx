import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Email,
  Lock,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '../../hooks/useForm';
import { adminLoginValidationSchema } from '../../validations/loginValidation';

interface StaffLoginFormData {
  email: string;
  password: string;
}

const StaffLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    isSubmitting,
    setIsSubmitting,
    setValue,
    validate
  } = useForm<StaffLoginFormData>(
    {
      email: '',
      password: ''
    },
    adminLoginValidationSchema
  );

  useEffect(() => {
    clearError();
    setLoginError('');
    return () => {
      clearError();
    };
  }, [clearError]);

  // Autofill detection (same as user Login)
  useEffect(() => {
    const detectAutofill = () => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;

      if (emailInput?.value && emailInput.value !== values.email) {
        setValue('email', emailInput.value);
      }
      if (passwordInput?.value && passwordInput.value !== values.password) {
        setValue('password', passwordInput.value);
      }
    };

    detectAutofill();
    const interval = setInterval(detectAutofill, 200);

    const inputs = document.querySelectorAll('input[name="email"], input[name="password"]');
    inputs.forEach(input => {
      input.addEventListener('input', detectAutofill);
      input.addEventListener('change', detectAutofill);
      input.addEventListener('animationstart', detectAutofill);
    });

    return () => {
      clearInterval(interval);
      inputs.forEach(input => {
        input.removeEventListener('input', detectAutofill);
        input.removeEventListener('change', detectAutofill);
        input.removeEventListener('animationstart', detectAutofill);
      });
    };
  }, [values.email, values.password, setValue]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    setLoginError('');

    const isValid = validate();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login({
        email: values.email,
        password: values.password
      }, true);

      if (result && result.user) {
        const roleObj = typeof result.user.role === 'object' ? result.user.role : null;
        const roleId = roleObj ? (roleObj as any)?.id :
          (result.user.role === 'admin') ? 1 :
            (result.user.role === 'teacher') ? 2 : 0;
        const isStaff = roleObj ? (roleObj as any)?.isStaff : false;

        // Admin (roleId 1) -> admin dashboard with full menu
        // Teacher (roleId 2) -> teacher dashboard  
        // Staff (isStaff === true and roleId !== 1) -> staff dashboard (admin interface but limited menu - no role management and audit logs)
        if (roleId === 1) {
          // Keep as admin - full access
          navigate('/admin/dashboard', { replace: true });
        } else if (roleId === 2) {
          navigate('/teacher/dashboard', { replace: true });
        } else if (isStaff || (roleId !== 1 && roleId !== 2)) {
          // Staff with isStaff flag or other roles - set role to 'staff' and navigate to admin dashboard
          // Update user role in localStorage
          const userData = { ...result.user, role: 'staff' };
          localStorage.setItem('userData', JSON.stringify(userData));
          // Update auth context state
          // Force reload to refresh auth context with new role
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 100);
        } else {
          setLoginError('Chỉ có quản trị viên, giáo viên và nhân viên mới được phép đăng nhập tại đây');
          setIsSubmitting(false);
        }
      } else {
        setLoginError('Email hoặc mật khẩu không chính xác');
      }
    } catch (error: any) {
      console.error('Staff login failed:', error);
      if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        setLoginError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc CORS settings.');
      } else if (error?.response?.status === 401) {
        setLoginError('Email hoặc mật khẩu không chính xác');
      } else if (error?.response?.status === 403) {
        setLoginError('Bạn không có quyền truy cập hệ thống quản lý');
      } else {
        setLoginError(`Lỗi đăng nhập: ${error?.message || 'Có lỗi xảy ra khi đăng nhập'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/* CSS for autofill detection */}
      <style>
        {`
          @keyframes onAutoFillStart {
            from { /*empty*/ }
            to { /*empty*/ }
          }
          input:-webkit-autofill {
            animation-name: onAutoFillStart;
            animation-duration: 0.001s;
          }
        `}
      </style>

      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        background: '#ffffff',
        position: 'relative'
      }}>
        <Container component="main" maxWidth="sm" sx={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <Card sx={{
            width: '100%',
            maxWidth: 450,
            mx: 'auto',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}>
            <CardContent sx={{ p: 5 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <AdminPanelSettings sx={{
                  fontSize: 64,
                  color: 'primary.text',
                  mb: 2,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                }} />
                <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
                  Đăng nhập Nhân sự
                </Typography>
              </Box>

              {(authError || loginError) && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {authError || loginError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white',
                      '&.Mui-focused fieldset': {
                        borderColor: '#764ba2',
                        boxShadow: 'none',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      },
                      '&.Mui-autofill': {
                        backgroundColor: 'white !important',
                        WebkitBoxShadow: '0 0 0 100px white inset !important',
                        WebkitTextFillColor: '#222 !important',
                        'color': '#222 !important',
                      },
                      '&.Mui-autofill:hover': {
                        backgroundColor: 'white !important',
                      },
                      '&.Mui-autofill:focus': {
                        backgroundColor: 'white !important',
                      }
                    },
                    '& .MuiInputBase-input': {
                      '&:-webkit-autofill': {
                        backgroundColor: 'white !important',
                        WebkitBoxShadow: '0 0 0 100px white inset !important',
                        WebkitTextFillColor: '#222 !important',
                        'color': '#222 !important',
                      }
                    }
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white',
                      '&.Mui-focused fieldset': {
                        borderColor: '#764ba2',
                        boxShadow: 'none',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'white',
                      },
                      '&.Mui-autofill': {
                        backgroundColor: 'white !important',
                        WebkitBoxShadow: '0 0 0 100px white inset !important',
                        WebkitTextFillColor: '#222 !important',
                        'color': '#222 !important',
                      },
                      '&.Mui-autofill:hover': {
                        backgroundColor: 'white !important',
                      },
                      '&.Mui-autofill:focus': {
                        backgroundColor: 'white !important',
                      }
                    },
                    '& .MuiInputBase-input': {
                      '&:-webkit-autofill': {
                        backgroundColor: 'white !important',
                        WebkitBoxShadow: '0 0 0 100px white inset !important',
                        WebkitTextFillColor: '#222 !important',
                        'color': '#222 !important',
                      }
                    },
                    // Hide browser's default password visibility icon
                    '& input[type="password"]::-ms-reveal': {
                      display: 'none',
                    },
                    '& input[type="password"]::-ms-clear': {
                      display: 'none',
                    },
                    '& input[type="password"]::-webkit-contacts-auto-fill-button': {
                      display: 'none',
                    },
                    '& input[type="password"]::-webkit-credentials-auto-fill-button': {
                      display: 'none',
                    }
                  }}
                />

                <Box display="flex" justifyContent="flex-end" mt={1} mb={2}>
                  <Button
                    variant="text"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(118, 75, 162, 0.04)',
                        textDecoration: 'underline'
                      }
                    }}
                    onClick={() => navigate('/forgot-password')}
                  >
                    Quên mật khẩu?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Đăng nhập'
                  )}
                </Button>

              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default StaffLogin;
