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
    Link,
    Grid,
    InputAdornment,
    IconButton,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Checkbox,
    FormControlLabel,
    Snackbar,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    ArrowBack,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CANTONES_GUAYAS = [
    "Guayaquil", "Durán", "Milagro", "Daule", "Samborondón",
    "Naranjal", "Playas", "Balzar", "El Triunfo", "Yaguachi",
    "Naranjito", "Santa Lucía", "Pedro Carbo", "Salitre",
    "General Villamil (Playas)", "Coronel Marcelino Maridueña",
    "Nobol", "Lomas de Sargentillo", "Alfredo Baquerizo Moreno",
    "Balao", "Colimes", "Palestina", "Simón Bolívar", "Crnel. Lorenzo de Garaicoa",
    "El Empalme"
];

const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        tipoIdentificacion: 'Cedula',
        identificacion: '',
        ruc: '',
        correo: '',
        celular: '',
        convencional: '',
        ciudad: 'Guayaquil',
        codigoPostal: '',
        direccion: '',
        contrasena: '',
        confirmarContrasena: '',
        aceptaTerminos: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name: string) => (e: any) => {
        setFormData(prev => ({ ...prev, [name]: e.target.value }));
    };

    const validateCedula = (cedula: string): boolean => {
        if (cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;
        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let total = 0;
        for (let i = 0; i < 9; i++) {
            let valor = parseInt(cedula[i]) * coeficientes[i];
            if (valor >= 10) valor -= 9;
            total += valor;
        }
        let digitoVerificador = total % 10;
        if (digitoVerificador !== 0) digitoVerificador = 10 - digitoVerificador;
        return digitoVerificador === parseInt(cedula[9]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.nombres.trim()) {
            setSnackbarMessage('Los nombres son requeridos');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (!formData.apellidos.trim()) {
            setSnackbarMessage('Los apellidos son requeridos');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (formData.tipoIdentificacion === 'Cedula') {
            if (!formData.identificacion.trim()) {
                setSnackbarMessage('La cédula es requerida');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
            if (!validateCedula(formData.identificacion)) {
                setSnackbarMessage('Cédula ecuatoriana inválida');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
        } else {
            if (!formData.identificacion.trim() || formData.identificacion.length < 8) {
                setSnackbarMessage('Pasaporte inválido (mínimo 8 caracteres)');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
        }
        if (!formData.correo.trim() || !/\S+@\S+\.\S+/.test(formData.correo)) {
            setSnackbarMessage('Correo electrónico inválido');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (!formData.celular.trim() || !/^09\d{8}$/.test(formData.celular.replace(/\D/g, ''))) {
            setSnackbarMessage('Celular inválido (debe ser 09XXXXXXXX)');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (!formData.codigoPostal.trim() || !/^\d{6}$/.test(formData.codigoPostal)) {
            setSnackbarMessage('Código postal inválido (6 dígitos)');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (!formData.direccion.trim()) {
            setSnackbarMessage('La dirección es requerida');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (!formData.contrasena || formData.contrasena.length < 6) {
            setSnackbarMessage('La contraseña debe tener al menos 6 caracteres');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (formData.contrasena !== formData.confirmarContrasena) {
            setSnackbarMessage('Las contraseñas no coinciden');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        if (!formData.aceptaTerminos) {
            setSnackbarMessage('Debe aceptar los términos y condiciones');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        setLoading(true);
        try {
            const request = {
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                tipoIdentificacion: formData.tipoIdentificacion,
                identificacion: formData.identificacion,
                ruc: formData.ruc || undefined,
                correo: formData.correo,
                celular: formData.celular,
                convencional: formData.convencional || undefined,
                ciudad: formData.ciudad,
                codigoPostal: formData.codigoPostal,
                direccion: formData.direccion,
                rol: 'Cliente',
                numCuentaBancaria: '0000000000',
                tipoCuentaBancaria: 'Ahorro',
                contrasena: formData.contrasena,
                contribuyenteEspecial: false,
                obligadoContabilidad: false,
            };
            await api.post('/auth/register', request);
            setSnackbarMessage('Registro exitoso. Ya puedes iniciar sesión.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setSnackbarMessage(err.response?.data?.message || 'Error al registrar usuario');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <Paper elevation={24} sx={{ p: { xs: 3, md: 4 }, width: '100%', borderRadius: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Registro de Cliente
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Complete sus datos para crear una cuenta
                        </Typography>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} fullWidth required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} fullWidth required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipo de Identificación *</InputLabel>
                                    <Select value={formData.tipoIdentificacion} label="Tipo de Identificación *" onChange={handleSelectChange('tipoIdentificacion')}>
                                        <MenuItem value="Cedula">Cédula Ecuatoriana</MenuItem>
                                        <MenuItem value="Pasaporte">Pasaporte</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label={formData.tipoIdentificacion === 'Cedula' ? 'Cédula' : 'Pasaporte'} name="identificacion" value={formData.identificacion} onChange={handleChange} fullWidth required />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField label="RUC (Opcional)" name="ruc" value={formData.ruc} onChange={handleChange} fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField label="Correo Electrónico" name="correo" type="email" value={formData.correo} onChange={handleChange} fullWidth required />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Celular" name="celular" value={formData.celular} onChange={handleChange} fullWidth required placeholder="0991234567" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Teléfono Convencional (Opcional)" name="convencional" value={formData.convencional} onChange={handleChange} fullWidth />
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
                                <TextField label="Código Postal" name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} fullWidth required placeholder="090101" />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField label="Dirección Domiciliaria" name="direccion" value={formData.direccion} onChange={handleChange} fullWidth required multiline rows={2} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Contraseña" type={showPassword ? 'text' : 'password'} name="contrasena" value={formData.contrasena} onChange={handleChange} fullWidth required
                                    InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Confirmar Contraseña" type={showPassword ? 'text' : 'password'} name="confirmarContrasena" value={formData.confirmarContrasena} onChange={handleChange} fullWidth required />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FormControlLabel control={<Checkbox checked={formData.aceptaTerminos} onChange={handleChange} name="aceptaTerminos" />} label="Acepto los términos y condiciones" />
                            </Grid>
                            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
                                    {loading ? <CircularProgress size={24} /> : 'Registrarse'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Link component={RouterLink} to="/login" variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <ArrowBack fontSize="small" /> Ya tengo cuenta, iniciar sesión
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

export default RegisterForm;
