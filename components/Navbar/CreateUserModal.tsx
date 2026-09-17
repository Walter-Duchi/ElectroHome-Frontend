import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem,
  Grid, Alert, CircularProgress, Typography, Box, Stepper, Step, StepLabel,
  InputAdornment, Checkbox, FormControlLabel, FormGroup, Snackbar, Paper, Divider,
} from '@mui/material';
import {
  Person, Email, Phone, Business, AccountBalance, LocationCity, LocationOn,
  Home, Badge, ContentCopy,
} from '@mui/icons-material';
import { userService } from '../../services/userService';
import { type CreateUserResponse } from '../../src/types/user';
import { useResponsive } from '../../src/hooks/useResponsive';

interface CreateUserModalProps { onClose: () => void; }

const CANTONES_GUAYAS = [
  "Guayaquil", "Durán", "Milagro", "Daule", "Samborondón", "Naranjal", "Playas",
  "Balzar", "El Triunfo", "Yaguachi", "Naranjito", "Santa Lucía", "Pedro Carbo",
  "Salitre", "General Villamil (Playas)", "Coronel Marcelino Maridueña", "Nobol",
  "Lomas de Sargentillo", "Alfredo Baquerizo Moreno", "Balao", "Colimes",
  "Palestina", "Simón Bolívar", "Crnel. Lorenzo de Garaicoa", "El Empalme",
];
const ROLES_ADMIN = [
  "Revisor", "Tecnico", "Personal de Entrega", "Vendedor",
  "Analista_Datos", "Encargado_Inventario", "Gestor_Productos", "Administrador",
];
const steps = ['Información Personal', 'Datos de Contacto', 'Información Bancaria'];

