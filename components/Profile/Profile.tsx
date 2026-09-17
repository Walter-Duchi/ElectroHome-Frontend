import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Grid, Alert, CircularProgress,
  Divider, InputAdornment, IconButton, Snackbar, Card, CardContent, Stack,
} from '@mui/material';
import {
  Person, Email, Phone, LocationCity, LocationOn, Home, Badge,
  AccountBalance, Business, Edit, Save, Cancel, Lock, Visibility, VisibilityOff,
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import type { ProfileResponse } from '../../src/types/user';
import { useResponsive } from '../../src/hooks/useResponsive';

const Profile: React.FC = () => {
  const { esMovil } = useResponsive();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    correo: '', celular: '', convencional: '', ciudad: '', codigoPostal: '', direccion: '',
    currentPassword: '', newPassword: '', confirmNewPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFormData({
        correo: data.correo, celular: data.celular, convencional: data.convencional || '',
        ciudad: data.ciudad, codigoPostal: data.codigoPostal, direccion: data.direccion,
        currentPassword: '', newPassword: '', confirmNewPassword: '',
      });
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al cargar perfil');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = (): boolean => {
    const ne: Record<string, string> = {};
    if (!formData.correo.trim()) ne.correo = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.correo)) ne.correo = 'Formato inválido';
    if (!formData.celular.trim()) ne.celular = 'El celular es requerido';
    else if (!/^09\d{8}$/.test(formData.celular.replace(/\D/g, ''))) ne.celular = 'Celular inválido';
    if (!formData.codigoPostal.trim()) ne.codigoPostal = 'Requerido';
    else if (!/^\d{6}$/.test(formData.codigoPostal)) ne.codigoPostal = '6 dígitos';
    if (!formData.ciudad.trim()) ne.ciudad = 'Requerida';
    if (!formData.direccion.trim()) ne.direccion = 'Requerida';
    if (formData.newPassword || formData.currentPassword) {
      if (!formData.currentPassword) ne.currentPassword = 'Requerida';
      if (!formData.newPassword) ne.newPassword = 'Requerida';
      else if (formData.newPassword.length < 6) ne.newPassword = 'Mínimo 6 caracteres';
      if (formData.newPassword !== formData.confirmNewPassword) ne.confirmNewPassword = 'No coinciden';
    }
    setErrors(ne);
    return Object.keys(ne).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setUpdating(true);
    try {
      const update: any = {};
      if (formData.correo !== profile?.correo) update.correo = formData.correo;
      if (formData.celular !== profile?.celular) update.celular = formData.celular;
      if (formData.convencional !== (profile?.convencional || '')) update.convencional = formData.convencional;
      if (formData.ciudad !== profile?.ciudad) update.ciudad = formData.ciudad;
      if (formData.codigoPostal !== profile?.codigoPostal) update.codigoPostal = formData.codigoPostal;
      if (formData.direccion !== profile?.direccion) update.direccion = formData.direccion;
      if (formData.newPassword) {
        update.currentPassword = formData.currentPassword;
        update.newPassword = formData.newPassword;
        update.confirmNewPassword = formData.confirmNewPassword;
      }
      await userService.updateProfile(update);
      setSnackbarMessage('Perfil actualizado'); setSnackbarSeverity('success'); setSnackbarOpen(true);
      setEditMode(false); await loadProfile();
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al actualizar'); setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setUpdating(false); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!profile) return <Alert severity="error" sx={{ mt: 2 }}>No se pudo cargar el perfil.</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 2, mb: 4 }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Box sx={{
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3,
        }}>
          <Typography variant="h5" fontWeight={600}>Mi Perfil</Typography>
          {!editMode && (
            <Button variant="contained" startIcon={<Edit />} onClick={() => setEditMode(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}>Editar Perfil</Button>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Información Personal (No editable)
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>Nombres:</strong> {profile.nombres} {profile.apellidos}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Badge color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>{profile.tipoIdentificacion}:</strong> {profile.identificacion}
                    </Typography>
                  </Box>
                  {profile.ruc && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Business color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2"><strong>RUC:</strong> {profile.ruc}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalance color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                      <strong>Cuenta:</strong> {profile.numCuentaBancaria}
                    </Typography>
                  </Box>
                  <Typography variant="body2"><strong>Rol:</strong> {profile.rol}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Datos de Contacto y Ubicación
                </Typography>
                <TextField label="Correo" name="correo" value={formData.correo} onChange={handleChange}
                  disabled={!editMode} fullWidth margin="normal" error={!!errors.correo} helperText={errors.correo}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>) }} />
                <TextField label="Celular" name="celular" value={formData.celular} onChange={handleChange}
                  disabled={!editMode} fullWidth margin="normal" error={!!errors.celular} helperText={errors.celular}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>) }} />
                <TextField label="Convencional" name="convencional" value={formData.convencional} onChange={handleChange}
                  disabled={!editMode} fullWidth margin="normal"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>) }} />
                <TextField label="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange}
                  disabled={!editMode} fullWidth margin="normal" error={!!errors.ciudad} helperText={errors.ciudad}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><LocationCity color="action" /></InputAdornment>) }} />
                <TextField label="Código Postal" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange}
                  disabled={!editMode} fullWidth margin="normal" error={!!errors.codigoPostal} helperText={errors.codigoPostal}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOn color="action" /></InputAdornment>) }} />
                <TextField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange}
                  disabled={!editMode} fullWidth multiline rows={2} margin="normal"
                  error={!!errors.direccion} helperText={errors.direccion}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Home color="action" /></InputAdornment>) }} />
              </CardContent>
            </Card>
          </Grid>
          {editMode && (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Cambiar Contraseña</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                    Deje los campos en blanco si no desea cambiar.
                  </Typography>
                  <TextField label="Contraseña Actual" name="currentPassword"
                    type={showCurrent ? 'text' : 'password'} value={formData.currentPassword} onChange={handleChange}
                    fullWidth margin="normal" error={!!errors.currentPassword} helperText={errors.currentPassword}
                    InputProps={{ endAdornment: (<InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">
                        {showCurrent ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>) }} />
                  <TextField label="Nueva Contraseña" name="newPassword"
                    type={showNew ? 'text' : 'password'} value={formData.newPassword} onChange={handleChange}
                    fullWidth margin="normal" error={!!errors.newPassword} helperText={errors.newPassword}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start"><Lock color="action" /></InputAdornment>),
                      endAdornment: (<InputAdornment position="end">
                        <IconButton onClick={() => setShowNew(!showNew)} edge="end">
                          {showNew ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>),
                    }} />
                  <TextField label="Confirmar Nueva Contraseña" name="confirmNewPassword"
                    type={showConfirm ? 'text' : 'password'} value={formData.confirmNewPassword} onChange={handleChange}
                    fullWidth margin="normal" error={!!errors.confirmNewPassword} helperText={errors.confirmNewPassword}
                    InputProps={{ endAdornment: (<InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>) }} />
                </CardContent>
              </Card>
            </Grid>
          )}
          {editMode && (
            <Grid size={{ xs: 12 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
                sx={{ justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" startIcon={<Cancel />}
                  onClick={() => { setEditMode(false); loadProfile(); }}
                  disabled={updating} fullWidth={esMovil}>Cancelar</Button>
                <Button variant="contained" startIcon={<Save />} onClick={handleSubmit}
                  disabled={updating} fullWidth={esMovil}>
                  {updating ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
