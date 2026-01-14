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
  School,
  Email,
  Lock,

} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from '@shared/hooks';
import { loginValidationSchema } from '@shared/validations/auth';
import { getDashboardPath } from '@shared/utils';


interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    values,
    errors,
    handleChange,
    isSubmitting,
    setIsSubmitting,
    setValue,
    validate
  } = useForm<LoginFormData>(
    {
      email: '',
      password: ''
    },
    loginValidationSchema
  );

  // Simple autofill detection
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

    // Check immediately and periodically
    detectAutofill();
    const interval = setInterval(detectAutofill, 200);

    // Also listen for events
    const inputs = document.querySelectorAll('input[name="email"], input[name="password"]');
    inputs.forEach(input => {
      input.addEventListener('input', detectAutofill);
      input.addEventListener('change', detectAutofill);
      input.addEventListener('animationstart', detectAutofill); // For CSS animation detection
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
    console.log('Form submitted, preventing default reload');
    setIsSubmitting(true);
    clearError();

    const isValid = validate();
    if (!isValid) {
      console.log('Form validation failed');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting login with:', { email: values.email, password: '***' });
      const result = await login({
        email: values.email,
        password: values.password
      });

      console.log('Login result:', result);

      // Nếu login thành công, result sẽ có user data
      if (result && result.user) {
        // Only allow student (role id 4) and parent (role id 3)
        const roleId = typeof result.user.role === 'object' ? (result.user.role as any)?.id :
                      (result.user.role === 'student') ? 4 :
                      (result.user.role === 'parent') ? 3 : 0;

        if (roleId !== 3 && roleId !== 4) {
          setIsSubmitting(false);
          // Don't set error message, just show admin login option
          console.log('User role not allowed on regular login:', result.user.role);
          return;
        }

        const userRole = result.user.role;
        console.log('Login successful, navigating to:', userRole);
        if (userRole) {
          navigate(getDashboardPath(userRole), { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        console.log('Login failed, result is null');
      }
      // Nếu login thất bại, result sẽ là null và error đã được set trong AuthContext
    } catch (error) {
      console.error('Login failed with error:', error);
      // Không cần làm gì thêm vì AuthContext đã xử lý error và set vào state
      // Error sẽ được hiển thị thông qua authError từ useAuth()
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
              <School sx={{
                fontSize: 64,
                color: 'primary.text',
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }} />
              <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
                Đăng nhập
              </Typography>
            </Box>

            {authError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {authError}
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
                    borderRadius: 2,
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
                    borderRadius: 2,
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

              {/* Nút quên mật khẩu */}
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

export default Login;
