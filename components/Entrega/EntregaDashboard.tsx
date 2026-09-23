import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, Card, CardContent, Typography, Alert, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Stepper, Step, StepLabel, StepContent, CircularProgress, Tabs, Tab,
  Snackbar, Stack,
} from '@mui/material';
import { Search, CheckCircle, Error as ErrorIcon, Download, Upload, Check } from '@mui/icons-material';
import { entregaService } from '../../services/entregaService';
import {
  type BuscarReclamoResponse, type ProductoEntregaDTO, type ReclamoPendienteEntregaDTO,
} from '../../src/types/entrega';
import { BACKEND_BASE_URL } from '../../src/config';
import { useResponsive } from '../../src/hooks/useResponsive';

const EntregaDashboard: React.FC = () => {
  const { esMovil } = useResponsive();
  const [codigoReclamo, setCodigoReclamo] = useState('');
  const [reclamo, setReclamo] = useState<BuscarReclamoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [reclamosPendientes, setReclamosPendientes] = useState<ReclamoPendienteEntregaDTO[]>([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(false);
  const [tabBusqueda, setTabBusqueda] = useState(0);
  const [asignandoAutomatico, setAsignandoAutomatico] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  const steps = ['Buscar Reclamo', 'Verificar Reemplazos', 'Generar Comprobante', 'Subir Comprobante', 'Confirmar Entrega'];

  useEffect(() => { cargarReclamosPendientes(); }, []);

  const cargarReclamosPendientes = async () => {
    setCargandoPendientes(true);
    try {
      const pendientes = await entregaService.obtenerReclamosPendientes();
      setReclamosPendientes(pendientes);
    } catch {
      setSnackbarMessage('Error cargando reclamos pendientes');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setCargandoPendientes(false); }
  };

  const handleBuscarReclamo = async () => {
    if (!codigoReclamo.trim()) {
      setSnackbarMessage('Ingrese un código de reclamo');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
      return;
    }
    setLoading(true); setError(null); setReclamo(null); setActiveStep(0);
    setPdfUrl(null); setSelectedFile(null); setFileBase64('');
    try {
      const response = await entregaService.buscarReclamo(codigoReclamo);
      if (response.exito) {
        if (!response.productos || response.productos.length === 0) {
          setSnackbarMessage('No hay productos para entregar en este reclamo.');
          setSnackbarSeverity('error'); setSnackbarOpen(true);
          setReclamo(response); return;
        }
        await asignarReemplazosYContinuar(codigoReclamo, response);
      } else {
        setSnackbarMessage(response.mensaje);
        setSnackbarSeverity('error'); setSnackbarOpen(true);
      }
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.detail || 'Error al buscar el reclamo');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const handleSeleccionarReclamoPendiente = async (codigo: string) => {
    setCodigoReclamo(codigo);
    setLoading(true); setError(null); setReclamo(null); setActiveStep(0);
    setPdfUrl(null); setSelectedFile(null); setFileBase64('');
    try {
      const response = await entregaService.buscarReclamo(codigo);
      if (response.exito) {
        if (!response.productos || response.productos.length === 0) {
          setSnackbarMessage('No hay productos para entregar en este reclamo.');
          setSnackbarSeverity('error'); setSnackbarOpen(true);
          setReclamo(response); return;
        }
        await asignarReemplazosYContinuar(codigo, response);
      } else {
        setSnackbarMessage(response.mensaje);
        setSnackbarSeverity('error'); setSnackbarOpen(true);
      }
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.detail || 'Error al buscar el reclamo');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const asignarReemplazosYContinuar = async (codigo: string, response: BuscarReclamoResponse) => {
    setAsignandoAutomatico(true);
    try {
      const resultado = await entregaService.asignarReemplazosAutomatico(codigo);
      if (!resultado.exito) throw new Error('No se pudieron asignar los reemplazos automáticamente.');
      const responseActualizada = await entregaService.buscarReclamo(codigo);
      setReclamo(responseActualizada); setActiveStep(1);
      setSnackbarMessage('Reclamo encontrado y reemplazos asignados.');
      setSnackbarSeverity('success'); setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Error al asignar reemplazos.');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
      setReclamo(response); setActiveStep(1);
    } finally { setAsignandoAutomatico(false); }
  };

  const construirUrlPdf = (rutaPdf: string): string => {
    if (!rutaPdf) return '';
    if (rutaPdf.startsWith('http://') || rutaPdf.startsWith('https://') || rutaPdf.startsWith('blob:') || rutaPdf.startsWith('data:')) {
      return rutaPdf;
    }
    return `${BACKEND_BASE_URL}${rutaPdf.startsWith('/') ? '' : '/'}${rutaPdf}`;
  };

  const descargarPdfComoArchivo = async (url: string, nombreArchivo: string): Promise<boolean> => {
    try {
      const respuesta = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
      }
      const blob = await respuesta.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = blobUrl;
      enlace.download = nombreArchivo;
      enlace.rel = 'noopener';
      enlace.style.display = 'none';
      document.body.appendChild(enlace);
      enlace.click();
      setTimeout(() => {
        if (enlace.parentNode) enlace.parentNode.removeChild(enlace);
        window.URL.revokeObjectURL(blobUrl);
      }, 300);
      return true;
    } catch (errorDescarga) {
      console.warn('Descarga directa falló, se usará fallback:', errorDescarga);
      return false;
    }
  };

  const descargarPdfConEnlace = (url: string, nombreArchivo: string): void => {
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.target = '_blank';
    enlace.rel = 'noopener';
    enlace.style.display = 'none';
    document.body.appendChild(enlace);
    enlace.click();
    setTimeout(() => {
      if (enlace.parentNode) enlace.parentNode.removeChild(enlace);
    }, 300);
  };

  const descargarPdf = async (url: string, nombreArchivo: string): Promise<void> => {
    const ok = await descargarPdfComoArchivo(url, nombreArchivo);
    if (!ok) {
      descargarPdfConEnlace(url, nombreArchivo);
    }
  };

  const handleGenerarComprobante = async () => {
    if (!reclamo) return;
    setPdfGenerating(true);
    try {
      const datos = await entregaService.generarDatosComprobante(codigoReclamo);
      const { rutaPdf } = await entregaService.generarPdfComprobante(datos);
      const fullUrl = construirUrlPdf(rutaPdf);
      setPdfUrl(fullUrl);
      const nombreArchivo = `Comprobante_Entrega_${codigoReclamo}.pdf`;
      await descargarPdf(fullUrl, nombreArchivo);
      setActiveStep(3);
      setSnackbarMessage('Comprobante generado y descargado exitosamente.');
      setSnackbarSeverity('success'); setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.detail || 'Error al generar el comprobante');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleDescargarNuevamente = async () => {
    if (!pdfUrl) return;
    const nombreArchivo = `Comprobante_Entrega_${codigoReclamo}.pdf`;
    await descargarPdf(pdfUrl, nombreArchivo);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setSnackbarMessage('Seleccione un archivo PDF'); setSnackbarSeverity('error'); setSnackbarOpen(true); return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSnackbarMessage('Máximo 10MB.'); setSnackbarSeverity('error'); setSnackbarOpen(true); return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFileBase64(base64.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubirComprobante = async () => {
    if (!reclamo || !fileBase64) {
      setSnackbarMessage('Seleccione un archivo PDF firmado');
      setSnackbarSeverity('error'); setSnackbarOpen(true); return;
    }
    setUploading(true);
    try {
      await entregaService.subirComprobante(codigoReclamo, fileBase64);
      setActiveStep(4);
      setSnackbarMessage('Comprobante firmado subido.'); setSnackbarSeverity('success'); setSnackbarOpen(true);
      setSelectedFile(null); setFileBase64('');
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.detail || 'Error al subir el comprobante');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setUploading(false); }
  };

  const handleConfirmarEntrega = async () => {
    if (!reclamo) return;
    setConfirming(true);
    try {
      await entregaService.confirmarEntrega(codigoReclamo);
      setSnackbarMessage('Entrega confirmada exitosamente'); setSnackbarSeverity('success'); setSnackbarOpen(true);
      setTimeout(() => {
        setReclamo(null); setCodigoReclamo(''); setActiveStep(0);
        setPdfUrl(null); setSelectedFile(null); setFileBase64('');
        cargarReclamosPendientes();
      }, 1500);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.detail || 'Error al confirmar la entrega');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setConfirming(false); }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Seleccione un reclamo pendiente o ingrese el código manualmente.
            </Typography>
            <Tabs value={tabBusqueda} onChange={(_, v) => setTabBusqueda(v)} sx={{ mb: 2 }}
              variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
              <Tab label="Ingresar Código" />
              <Tab label="Reclamos Pendientes" />
            </Tabs>
            {tabBusqueda === 0 && (
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField label="Código de Reclamo" value={codigoReclamo}
                    onChange={(e) => setCodigoReclamo(e.target.value)}
                    fullWidth disabled={loading || asignandoAutomatico}
                    placeholder="Ej: REC-ENTREGA-001"
                    onKeyPress={(e) => { if (e.key === 'Enter') handleBuscarReclamo(); }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button variant="contained" onClick={handleBuscarReclamo}
                    disabled={loading || asignandoAutomatico || !codigoReclamo.trim()}
                    fullWidth startIcon={<Search />}>
                    {loading || asignandoAutomatico ? 'Procesando...' : 'Buscar Reclamo'}
                  </Button>
                </Grid>
              </Grid>
            )}
            {tabBusqueda === 1 && (
              <Box>
                {cargandoPendientes ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : reclamosPendientes.length === 0 ? (
                  <Alert severity="info">No hay reclamos pendientes.</Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 700 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Código</TableCell>
                          <TableCell>Cliente</TableCell>
                          <TableCell>RUC</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Productos</TableCell>
                          <TableCell>Acción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reclamosPendientes.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell>{r.codigoReclamo}</TableCell>
                            <TableCell>{r.cliente}</TableCell>
                            <TableCell>{r.ruc}</TableCell>
                            <TableCell>{new Date(r.fechaCreacion).toLocaleDateString('es-EC')}</TableCell>
                            <TableCell>{r.cantidadProductosPendientes}</TableCell>
                            <TableCell>
                              <Button variant="outlined" size="small"
                                onClick={() => handleSeleccionarReclamoPendiente(r.codigoReclamo)}
                                disabled={loading || asignandoAutomatico}>
                                Seleccionar
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
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Los siguientes productos han sido aprobados para reemplazo.
            </Typography>
            {reclamo && !reclamo.todosProductosRevisados && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2">Atención: No todos los productos han sido revisados</Typography>
                <Typography variant="body2">
                  Pendientes: {reclamo.productosPendientesRevision} de {reclamo.totalProductosReclamo}
                </Typography>
              </Alert>
            )}
            {asignandoAutomatico && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress /><Typography sx={{ ml: 2 }}>Asignando reemplazos...</Typography>
              </Box>
            )}
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto Defectuoso</TableCell>
                    <TableCell>Marca/Modelo</TableCell>
                    <TableCell>Reemplazo</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reclamo?.productos.map((p: ProductoEntregaDTO) => (
                    <TableRow key={p.reclamoProductoSnId}>
                      <TableCell><Typography variant="body2" fontWeight="medium">
                        {p.numeroSerieProductoDefectuoso}
                      </Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.marca}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.modelo}</Typography>
                      </TableCell>
                      <TableCell>
                        {p.numeroSerieReemplazo ? (
                          <Chip label={p.numeroSerieReemplazo} size="small" color="success" icon={<CheckCircle />} />
                        ) : (
                          <Chip label="Sin asignar" size="small" color="error" icon={<ErrorIcon />} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color={p.reemplazoValido ? 'success.main' : 'error.main'}>
                          {p.mensajeValidacion || (p.reemplazoValido ? 'Asignado' : 'Pendiente')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
              sx={{ mt: 3, justifyContent: 'space-between' }}>
              <Button variant="outlined" onClick={() => setActiveStep(0)}
                disabled={asignandoAutomatico} fullWidth={esMovil}>Volver</Button>
              <Button variant="contained" onClick={() => setActiveStep(2)}
                disabled={asignandoAutomatico || !reclamo?.productos.every(p => p.reemplazoValido)}
                fullWidth={esMovil}>Continuar</Button>
            </Stack>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Genere el comprobante de entrega que será firmado por el cliente.
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Resumen del Comprobante</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">Cliente</Typography>
                    <Typography variant="body1">{reclamo?.cliente}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">RUC</Typography>
                    <Typography variant="body1">{reclamo?.ruc}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">Productos a Entregar</Typography>
                    <Typography variant="body1">{reclamo?.productos.length} productos</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            {pdfUrl && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" component="div">
                  El comprobante se descargó automáticamente. Si no lo encuentra, puede descargarlo nuevamente aquí.
                </Typography>
                <Button size="small" variant="outlined" sx={{ mt: 1 }}
                  startIcon={<Download />}
                  onClick={handleDescargarNuevamente}>
                  Descargar nuevamente
                </Button>
              </Alert>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
              sx={{ justifyContent: 'space-between', mt: 3 }}>
              <Button variant="outlined" onClick={() => setActiveStep(1)} fullWidth={esMovil}>Volver</Button>
              <Button variant="contained" onClick={handleGenerarComprobante}
                disabled={pdfGenerating}
                startIcon={pdfGenerating ? <CircularProgress size={20} /> : <Download />}
                fullWidth={esMovil}>
                {pdfGenerating ? 'Generando...' : 'Generar y Descargar Comprobante PDF'}
              </Button>
            </Stack>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Suba el comprobante firmado por el cliente.
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                1. Imprima el comprobante<br />
                2. Haga firmar al cliente<br />
                3. Escanee el comprobante<br />
                4. Súbalo aquí
              </Typography>
            </Alert>
            <input accept="application/pdf" style={{ display: 'none' }}
              id="upload-pdf" type="file" onChange={handleFileChange} />
            <label htmlFor="upload-pdf">
              <Button variant="contained" component="span" startIcon={<Upload />} sx={{ mb: 2, mr: 2 }}>
                Seleccionar PDF Firmado
              </Button>
            </label>
            {selectedFile && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Archivo: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </Typography>
              </Alert>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
              sx={{ justifyContent: 'space-between', mt: 3 }}>
              <Button variant="outlined" onClick={() => setActiveStep(2)} fullWidth={esMovil}>Volver</Button>
              <Button variant="contained" onClick={handleSubirComprobante}
                disabled={uploading || !selectedFile}
                startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
                fullWidth={esMovil}>
                {uploading ? 'Subiendo...' : 'Subir Comprobante Firmado'}
              </Button>
            </Stack>
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="body1" paragraph>Confirme la entrega de los productos.</Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2">Confirmación Final</Typography>
              <Typography variant="body2">
                Al confirmar, los productos cambiarán de estado y se registrará la entrega.
              </Typography>
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
              sx={{ justifyContent: 'space-between', mt: 3 }}>
              <Button variant="outlined" onClick={() => setActiveStep(3)} fullWidth={esMovil}>Volver</Button>
              <Button variant="contained" color="success" onClick={handleConfirmarEntrega}
                disabled={confirming}
                startIcon={confirming ? <CircularProgress size={20} /> : <Check />}
                fullWidth={esMovil}>
                {confirming ? 'Confirmando...' : 'Confirmar Entrega'}
              </Button>
            </Stack>
          </Box>
        );
      default: return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Módulo de Personal de Entrega</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>{getStepContent(index)}</StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
      <Snackbar open={snackbarOpen} autoHideDuration={7000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EntregaDashboard;
