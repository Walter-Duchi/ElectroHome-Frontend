import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff,
  CorporateFare,
  PeopleAlt,
  ArrowBack,
} from '@mui/icons-material';
import { useAuth } from '../../services/authContext';
import { Link as RouterLink } from 'react-router-dom';
import ThemeSelector from '../ThemeSelector/ThemeSelector';

const usuariosPrueba = [
  { correo: 'administrador.1@gmail.com', pass: 'pass123', rol: 'Administrador' },
  { correo: 'analistadatos.1@gmail.com', pass: 'pass123', rol: 'Analista Datos' },
  { correo: 'cliente.1@gmail.com', pass: 'pass123', rol: 'Cliente' },
  { correo: 'encargadoinventario.1@gmail.com', pass: 'pass123', rol: 'Encargado Inventario' },
  { correo: 'gestorproductos.1@gmail.com', pass: 'pass123', rol: 'Gestor Productos' },
  { correo: 'personaldeentrega.1@gmail.com', pass: 'pass123', rol: 'Personal Entrega' },
  { correo: 'revisor.1@gmail.com', pass: 'pass123', rol: 'Revisor' },
  { correo: 'tecnico.1@gmail.com', pass: 'pass123', rol: 'Técnico' },
];

const LoginForm: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(correo, contrasena);
      window.location.href = '/';
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSnackbarMessage(err.message);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Error al iniciar sesión');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const llenarCredenciales = (user: string, pass: string) => {
    setCorreo(user);
    setContrasena(pass);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, md: 4 },
            width: '100%',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <ThemeSelector showLabel={false} />
          </Box>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 2,
              }}
            >
              <CorporateFare sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" fontWeight={700}>
                ElectroHome
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary">
              Acceso Seguro al Sistema de Gestión
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Correo Electrónico"
              type="email"
              fullWidth
              margin="normal"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@empresa.com"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
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
            />

            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <RouterLink
                to="/forgot-password"
                style={{ textDecoration: 'none' }}
              >
                <Typography variant="body2" color="primary">
                  ¿Olvidaste tu contraseña?
                </Typography>
              </RouterLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || !correo || !contrasena}
              sx={{ mb: 3 }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            <Button
              variant="outlined"
              component={RouterLink}
              to="/"
              startIcon={<ArrowBack />}
              fullWidth
              sx={{ mb: 3 }}
            >
              Volver a la tienda
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Chip label="Usuarios de prueba" icon={<PeopleAlt />} />
          </Divider>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 1,
              maxHeight: 240,
              overflowY: 'auto',
              p: 1,
            }}
          >
            {usuariosPrueba.map((u) => (
              <Button
                key={u.correo}
                variant="outlined"
                size="small"
                onClick={() => llenarCredenciales(u.correo, u.pass)}
                sx={{ justifyContent: 'space-between', textTransform: 'none' }}
              >
                <span>
                  <strong>{u.correo}</strong> ({u.rol})
                </span>
                <Chip label="pass123" size="small" variant="outlined" />
              </Button>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            Haz clic en cualquier usuario para rellenar sus credenciales
          </Typography>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2026 ElectroHome. Todos los derechos reservados.
            </Typography>
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

export default LoginForm;
