import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, CircularProgress,
  Grid, Divider, Paper, InputAdornment, Snackbar,
} from '@mui/material';
import { Business, Storefront, Description, LocationOn, Save, Edit, Cancel } from '@mui/icons-material';
import { empresaService } from '../../services/empresaService';
import type { DatosEmpresa, UpdateDatosEmpresaRequest } from '../../src/types/empresa';

const DatosEmpresaConfig: React.FC = () => {
  const [datos, setDatos] = useState<DatosEmpresa>({
    id: 0, rucEmpresa: '', nombreComercial: '', razonSocial: '', direccionMatriz: '',
  });
  const [originalDatos, setOriginalDatos] = useState<DatosEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true); setError('');
      const data = await empresaService.obtenerDatosEmpresa();
      setDatos(data); setOriginalDatos(data);
      if (data.id === 0) setIsEditing(true);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
    } finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatos(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!datos.rucEmpresa.trim()) return setError('RUC obligatorio');
    if (!datos.nombreComercial.trim()) return setError('Nombre obligatorio');
    if (!datos.razonSocial.trim()) return setError('Razón social obligatoria');
    if (!datos.direccionMatriz.trim()) return setError('Dirección obligatoria');
    setSaving(true); setError(''); setSuccess('');
    try {
      const req: UpdateDatosEmpresaRequest = {
        rucEmpresa: datos.rucEmpresa, nombreComercial: datos.nombreComercial,
        razonSocial: datos.razonSocial, direccionMatriz: datos.direccionMatriz,
      };
      const r = await empresaService.actualizarDatosEmpresa(req);
      setDatos(r); setOriginalDatos(r); setIsEditing(false);
      setSuccess('Datos actualizados'); setSnackbarOpen(true);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress size={60} />
    </Box>;
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: { xs: 2, md: 4 }, p: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Box sx={{
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Business sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={600}>Configuración de la Empresa</Typography>
          </Box>
          {!isEditing && (
            <Button variant="contained" startIcon={<Edit />} onClick={() => setIsEditing(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}>Editar</Button>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Los siguientes datos corresponden a la información legal y comercial.
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="RUC" name="rucEmpresa" value={datos.rucEmpresa}
                  onChange={handleChange} disabled={!isEditing || saving} required
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Description color="action" /></InputAdornment>) }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Nombre Comercial" name="nombreComercial"
                  value={datos.nombreComercial} onChange={handleChange} disabled={!isEditing || saving} required
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Storefront color="action" /></InputAdornment>) }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Razón Social" name="razonSocial"
                  value={datos.razonSocial} onChange={handleChange} disabled={!isEditing || saving} required
                  InputProps={{ startAdornment: (<InputAdornment position="start"><Business color="action" /></InputAdornment>) }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Dirección Matriz" name="direccionMatriz"
                  value={datos.direccionMatriz} onChange={handleChange}
                  disabled={!isEditing || saving} required multiline rows={2}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOn color="action" /></InputAdornment>) }} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {isEditing && (
          <Box sx={{
            display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'flex-end', gap: 2,
          }}>
            <Button variant="outlined" color="inherit" startIcon={<Cancel />}
              onClick={() => { if (originalDatos) setDatos(originalDatos); setIsEditing(false); setError(''); }}
              disabled={saving} fullWidth={false}>Cancelar</Button>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              onClick={handleSave} disabled={saving} sx={{ minWidth: 120 }}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        )}
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Nota:</strong> Solo puede ser modificada por Administradores.
            </Typography>
          </Alert>
        </Box>
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DatosEmpresaConfig;
