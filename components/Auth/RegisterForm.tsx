import React, { useState } from 'react';
import {
  Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress,
  Link, Grid, InputAdornment, IconButton, MenuItem, FormControl, InputLabel,
  Select, Checkbox, FormControlLabel, Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CANTONES_GUAYAS = [
  "Guayaquil", "Durán", "Milagro", "Daule", "Samborondón", "Naranjal", "Playas",
  "Balzar", "El Triunfo", "Yaguachi", "Naranjito", "Santa Lucía", "Pedro Carbo",
  "Salitre", "General Villamil (Playas)", "Coronel Marcelino Maridueña", "Nobol",
  "Lomas de Sargentillo", "Alfredo Baquerizo Moreno", "Balao", "Colimes",
  "Palestina", "Simón Bolívar", "Crnel. Lorenzo de Garaicoa", "El Empalme",
];

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', tipoIdentificacion: 'Cedula', identificacion: '',
    ruc: '', correo: '', celular: '', convencional: '', ciudad: 'Guayaquil',
    codigoPostal: '', direccion: '', contrasena: '', confirmarContrasena: '', aceptaTerminos: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSelectChange = (name: string) => (e: any) => setFormData(p => ({ ...p, [name]: e.target.value }));

  const validateCedula = (c: string): boolean => {
    if (c.length !== 10 || !/^\d+$/.test(c)) return false;
    const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let t = 0;
    for (let i = 0; i < 9; i++) {
      let v = parseInt(c[i]) * coef[i];
      if (v >= 10) v -= 9;
      t += v;
    }
    let d = t % 10;
    if (d !== 0) d = 10 - d;
    return d === parseInt(c[9]);
  };

  const showError = (m: string) => {
    setSnackbarMessage(m); setSnackbarSeverity('error'); setSnackbarOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres.trim()) return showError('Nombres requeridos');
    if (!formData.apellidos.trim()) return showError('Apellidos requeridos');
    if (formData.tipoIdentificacion === 'Cedula') {
      if (!formData.identificacion.trim()) return showError('Cédula requerida');
      if (!validateCedula(formData.identificacion)) return showError('Cédula inválida');
    } else {
      if (!formData.identificacion.trim() || formData.identificacion.length < 8) return showError('Pasaporte inválido');
    }
    if (!formData.correo.trim() || !/\S+@\S+\.\S+/.test(formData.correo)) return showError('Correo inválido');
    if (!formData.celular.trim() || !/^09\d{8}$/.test(formData.celular.replace(/\D/g, ''))) return showError('Celular inválido');
    if (!formData.codigoPostal.trim() || !/^\d{6}$/.test(formData.codigoPostal)) return showError('Código postal inválido');
    if (!formData.direccion.trim()) return showError('Dirección requerida');
    if (!formData.contrasena || formData.contrasena.length < 6) return showError('Mínimo 6 caracteres');
    if (formData.contrasena !== formData.confirmarContrasena) return showError('Contraseñas no coinciden');
    if (!formData.aceptaTerminos) return showError('Debe aceptar términos');

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nombres: formData.nombres, apellidos: formData.apellidos,
        tipoIdentificacion: formData.tipoIdentificacion, identificacion: formData.identificacion,
        ruc: formData.ruc || undefined, correo: formData.correo, celular: formData.celular,
        convencional: formData.convencional || undefined, ciudad: formData.ciudad,
        codigoPostal: formData.codigoPostal, direccion: formData.direccion, rol: 'Cliente',
        numCuentaBancaria: '0000000000', tipoCuentaBancaria: 'Ahorro',
        contrasena: formData.contrasena, contribuyenteEspecial: false, obligadoContabilidad: false,
      });
      setSnackbarMessage('Registro exitoso. Ya puedes iniciar sesión.');
      setSnackbarSeverity('success'); setSnackbarOpen(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (e: any) {
      showError(e.response?.data?.message || 'Error al registrar');
    } finally { setLoading(false); }
  };

  return (
    <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 4 } }}>
        <Paper elevation={24} sx={{ p: { xs: 2.5, sm: 3, md: 4 }, width: '100%', borderRadius: 4 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 4 } }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>Registro de Cliente</Typography>
            <Typography variant="subtitle1" color="text.secondary">Complete sus datos</Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 1.5, md: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo Identificación *</InputLabel>
                  <Select value={formData.tipoIdentificacion} label="Tipo Identificación *"
                    onChange={handleSelectChange('tipoIdentificacion')}>
                    <MenuItem value="Cedula">Cédula</MenuItem>
                    <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label={formData.tipoIdentificacion === 'Cedula' ? 'Cédula' : 'Pasaporte'}
                  name="identificacion" value={formData.identificacion}
                  onChange={handleChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="RUC (Opcional)" name="ruc" value={formData.ruc} onChange={handleChange} fullWidth />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Correo Electrónico" name="correo" type="email"
                  value={formData.correo} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Celular" name="celular" value={formData.celular}
                  onChange={handleChange} fullWidth required placeholder="0991234567" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Teléfono Convencional" name="convencional"
                  value={formData.convencional} onChange={handleChange} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Ciudad *</InputLabel>
                  <Select value={formData.ciudad} label="Ciudad *" onChange={handleSelectChange('ciudad')}>
                    {CANTONES_GUAYAS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Código Postal" name="codigoPostal" value={formData.codigoPostal}
                  onChange={handleChange} fullWidth required placeholder="090101" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Dirección" name="direccion" value={formData.direccion}
                  onChange={handleChange} fullWidth required multiline rows={2} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Contraseña" type={showPassword ? 'text' : 'password'}
                  name="contrasena" value={formData.contrasena}
                  onChange={handleChange} fullWidth required
                  InputProps={{ endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ) }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Confirmar Contraseña" type={showPassword ? 'text' : 'password'}
                  name="confirmarContrasena" value={formData.confirmarContrasena}
                  onChange={handleChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel control={
                  <Checkbox checked={formData.aceptaTerminos} onChange={handleChange} name="aceptaTerminos" />
                } label="Acepto los términos y condiciones" />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Registrarse'}
                </Button>
              </Grid>
            </Grid>
          </form>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link component={RouterLink} to="/login" variant="body2"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <ArrowBack fontSize="small" /> Ya tengo cuenta
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

export default RegisterForm;
