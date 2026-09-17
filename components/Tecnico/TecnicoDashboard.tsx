import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, Alert, CircularProgress,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Stack, Divider, Snackbar,
} from '@mui/material';
import {
  Visibility, CheckCircle, Cancel, Assignment, CalendarToday, Person, Receipt,
  Paid, Build, Engineering, Upload,
} from '@mui/icons-material';
import { useAuth } from '../../services/authContext';
import { tecnicoService } from '../../services/tecnicoService';
import { type TecnicoProducto } from '../../src/types/tecnico';
import { useResponsive } from '../../src/hooks/useResponsive';

const TecnicoDashboard: React.FC = () => {
  const { auth } = useAuth();
  const { esMovil } = useResponsive();
  const [productos, setProductos] = useState<TecnicoProducto[]>([]);
  const [proximoProducto, setProximoProducto] = useState<TecnicoProducto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRevisarDialog, setShowRevisarDialog] = useState(false);
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<TecnicoProducto | null>(null);
  const [formData, setFormData] = useState({ estado: 'Aprobado', explicacion: '', archivo: null as File | null });
  const [submitting, setSubmitting] = useState(false);
  const [ordenValido, setOrdenValido] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true); setError('');
      const data = await tecnicoService.obtenerProductosAsignados();
      setProductos(data);
      const prox = await tecnicoService.obtenerProximoProducto();
      setProximoProducto(prox);
    } catch (e: any) {
      setSnackbarMessage(e.message); setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const handleIniciarRevision = async (p: TecnicoProducto) => {
    try {
      setError('');
      const v = await tecnicoService.validarOrdenRevisacion(p.id);
      if (!v.valido) {
        setSnackbarMessage(`No puedes revisar este producto. ${v.message}`);
        setSnackbarSeverity('error'); setSnackbarOpen(true); return;
      }
      setOrdenValido(true); setProductoSeleccionado(p); setShowRevisarDialog(true);
    } catch (e: any) {
      setSnackbarMessage(e.message); setSnackbarSeverity('error'); setSnackbarOpen(true);
    }
  };

  const confirmarIniciarRevision = async () => {
    try {
      if (!productoSeleccionado) return;
      setSubmitting(true);
      await tecnicoService.iniciarRevision({
        reclamoProductoSnId: productoSeleccionado.id, tecnicoId: auth.user?.id || 0,
      });
      setShowRevisarDialog(false); setProductoSeleccionado(null); await cargarProductos();
    } catch (e: any) {
      setSnackbarMessage(e.message); setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setSubmitting(false); }
  };

  const handleFinalizarRevision = (p: TecnicoProducto) => {
    setProductoSeleccionado(p);
    setFormData({ estado: 'Aprobado', explicacion: '', archivo: null });
    setShowFinalizarDialog(true);
  };

  const confirmarFinalizarRevision = async () => {
    try {
      if (!productoSeleccionado) return;
      if (!formData.explicacion.trim()) {
        setSnackbarMessage('La explicación es requerida'); setSnackbarSeverity('error'); setSnackbarOpen(true); return;
      }
      setSubmitting(true);
      let pdfBase64 = undefined; let pdfFileName = undefined;
      if (formData.archivo) {
        pdfBase64 = await tecnicoService.convertirArchivoABase64(formData.archivo);
        pdfFileName = formData.archivo.name;
      }
      await tecnicoService.finalizarRevision({
        reclamoProductoSnId: productoSeleccionado.id, tecnicoId: auth.user?.id || 0,
        estado: formData.estado as 'Aprobado' | 'Rechazado',
        explicacion: formData.explicacion, pdfBase64, pdfFileName,
      });
      setShowFinalizarDialog(false); setProductoSeleccionado(null); await cargarProductos();
    } catch (e: any) {
      setSnackbarMessage(e.message); setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setSubmitting(false); }
  };

  const getEstadoChip = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return <Chip label="Pendiente" color="warning" size="small" />;
      case 'En Revision': return <Chip label="En Revisión" color="info" size="small" />;
      case 'Aprobado': return <Chip label="Aprobado" color="success" size="small" />;
      case 'Rechazado': return <Chip label="Rechazado" color="error" size="small" />;
      default: return <Chip label={estado} size="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          <Engineering sx={{ verticalAlign: 'middle', mr: 2 }} /> Panel del Técnico
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona los productos asignados para revisión técnica
        </Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {proximoProducto && (
        <Card sx={{ mb: 4, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid size={{ xs: 12, md: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment sx={{ fontSize: 40 }} />
                  <Typography variant="h6">Próximo Producto</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 'grow' }}>
                <Typography variant="body2"><strong>Producto:</strong> {proximoProducto.marca} {proximoProducto.modelo}</Typography>
                <Typography variant="body2"><strong>N° Serie:</strong> {proximoProducto.numeroSerie}</Typography>
                <Typography variant="body2"><strong>Cliente:</strong> {proximoProducto.clienteNombre}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 'auto' }}>
                <Button variant="contained" color="secondary" startIcon={<Visibility />}
                  onClick={() => handleIniciarRevision(proximoProducto)}
                  size="large" fullWidth>
                  Iniciar Revisión
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom>Total</Typography>
            <Typography variant="h4">{productos.length}</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom>Pendientes</Typography>
            <Typography variant="h4" color="warning.main">
              {productos.filter(p => p.estado === 'Pendiente').length}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom>En Revisión</Typography>
            <Typography variant="h4" color="info.main">
              {productos.filter(p => p.estado === 'En Revision').length}
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <Card><CardContent>
            <Typography color="text.secondary" gutterBottom>Completados</Typography>
            <Typography variant="h4" color="success.main">
              {productos.filter(p => p.estado === 'Aprobado' || p.estado === 'Rechazado').length}
            </Typography>
          </CardContent></Card>
        </Grid>
      </Grid>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Assignment sx={{ mr: 1 }} /> Productos Asignados
          </Typography>
          {productos.length === 0 ? (
            <Alert severity="info">No hay productos asignados.</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2, overflowX: 'auto' }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>N° Serie</TableCell>
                    <TableCell>Producto</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Garantía</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell><Typography variant="body2">{p.numeroSerie}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.marca} {p.modelo}</Typography>
                      </TableCell>
                      <TableCell>{p.clienteNombre}</TableCell>
                      <TableCell>{getEstadoChip(p.estado)}</TableCell>
                      <TableCell>
                        {p.garantiaValida ? <Chip label="Válida" color="success" size="small" /> :
                          <Chip label="Vencida" color="error" size="small" />}
                      </TableCell>
                      <TableCell>
                        {p.estado === 'Pendiente' && (
                          <Button variant="outlined" size="small" startIcon={<Visibility />}
                            onClick={() => handleIniciarRevision(p)}
                            disabled={p.id !== proximoProducto?.id}>Revisar</Button>
                        )}
                        {p.estado === 'En Revision' && (
                          <Button variant="contained" size="small" startIcon={<CheckCircle />}
                            onClick={() => handleFinalizarRevision(p)}>Finalizar</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRevisarDialog} onClose={() => !submitting && setShowRevisarDialog(false)}
        maxWidth="md" fullWidth fullScreen={esMovil}>
        <DialogTitle>Iniciar Revisión Técnica</DialogTitle>
        <DialogContent>
          {productoSeleccionado && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={ordenValido ? 'success' : 'warning'} sx={{ mb: 3 }}>
                {ordenValido ? 'Producto correcto para revisión.' : 'Validando...'}
              </Alert>
              <Typography variant="body2">
                <strong>Producto:</strong> {productoSeleccionado.marca} {productoSeleccionado.modelo}
              </Typography>
              <Typography variant="body2">
                <strong>N° Serie:</strong> {productoSeleccionado.numeroSerie}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRevisarDialog(false)} disabled={submitting}>Cancelar</Button>
          <Button variant="contained" onClick={confirmarIniciarRevision}
            disabled={submitting || !ordenValido}
            startIcon={submitting ? <CircularProgress size={20} /> : <Visibility />}>
            {submitting ? 'Iniciando...' : 'Iniciar Revisión'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showFinalizarDialog} onClose={() => !submitting && setShowFinalizarDialog(false)}
        maxWidth="md" fullWidth fullScreen={esMovil}>
        <DialogTitle>Finalizar Revisión</DialogTitle>
        <DialogContent>
          {productoSeleccionado && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {productoSeleccionado.marca} {productoSeleccionado.modelo} - {productoSeleccionado.numeroSerie}
              </Typography>
              <FormControl fullWidth sx={{ my: 3 }}>
                <InputLabel>Resultado</InputLabel>
                <Select value={formData.estado} label="Resultado"
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  disabled={submitting}>
                  <MenuItem value="Aprobado">Aprobado</MenuItem>
                  <MenuItem value="Rechazado">Rechazado</MenuItem>
                </Select>
                <FormHelperText>Seleccione el resultado</FormHelperText>
              </FormControl>
              <TextField label="Explicación Técnica" multiline rows={4} fullWidth
                value={formData.explicacion}
                onChange={(e) => setFormData({ ...formData, explicacion: e.target.value })}
                disabled={submitting}
                helperText="Será visible para el cliente" />
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    <Upload sx={{ mr: 1, verticalAlign: 'middle' }} /> Evidencia PDF (opcional)
                  </Typography>
                  <Button variant="outlined" component="label" startIcon={<Upload />}
                    disabled={submitting} fullWidth>
                    {formData.archivo ? 'Cambiar PDF' : 'Seleccionar PDF'}
                    <input type="file" hidden accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setFormData({ ...formData, archivo: e.target.files[0] });
                      }} />
                  </Button>
                  {formData.archivo && <Typography variant="body2" sx={{ mt: 2 }}>
                    {formData.archivo.name}
                  </Typography>}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFinalizarDialog(false)} disabled={submitting}>Cancelar</Button>
          <Button variant="contained"
            color={formData.estado === 'Aprobado' ? 'success' : 'error'}
            onClick={confirmarFinalizarRevision}
            disabled={submitting || !formData.explicacion.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> :
              (formData.estado === 'Aprobado' ? <CheckCircle /> : <Cancel />)}>
            {submitting ? 'Procesando...' : `Finalizar como ${formData.estado}`}
          </Button>
        </DialogActions>
      </Dialog>

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

export default TecnicoDashboard;