function CreateUserModal({ onClose }: CreateUserModalProps) {
  const { esMovil } = useResponsive();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', razonSocial: '',
    tipoIdentificacion: 'Cedula' as 'Cedula' | 'Pasaporte',
    identificacion: '', ruc: '', correo: '', celular: '', convencional: '',
    ciudad: 'Guayaquil', codigoPostal: '', direccion: '', rol: 'Revisor',
    numCuentaBancaria: '', tipoCuentaBancaria: 'Ahorro' as 'Ahorro' | 'Corriente',
    contribuyenteEspecial: false, obligadoContabilidad: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState<CreateUserResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => {
    if (formData.tipoIdentificacion === 'Pasaporte' && errors.identificacion?.includes('cédula')) {
      setErrors(prev => ({ ...prev, identificacion: '' }));
    }
  }, [formData.tipoIdentificacion]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!formData.nombres.trim()) newErrors.nombres = 'Nombres requeridos';
      if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos requeridos';
      if (formData.tipoIdentificacion === 'Cedula') {
        if (!formData.identificacion.trim()) newErrors.identificacion = 'Cédula requerida';
        else if (!userService.validateCedula(formData.identificacion)) newErrors.identificacion = 'Cédula inválida';
      } else if (!formData.identificacion.trim() || formData.identificacion.length < 8) {
        newErrors.identificacion = 'Pasaporte inválido';
      }
      if (!formData.correo.trim()) newErrors.correo = 'Correo requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'Correo inválido';
    }
    if (step === 1) {
      if (!formData.celular.trim()) newErrors.celular = 'Celular requerido';
      else if (!/^09\d{8}$/.test(formData.celular.replace(/\D/g, ''))) newErrors.celular = 'Celular inválido';
      if (!formData.ciudad.trim()) newErrors.ciudad = 'Ciudad requerida';
      if (!formData.codigoPostal.trim()) newErrors.codigoPostal = 'Requerido';
      else if (!userService.validatePostalCode(formData.codigoPostal)) newErrors.codigoPostal = '6 dígitos';
      if (!formData.direccion.trim()) newErrors.direccion = 'Dirección requerida';
    }
    if (step === 2) {
      if (!formData.numCuentaBancaria.trim()) newErrors.numCuentaBancaria = 'Obligatorio';
      else if (!userService.validateBankAccount(formData.numCuentaBancaria)) newErrors.numCuentaBancaria = 'Inválido';
      if (!formData.tipoCuentaBancaria) newErrors.tipoCuentaBancaria = 'Obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep < steps.length - 1) {
      if (validateStep(activeStep)) setActiveStep(prev => prev + 1);
      return;
    }
    if (!validateStep(2)) return;
    setLoading(true);
    try {
      const response = await userService.createUser(formData);
      setSuccessResponse(response);
    } catch (error: unknown) {
      setSnackbarMessage(error instanceof Error ? error.message : 'Error al crear usuario');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const handleCopyPassword = () => {
    if (successResponse?.contrasenaGenerada) {
      navigator.clipboard.writeText(successResponse.contrasenaGenerada);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={{ xs: 1.5, md: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Nombres *" name="nombres" value={formData.nombres} onChange={handleInputChange}
                error={!!errors.nombres} helperText={errors.nombres} disabled={loading} fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Apellidos *" name="apellidos" value={formData.apellidos} onChange={handleInputChange}
                error={!!errors.apellidos} helperText={errors.apellidos} disabled={loading} fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Razón Social (Opcional)" name="razonSocial" value={formData.razonSocial}
                onChange={handleInputChange} disabled={loading} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Tipo de Identificación *" value={formData.tipoIdentificacion}
                onChange={(e) => handleSelectChange('tipoIdentificacion', e.target.value)} disabled={loading} fullWidth>
                <MenuItem value="Cedula">Cédula Ecuatoriana</MenuItem>
                <MenuItem value="Pasaporte">Pasaporte</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label={formData.tipoIdentificacion === 'Cedula' ? 'Cédula *' : 'Pasaporte *'}
                name="identificacion" value={formData.identificacion} onChange={handleInputChange}
                error={!!errors.identificacion} helperText={errors.identificacion} disabled={loading} fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><Badge color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="RUC (Opcional)" name="ruc" value={formData.ruc} onChange={handleInputChange}
                inputProps={{ maxLength: 13 }} disabled={loading} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Correo Electrónico *" name="correo" type="email" value={formData.correo}
                onChange={handleInputChange} error={!!errors.correo} helperText={errors.correo} disabled={loading} fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="action" /></InputAdornment>) }} />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={{ xs: 1.5, md: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Celular *" name="celular" value={formData.celular} onChange={handleInputChange}
                error={!!errors.celular} helperText={errors.celular} disabled={loading} fullWidth placeholder="0991234567"
                InputProps={{ startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Teléfono Convencional (Opcional)" name="convencional" value={formData.convencional}
                onChange={handleInputChange} disabled={loading} fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><Phone color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Ciudad *" value={formData.ciudad}
                onChange={(e) => handleSelectChange('ciudad', e.target.value)} error={!!errors.ciudad}
                helperText={errors.ciudad} disabled={loading} fullWidth>
                {CANTONES_GUAYAS.map((ciudad) => (<MenuItem key={ciudad} value={ciudad}>{ciudad}</MenuItem>))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Código Postal *" name="codigoPostal" value={formData.codigoPostal}
                onChange={handleInputChange} error={!!errors.codigoPostal} helperText={errors.codigoPostal}
                disabled={loading} fullWidth placeholder="090101"
                InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOn color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Dirección Domiciliaria *" name="direccion" value={formData.direccion}
                onChange={handleInputChange} error={!!errors.direccion} helperText={errors.direccion}
                disabled={loading} fullWidth multiline rows={2}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Home color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField select label="Rol del Empleado *" value={formData.rol}
                onChange={(e) => handleSelectChange('rol', e.target.value)} disabled={loading} fullWidth>
                {ROLES_ADMIN.map((rol) => (<MenuItem key={rol} value={rol}>{rol}</MenuItem>))}
              </TextField>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={{ xs: 1.5, md: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Número de Cuenta Bancaria *" name="numCuentaBancaria" value={formData.numCuentaBancaria}
                onChange={handleInputChange} error={!!errors.numCuentaBancaria} helperText={errors.numCuentaBancaria}
                disabled={loading} fullWidth
                InputProps={{ startAdornment: (<InputAdornment position="start"><AccountBalance color="action" /></InputAdornment>) }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Tipo de Cuenta *" value={formData.tipoCuentaBancaria}
                onChange={(e) => handleSelectChange('tipoCuentaBancaria', e.target.value)}
                error={!!errors.tipoCuentaBancaria} helperText={errors.tipoCuentaBancaria} disabled={loading} fullWidth>
                <MenuItem value="Ahorro">Ahorro</MenuItem>
                <MenuItem value="Corriente">Corriente</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormGroup>
                <FormControlLabel control={<Checkbox checked={formData.contribuyenteEspecial} onChange={handleInputChange} name="contribuyenteEspecial" />} label="Contribuyente Especial" />
                <FormControlLabel control={<Checkbox checked={formData.obligadoContabilidad} onChange={handleInputChange} name="obligadoContabilidad" />} label="Obligado a Llevar Contabilidad" />
              </FormGroup>
            </Grid>
          </Grid>
        );
      default: return null;
    }
  };

  if (successResponse) {
    return (
      <Dialog open onClose={onClose} maxWidth="md" fullWidth fullScreen={esMovil}>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600} color="success.main">✓ Usuario Creado</Typography>
        </DialogTitle>
        <DialogContent>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, bgcolor: 'success.light', mb: 3 }}>
            <Typography variant="body1" fontWeight={600}>{successResponse.mensaje}</Typography>
          </Paper>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>¡IMPORTANTE! Guarde esta contraseña.</Typography>
          </Alert>
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body1" fontWeight={600}>Contraseña Generada:</Typography>
              <Button size="small" startIcon={<ContentCopy />} onClick={handleCopyPassword} variant="outlined">
                {copied ? 'Copiada!' : 'Copiar'}
              </Button>
            </Box>
            <Typography variant="h6" sx={{ mt: 1, p: 2, bgcolor: 'white', borderRadius: 1, fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {successResponse.contrasenaGenerada}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">Cerrar</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth fullScreen={esMovil}>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>Crear Nuevo Usuario</Typography>
        <Typography variant="caption" color="text.secondary">Complete la información del empleado</Typography>
      </DialogTitle>
      <Box sx={{ px: { xs: 2, md: 3 }, pt: 2, overflowX: 'auto' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ minWidth: esMovil ? 360 : 'auto' }}>
          {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>{getStepContent(activeStep)}</DialogContent>
        <DialogActions>
          <Button onClick={activeStep === 0 ? onClose : () => setActiveStep(prev => prev - 1)} disabled={loading}>
            {activeStep === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? 'Crear Usuario' : 'Siguiente'}
          </Button>
        </DialogActions>
      </Box>
      <Snackbar open={copied} autoHideDuration={2000} message="Contraseña copiada" />
      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}

export default CreateUserModal;
