import type React from 'react';
import { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Stepper, Step, StepLabel, Alert,
  CircularProgress, Grid, Card, CardContent, IconButton, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, MenuItem, FormControl,
  InputLabel, Select, type SelectChangeEvent, Tabs, Tab, Snackbar, Stack,
} from '@mui/material';
import {
  Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon,
  Add as AddIcon, Print as PrintIcon, Person as PersonIcon, List as ListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { reclamoService } from '../../services/reclamoService';
import type { ProductoReclamado, ValidarClienteResponse, ProductoCompradoDTO } from '../../src/types/reclamo';
import { useResponsive } from '../../src/hooks/useResponsive';

interface ClienteValidadoType {
  esValido: boolean; mensaje?: string; clienteId?: number; razonSocial?: string;
}

const CrearReclamo = () => {
  const navigate = useNavigate();
  const { esMovil } = useResponsive();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  const [identificadorCliente, setIdentificadorCliente] = useState<string>('');
  const [clienteValidado, setClienteValidado] = useState<ClienteValidadoType | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [numeroSerie, setNumeroSerie] = useState<string>('');
  const [productos, setProductos] = useState<ProductoReclamado[]>([]);
  const [formaCompensacion, setFormaCompensacion] = useState<'Reembolso' | 'Reemplazo'>('Reembolso');
  const [productosComprados, setProductosComprados] = useState<ProductoCompradoDTO[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

  const steps = ['Validar Cliente', 'Agregar Productos', 'Confirmar Reclamo'];

  const mostrarError = (msg: string) => {
    setSnackbarMessage(msg); setSnackbarSeverity('error'); setSnackbarOpen(true);
  };

  const handleValidarCliente = async (): Promise<void> => {
    if (!identificadorCliente.trim()) return mostrarError('Ingrese cédula, RUC o pasaporte');
    setLoading(true);
    try {
      const response: ValidarClienteResponse = await reclamoService.validarCliente({ identificador: identificadorCliente });
      if (response.esValido) {
        setClienteValidado(response);
        setActiveStep(1);
        setSnackbarMessage('Cliente validado'); setSnackbarSeverity('success'); setSnackbarOpen(true);
        cargarProductosComprados();
      } else { mostrarError(response.mensaje || 'Error al validar cliente'); }
    } catch { mostrarError('Error al validar cliente'); }
    finally { setLoading(false); }
  };

  const cargarProductosComprados = async () => {
    if (!identificadorCliente) return;
    setCargandoHistorial(true);
    try {
      const data = await reclamoService.obtenerProductosComprados(identificadorCliente);
      setProductosComprados(data);
    } catch (error) { console.error(error); }
    finally { setCargandoHistorial(false); }
  };

  const handleAgregarProducto = async (): Promise<void> => {
    if (!numeroSerie.trim()) return mostrarError('Ingrese número de serie');
    if (productos.some(p => p.numeroSerie === numeroSerie)) return mostrarError('Ya agregado');
    setLoading(true);
    const productoId = `producto-${Date.now()}`;
    setProductos(prev => [...prev, { id: productoId, numeroSerie, formaCompensacion, tieneGarantia: false, validando: true }]);
    try {
      const response = await reclamoService.validarProducto({ numeroSerie });
      setProductos(prev => prev.map(p => p.id === productoId ? {
        ...p, validando: false, esValido: response.esValido, tieneGarantia: response.tieneGarantia,
        marca: response.marca, modelo: response.modelo, estadoInventario: response.estadoInventario,
        especificacion: response.especificacion, precio: response.precio, error: response.mensaje,
      } : p));
      if (!response.esValido || !response.tieneGarantia) {
        mostrarError(response.mensaje || 'Producto no válido');
        setProductos(prev => prev.filter(p => p.id !== productoId));
      } else { setNumeroSerie(''); setFormaCompensacion('Reembolso'); }
    } catch {
      mostrarError('Error al validar producto');
      setProductos(prev => prev.map(p => p.id === productoId ? { ...p, validando: false, error: 'Error' } : p));
    } finally { setLoading(false); }
  };

  const handleAgregarDesdeHistorial = (producto: ProductoCompradoDTO) => {
    if (productos.some(p => p.numeroSerie === producto.numeroSerie)) return mostrarError('Ya agregado');
    if (!producto.tieneGarantia) return mostrarError('Este producto no tiene garantía válida');
    setProductos(prev => [...prev, {
      id: `producto-${Date.now()}`, numeroSerie: producto.numeroSerie,
      marca: producto.marca, modelo: producto.modelo, tieneGarantia: producto.tieneGarantia,
      formaCompensacion, especificacion: `${producto.marca} ${producto.modelo}`,
      precio: producto.precio, validando: false,
    }]);
  };

  const handleEliminarProducto = (id: string) => setProductos(prev => prev.filter(p => p.id !== id));

  const handleConfirmarReclamo = async (): Promise<void> => {
    setConfirmDialogOpen(false); setLoading(true);
    const productosValidos = productos.filter(p => p.tieneGarantia);
    if (productosValidos.length === 0) {
      mostrarError('Debe agregar al menos un producto válido'); setLoading(false); return;
    }
    try {
      const response = await reclamoService.crearReclamo({
        identificadorCliente: identificadorCliente.trim(),
        productos: productosValidos.map(p => ({ numeroSerie: p.numeroSerie.trim(), formaCompensacion: p.formaCompensacion })),
      });
      if (response.exito) {
        setSnackbarMessage('¡Reclamo creado exitosamente!'); setSnackbarSeverity('success'); setSnackbarOpen(true);
        if (response.pdfBase64 && response.pdfFileName) {
          setTimeout(() => {
            reclamoService.descargarPdf(response.pdfBase64!, response.pdfFileName!);
            setTimeout(() => navigate('/'), 3000);
          }, 800);
        } else { setTimeout(() => navigate('/'), 1500); }
      } else { mostrarError(response.mensaje || 'Error al crear el reclamo'); }
    } catch (err: unknown) {
      mostrarError(err instanceof Error ? `Error: ${err.message}` : 'Error desconocido');
    } finally { setLoading(false); }
  };

  const getStepContent = (step: number) => {
    const productosValidos = productos.filter(p => p.tieneGarantia);
    switch (step) {
      case 0:
        return (
          <Box sx={{ maxWidth: { xs: '100%', sm: 500 }, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Validar Cliente</Typography>
            <TextField label="Cédula / RUC / Pasaporte" value={identificadorCliente}
              onChange={(e) => setIdentificadorCliente(e.target.value)}
              fullWidth margin="normal" placeholder="Ingrese identificación"
              disabled={loading} />
            {clienteValidado && (
              <Alert severity="success" sx={{ mt: 2 }}>Cliente: {clienteValidado.razonSocial}</Alert>
            )}
            <Button variant="contained" onClick={handleValidarCliente}
              disabled={loading || !identificadorCliente.trim()}
              sx={{ mt: 3 }} startIcon={<PersonIcon />}>
              {loading ? <CircularProgress size={24} /> : 'Validar Cliente'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Agregar Productos</Typography>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}
              variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
              <Tab label="Escribir N° Serie" />
              <Tab label="Seleccionar del Historial" />
            </Tabs>
            {tabValue === 0 && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Número de Serie" value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    fullWidth placeholder="Ingrese el número de serie" disabled={loading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Forma de Compensación</InputLabel>
                    <Select value={formaCompensacion}
                      onChange={(e: SelectChangeEvent) => setFormaCompensacion(e.target.value as 'Reembolso' | 'Reemplazo')}
                      label="Forma de Compensación">
                      <MenuItem value="Reembolso">Reembolso</MenuItem>
                      <MenuItem value="Reemplazo">Reemplazo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Button variant="contained" onClick={handleAgregarProducto}
                    disabled={loading || !numeroSerie.trim()} fullWidth
                    sx={{ height: { xs: 'auto', sm: '56px' } }} startIcon={<AddIcon />}>
                    Agregar
                  </Button>
                </Grid>
              </Grid>
            )}
            {tabValue === 1 && (
              <Box sx={{ mb: 3 }}>
                {cargandoHistorial ? <CircularProgress /> : (
                  <TableContainer component={Paper} sx={{ maxHeight: 320, overflowX: 'auto' }}>
                    <Table stickyHeader size="small" sx={{ minWidth: 620 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>N° Serie</TableCell>
                          <TableCell>Producto</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Garantía</TableCell>
                          <TableCell>Acción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productosComprados.map((prod) => (
                          <TableRow key={prod.numeroSerie}>
                            <TableCell>{prod.numeroSerie}</TableCell>
                            <TableCell>{prod.marca} {prod.modelo}</TableCell>
                            <TableCell>{prod.fechaCompra ? new Date(prod.fechaCompra).toLocaleDateString('es-EC') : '-'}</TableCell>
                            <TableCell>
                              <Chip label={prod.tieneGarantia ? 'Válida' : 'Vencida'}
                                color={prod.tieneGarantia ? 'success' : 'error'} size="small" />
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined"
                                onClick={() => handleAgregarDesdeHistorial(prod)}
                                disabled={!prod.tieneGarantia || productos.some(p => p.numeroSerie === prod.numeroSerie)}>
                                Agregar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            {productos.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Productos Agregados ({productosValidos.length} válidos)
                  </Typography>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 600 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>N° Serie</TableCell>
                          <TableCell>Marca/Modelo</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Compensación</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productos.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>{p.numeroSerie}</TableCell>
                            <TableCell>
                              {p.marca && p.modelo ? `${p.marca} ${p.modelo}`
                                : p.validando ? <CircularProgress size={20} /> : 'No válido'}
                            </TableCell>
                            <TableCell>
                              {p.validando ? <Chip label="Validando..." size="small" />
                                : p.tieneGarantia ? <Chip label="Con Garantía" color="success" size="small" icon={<CheckCircleIcon />} />
                                : <Chip label="Sin Garantía" color="error" size="small" icon={<ErrorIcon />} />}
                            </TableCell>
                            <TableCell><Chip label={p.formaCompensacion} variant="outlined" size="small" /></TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => handleEliminarProducto(p.id)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
              sx={{ mt: 3, justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => setActiveStep(0)} fullWidth={esMovil}>Atrás</Button>
              <Button variant="contained" onClick={() => setActiveStep(2)}
                disabled={productosValidos.length === 0} startIcon={<ListIcon />} fullWidth={esMovil}>
                Continuar
              </Button>
            </Stack>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>Confirmar Reclamo</Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Información del Cliente</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Identificación</Typography>
                    <Typography variant="body1">{identificadorCliente}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Nombre</Typography>
                    <Typography variant="body1">{clienteValidado?.razonSocial || 'No validado'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>Productos a Reclamar</Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 500 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>N° Serie</TableCell>
                        <TableCell>Producto</TableCell>
                        <TableCell>Compensación</TableCell>
                        <TableCell>Precio</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productosValidos.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.numeroSerie}</TableCell>
                          <TableCell>{p.marca} {p.modelo}</TableCell>
                          <TableCell><Chip label={p.formaCompensacion} variant="outlined" size="small" /></TableCell>
                          <TableCell>${p.precio?.toFixed(2) || '0.00'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Typography variant="h6">Total: {productosValidos.length}</Typography>
                </Box>
              </CardContent>
            </Card>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Verificación de Técnicos</Typography>
              <Typography variant="body2">
                El sistema asignará un técnico certificado por cada marca y generará un PDF.
              </Typography>
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => setActiveStep(1)} fullWidth={esMovil}>Atrás</Button>
              <Button variant="contained" onClick={() => setConfirmDialogOpen(true)}
                disabled={loading || productosValidos.length === 0} startIcon={<PrintIcon />} fullWidth={esMovil}>
                {loading ? <CircularProgress size={24} /> : 'Crear Reclamo'}
              </Button>
            </Stack>
          </Box>
        );
      default: return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>Crear Nuevo Reclamo</Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel={esMovil}>
          {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>
        {getStepContent(activeStep)}
      </Paper>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} fullScreen={esMovil}>
        <DialogTitle>Confirmar Creación de Reclamo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de crear el reclamo? El sistema asignará un técnico a cada producto.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleConfirmarReclamo} variant="contained" autoFocus>Sí, crear reclamo</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearReclamo;
