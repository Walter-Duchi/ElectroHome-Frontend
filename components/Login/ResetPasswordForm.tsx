import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress,
  Link, InputAdornment, IconButton, Snackbar,
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
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => {
    const validate = async () => {
      if (!token) { navigate('/login'); return; }
      try {
        const r = await api.get(`/auth/validate-reset-token?token=${token}`);
        setTokenValid(r.data.valid);
        if (!r.data.valid) {
          setSnackbarMessage('El enlace ha expirado o es inválido.');
          setSnackbarSeverity('error'); setSnackbarOpen(true);
        }
      } catch {
        setTokenValid(false);
        setSnackbarMessage('Error al validar el enlace.');
        setSnackbarSeverity('error'); setSnackbarOpen(true);
      } finally { setValidating(false); }
    };
    validate();
  }, [token, navigate]);

  const validatePassword = (p: string): string[] => {
    const errors: string[] = [];
    if (p.length < 8) errors.push('8 caracteres mínimo');
    if (!/[a-z]/.test(p)) errors.push('una minúscula');
    if (!/[A-Z]/.test(p)) errors.push('una mayúscula');
    if (!/\d/.test(p)) errors.push('un número');
    if (!/[@$!%*?&]/.test(p)) errors.push('un carácter especial');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pe = validatePassword(nuevaContrasena);
    if (pe.length > 0) {
      setSnackbarMessage(`La contraseña debe tener: ${pe.join(', ')}`);
      setSnackbarSeverity('error'); setSnackbarOpen(true); return;
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setSnackbarMessage('Las contraseñas no coinciden.');
      setSnackbarSeverity('error'); setSnackbarOpen(true); return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, nuevaContrasena, confirmarContrasena });
      setSnackbarMessage('¡Contraseña restablecida! Redirigiendo...');
      setSnackbarSeverity('success'); setSnackbarOpen(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e: any) {
      setSnackbarMessage(e.response?.data?.message || 'Error al restablecer.');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const wrapperSx = {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    py: { xs: 2, md: 4 }, background: 'linear-gradient(135deg, #0056b3 0%, #003b82 100%)',
  } as const;

  const paperSx = {
    p: { xs: 2.5, sm: 3, md: 4 }, width: '100%', maxWidth: 450, borderRadius: 4,
    border: '1px solid', borderColor: 'divider',
  } as const;

  if (validating) {
    return (
      <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 2 } }}>
        <Box sx={wrapperSx}>
          <Paper elevation={24} sx={{ ...paperSx, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>Validando Enlace...</Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 2 } }}>
        <Box sx={wrapperSx}>
          <Paper elevation={24} sx={{ ...paperSx, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'Este enlace ha expirado o es inválido.'}
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">Solicitar nuevo enlace</Link>
              <Link component={RouterLink} to="/login" variant="body2">Volver al Login</Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 2 } }}>
      <Box sx={wrapperSx}>
        <Paper elevation={24} sx={paperSx}>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Crear Nueva Contraseña
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextField label="Nueva Contraseña" type={showPassword ? 'text' : 'password'}
              fullWidth margin="normal" value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)} required disabled={loading}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><VpnKey color="action" /></InputAdornment>),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="Mínimo 8 caracteres, mayúsculas, minúsculas, números y especiales" />
            <TextField label="Confirmar Contraseña" type={showPassword ? 'text' : 'password'}
              fullWidth margin="normal" value={confirmarContrasena}
              onChange={(e) => setConfirmarContrasena(e.target.value)} required disabled={loading}
              InputProps={{ startAdornment: (<InputAdornment position="start"><VpnKey color="action" /></InputAdornment>) }} />
            <Button type="submit" fullWidth variant="contained" size="large"
              disabled={loading || !nuevaContrasena || !confirmarContrasena} sx={{ mt: 3, mb: 3 }}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Restablecer Contraseña'}
            </Button>
          </form>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
              <ArrowBack fontSize="small" /> Volver al Inicio
            </Link>
          </Box>
        </Paper>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ResetPasswordForm;
