import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
  Snackbar,
} from '@mui/material';
import { VpnKey, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ResetPasswordForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get(`/auth/validate-reset-token?token=${token}`);
        const data = response.data;
        setTokenValid(data.valid);
        if (!data.valid) {
          setSnackbarMessage('El enlace de restablecimiento ha expirado o es inválido.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (err) {
        setTokenValid(false);
        setSnackbarMessage('Error al validar el enlace.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Al menos 8 caracteres');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Al menos una letra minúscula');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Al menos una letra mayúscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Al menos un número');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Al menos un carácter especial (@$!%*?&)');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const passwordErrors = validatePassword(nuevaContrasena);
    if (passwordErrors.length > 0) {
      setSnackbarMessage(`La contraseña debe tener: ${passwordErrors.join(', ')}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setSnackbarMessage('Las contraseñas no coinciden.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        nuevaContrasena,
        confirmarContrasena,
      });
      setSnackbarMessage('¡Contraseña restablecida exitosamente! Serás redirigido al inicio de sesión.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Error al restablecer la contraseña.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (validating) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            background: 'linear-gradient(135deg, #0056b3 0%, #003b82 100%)',
          }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, md: 4 },
              width: '100%',
              maxWidth: 450,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Validando Enlace...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verificando tu enlace de restablecimiento...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
            background: 'linear-gradient(135deg, #0056b3 0%, #003b82 100%)',
          }}
        >
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, md: 4 },
              width: '100%',
              maxWidth: 450,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error || 'Este enlace de restablecimiento ha expirado o es inválido.'}
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Solicitar nuevo enlace
              </Link>
              <Link
                component={RouterLink}
                to="/login"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                Volver al Inicio de Sesión
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          background: 'linear-gradient(135deg, #0056b3 0%, #003b82 100%)',
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, md: 4 },
            width: '100%',
            maxWidth: 450,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Crear Nueva Contraseña
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Crea una contraseña segura para tu cuenta.
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nueva Contraseña"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Mínimo 8 caracteres, con mayúsculas, minúsculas, números y caracteres especiales"
            />

            <TextField
              label="Confirmar Contraseña"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !nuevaContrasena || !confirmarContrasena}
              sx={{ mt: 3, mb: 3 }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Restablecer Contraseña'
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              sx={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              <ArrowBack fontSize="small" />
              Volver al Inicio de Sesión
            </Link>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPasswordForm;
