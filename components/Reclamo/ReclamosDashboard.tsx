import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Chip, CircularProgress,
  Alert, Collapse, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Accordion,
  AccordionSummary, AccordionDetails, FormControl, InputLabel, Select, MenuItem,
  InputAdornment, Tabs, Tab, Divider, Tooltip, Snackbar, Stack,
} from '@mui/material';
import {
  Search, FilterList, ExpandMore, ExpandLess, PictureAsPdf, Download, Visibility,
  Receipt, LocalShipping, CheckCircle, Pending, Build, Block, Paid, Refresh, Clear,
  Assessment, Timeline, Info,
} from '@mui/icons-material';
import { clienteService } from '../../services/clienteService';
import { type ClienteDashboardResponse, type ClienteProductoDTO } from '../../src/types/cliente';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useResponsive } from '../../src/hooks/useResponsive';

const ReclamosDashboard: React.FC = () => {
  const { esMovil } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ClienteDashboardResponse | null>(null);
  const [filtros, setFiltros] = useState({
    codigoReclamo: '', numeroSerie: '', tipoReclamo: '', estado: '',
    fechaDesde: null as Date | null, fechaHasta: null as Date | null,
    soloPendientes: false, soloAprobados: false, soloCompensados: false,
    soloReembolsos: false, soloReemplazos: false,
  });
  const [showFiltros, setShowFiltros] = useState(false);
  const [expandedReclamo, setExpandedReclamo] = useState<number | null>(null);
  const [expandedProductos, setExpandedProductos] = useState<number[]>([]);
  const [pdfDialog, setPdfDialog] = useState<{
    open: boolean; tipo: 'tecnico' | 'entrega'; nombreArchivo: string; base64?: string;
  }>({ open: false, tipo: 'tecnico', nombreArchivo: '' });
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  const cargarDashboard = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const request = {
        ...filtros,
        fechaDesde: filtros.fechaDesde?.toISOString(),
        fechaHasta: filtros.fechaHasta?.toISOString(),
      };
      setData(await clienteService.obtenerDashboard(request));
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al cargar');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  }, [filtros]);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  const abrirPdf = async (tipo: 'tecnico' | 'entrega', nombreArchivo: string) => {
    try {
      const pdfData = await clienteService.obtenerPdf(tipo, nombreArchivo);
      setPdfDialog({ open: true, tipo, nombreArchivo, base64: pdfData.pdfBase64 });
    } catch (e: any) {
      setSnackbarMessage(e.message || 'Error al cargar PDF');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return <Pending color="warning" />;
      case 'En Revision': return <Build color="info" />;
      case 'Aprobado': return <CheckCircle color="success" />;
      case 'Rechazado': return <Block color="error" />;
      case 'Compensado': return <Paid color="secondary" />;
      default: return <Info color="action" />;
    }
  };

  const renderEstadisticas = () => {
    if (!data) return null;
    const stats = data.estadisticas;
    const items = [
      { label: 'Total', value: stats.totalReclamos, icon: <Assessment />, color: 'primary' },
      { label: 'Pendientes', value: stats.productosPendientes, icon: <Pending />, color: 'warning' },
      { label: 'En Rev.', value: stats.productosEnRevision, icon: <Build />, color: 'info' },
      { label: 'Aprobados', value: stats.productosAprobados, icon: <CheckCircle />, color: 'success' },
      { label: 'Rechazados', value: stats.productosRechazados, icon: <Block />, color: 'error' },
      { label: 'Compensados', value: stats.productosCompensados, icon: <Paid />, color: 'secondary' },
      { label: 'Reembolsos', value: stats.reembolsosTotales, icon: <Receipt />, color: 'primary' },
      { label: 'Reemplazos', value: stats.reemplazosTotales, icon: <LocalShipping />, color: 'secondary' },
    ];
    return (
      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
        {items.map((s, i) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ color: `${s.color}.main`, mb: 1 }}>
                  {React.cloneElement(s.icon, { fontSize: esMovil ? 'medium' : 'large' })}
                </Box>
                <Typography variant="h5" fontWeight="bold">{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderProductoDetalle = (p: ClienteProductoDTO) => (
    <Box sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, bgcolor: 'background.default', borderRadius: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" color="text.secondary">Técnico:</Typography>
          <Typography variant="body1">{p.tecnicoNombre || 'No asignado'}</Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="body2" color="text.secondary">Fecha Revisión:</Typography>
          <Typography variant="body1">{clienteService.formatearFecha(p.fechaRevisionTecnico)}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">Explicación:</Typography>
          <Typography variant="body1">{p.explicacionRespuestaTecnico || 'Sin explicación'}</Typography>
        </Grid>
        {p.pdfRevisionTecnico && (
          <Grid size={{ xs: 12 }}>
            <Button variant="outlined" startIcon={<PictureAsPdf />}
              onClick={() => abrirPdf('tecnico', p.pdfRevisionTecnico!)}>Ver PDF</Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', height: '50vh', alignItems: 'center' }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Dashboard de Reclamos</Typography>
          <Typography variant="body1" color="text.secondary">Gestiona tus reclamos</Typography>
        </Box>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Box sx={{
              display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 2,
            }}>
              <Typography variant="h6"><FilterList sx={{ verticalAlign: 'middle', mr: 1 }} />Filtros</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="outlined" size="small"
                  onClick={() => setShowFiltros(!showFiltros)}
                  startIcon={showFiltros ? <ExpandLess /> : <ExpandMore />}>
                  {showFiltros ? 'Ocultar' : 'Mostrar'}
                </Button>
                <Button variant="contained" size="small" onClick={cargarDashboard} startIcon={<Refresh />}>
                  Actualizar
                </Button>
              </Stack>
            </Box>
            <Collapse in={showFiltros}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField label="Código" value={filtros.codigoReclamo} size="small"
                    onChange={(e) => setFiltros(p => ({ ...p, codigoReclamo: e.target.value }))} fullWidth
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField label="N° Serie" value={filtros.numeroSerie} size="small"
                    onChange={(e) => setFiltros(p => ({ ...p, numeroSerie: e.target.value }))} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo</InputLabel>
                    <Select value={filtros.tipoReclamo} label="Tipo"
                      onChange={(e) => setFiltros(p => ({ ...p, tipoReclamo: e.target.value }))}>
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Reembolso">Reembolso</MenuItem>
                      <MenuItem value="Reemplazo">Reemplazo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select value={filtros.estado} label="Estado"
                      onChange={(e) => setFiltros(p => ({ ...p, estado: e.target.value }))}>
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="Pendiente">Pendiente</MenuItem>
                      <MenuItem value="En Revision">En Revisión</MenuItem>
                      <MenuItem value="Aprobado">Aprobado</MenuItem>
                      <MenuItem value="Rechazado">Rechazado</MenuItem>
                      <MenuItem value="Compensado">Compensado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Collapse>
          </CardContent>
        </Card>
        {data && renderEstadisticas()}
        <Card>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable"
              scrollButtons="auto" allowScrollButtonsMobile sx={{ mb: 3 }}>
              <Tab icon={<Timeline />} label="Vista General" />
              <Tab icon={<Assessment />} label="Reclamos Detallados" />
            </Tabs>
            {activeTab === 0 ? (
              <Box>
                <Typography variant="h6" gutterBottom>Resumen</Typography>
                {data?.reclamos.slice(0, 3).map((r) => (
                  <Card key={r.reclamoId} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">{r.codigoReclamo}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {clienteService.formatearFecha(r.fechaCreacion)}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={1}>
                          {r.productos.map((p, i) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                              <Box sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="body2" fontWeight="bold">{p.marca} {p.modelo}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5, flexWrap: 'wrap' }}>
                                  <Chip label={p.estado} size="small"
                                    color={clienteService.getEstadoColor(p.estado) as any} />
                                  <Chip label={p.tipoReclamo} size="small" variant="outlined" />
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ mt: 3 }}>
                {data?.reclamos.map((r) => (
                  <Accordion key={r.reclamoId} expanded={expandedReclamo === r.reclamoId}
                    onChange={() => setExpandedReclamo(prev => prev === r.reclamoId ? null : r.reclamoId)}
                    sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">{r.codigoReclamo}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {clienteService.formatearFecha(r.fechaCreacion)} | {r.productos.length} productos
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 700 }}>
                          <TableHead>
                            <TableRow>
                              <TableCell>Producto</TableCell>
                              <TableCell>Estado</TableCell>
                              <TableCell>Técnico</TableCell>
                              <TableCell>Acciones</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {r.productos.map((p) => (
                              <React.Fragment key={p.reclamoProductoId}>
                                <TableRow>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="bold">
                                      {p.marca} {p.modelo}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {p.numeroSerie}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip icon={getEstadoIcon(p.estado)} label={p.estado}
                                      color={clienteService.getEstadoColor(p.estado) as any} size="small" />
                                  </TableCell>
                                  <TableCell>{p.tecnicoNombre || '-'}</TableCell>
                                  <TableCell>
                                    <Tooltip title="Detalles">
                                      <IconButton size="small"
                                        onClick={() => setExpandedProductos(prev =>
                                          prev.includes(p.reclamoProductoId) ? prev.filter(x => x !== p.reclamoProductoId)
                                            : [...prev, p.reclamoProductoId])}>
                                        {expandedProductos.includes(p.reclamoProductoId) ? <ExpandLess /> : <ExpandMore />}
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                                {expandedProductos.includes(p.reclamoProductoId) && (
                                  <TableRow><TableCell colSpan={4}>{renderProductoDetalle(p)}</TableCell></TableRow>
                                )}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
        <Dialog open={pdfDialog.open}
          onClose={() => setPdfDialog({ open: false, tipo: 'tecnico', nombreArchivo: '' })}
          maxWidth="md" fullWidth fullScreen={esMovil}>
          <DialogTitle><PictureAsPdf sx={{ verticalAlign: 'middle', mr: 1 }} />{pdfDialog.nombreArchivo}</DialogTitle>
          <DialogContent>
            {pdfDialog.base64 ? (
              <Box sx={{ height: { xs: '60vh', md: '500px' } }}>
                <iframe src={`data:application/pdf;base64,${pdfDialog.base64}#toolbar=1`}
                  width="100%" height="100%" style={{ border: 'none' }} title="PDF" />
              </Box>
            ) : <CircularProgress sx={{ display: 'block', margin: 'auto' }} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPdfDialog({ open: false, tipo: 'tecnico', nombreArchivo: '' })}>Cerrar</Button>
            <Button onClick={() => pdfDialog.base64 && clienteService.descargarPdf(pdfDialog.base64, pdfDialog.nombreArchivo)}
              variant="contained" startIcon={<Download />}>Descargar</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default ReclamosDashboard;
