import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  MenuItem, Box, Typography, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, FormControl, InputLabel, Select, CircularProgress, Alert,
  TablePagination, Snackbar,
} from '@mui/material';
import { Edit, Refresh } from '@mui/icons-material';
import { inventarioService } from '../../services/inventarioService';
import type { ProductoManagement } from '../../src/types/producto';
import type { Ubicacion, NumeroSerie } from '../../src/types/inventario';
import { useResponsive } from '../../src/hooks/useResponsive';

interface NumerosSerieListProps {
  productos: ProductoManagement[];
  ubicaciones: Ubicacion[];
  onRefresh: () => void;
}

const NumerosSerieList: React.FC<NumerosSerieListProps> = ({ productos, ubicaciones, onRefresh }) => {
  const { esMovil } = useResponsive();
  const [numeros, setNumeros] = useState<NumeroSerie[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');
  const [filtroProductoId, setFiltroProductoId] = useState<number | ''>('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroUbicacionId, setFiltroUbicacionId] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState<NumeroSerie | null>(null);
  const [editForm, setEditForm] = useState({ ubicacionId: '' as number | '', estadoInventario: '' });
  const [editLoading, setEditLoading] = useState(false);

  const estadosDisponibles = [
    'Se_Puede_Vender', 'Vendido', 'Entregado_Como_Reemplazo_Al_Cliente',
    'Recibido_Del_Cliente_Por_Defecto_De_Fabrica',
  ];

  useEffect(() => { cargarNumeros(); }, [filtroProductoId, filtroEstado, filtroUbicacionId]);

  const cargarNumeros = async () => {
    setLoading(true);
    try {
      setNumeros(await inventarioService.getNumerosSerie(
        filtroProductoId || undefined, filtroEstado || undefined, filtroUbicacionId || undefined,
      ));
    } catch (err: any) {
      setSnackbarMessage(err.message || 'Error al cargar');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const handleOpenEdit = (serie: NumeroSerie) => {
    setSelectedSerie(serie);
    setEditForm({ ubicacionId: serie.ubicacionId || '', estadoInventario: serie.estadoInventario });
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedSerie) return;
    setEditLoading(true);
    try {
      await inventarioService.updateNumeroSerie({
        id: selectedSerie.id,
        ubicacionId: editForm.ubicacionId || undefined,
        estadoInventario: editForm.estadoInventario,
      });
      setSnackbarMessage('Actualizado'); setSnackbarSeverity('success'); setSnackbarOpen(true);
      setTimeout(() => { setEditOpen(false); cargarNumeros(); onRefresh(); }, 1200);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.message || 'Error'); setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setEditLoading(false); }
  };

  const paginatedNumeros = numeros.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Se_Puede_Vender': return 'success';
      case 'Vendido': return 'error';
      case 'Entregado_Como_Reemplazo_Al_Cliente': return 'warning';
      case 'Recibido_Del_Cliente_Por_Defecto_De_Fabrica': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
          <InputLabel>Producto</InputLabel>
          <Select value={filtroProductoId} label="Producto" onChange={(e) => setFiltroProductoId(e.target.value as number | '')}>
            <MenuItem value="">Todos</MenuItem>
            {productos.map(p => (<MenuItem key={p.id} value={p.id}>{p.nombreCompleto}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
          <InputLabel>Estado</InputLabel>
          <Select value={filtroEstado} label="Estado" onChange={(e) => setFiltroEstado(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {estadosDisponibles.map(e => (<MenuItem key={e} value={e}>{e.replace(/_/g, ' ')}</MenuItem>))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
          <InputLabel>Ubicación</InputLabel>
          <Select value={filtroUbicacionId} label="Ubicación" onChange={(e) => setFiltroUbicacionId(e.target.value as number | '')}>
            <MenuItem value="">Todas</MenuItem>
            {ubicaciones.map(u => (<MenuItem key={u.id} value={u.id}>{u.nombre} ({u.codigo})</MenuItem>))}
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={cargarNumeros}>Refrescar</Button>
      </Box>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>N° Serie</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Fecha Ingreso</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={40} /></TableCell></TableRow>
            ) : paginatedNumeros.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center"><Typography sx={{ py: 2 }}>No hay registros</Typography></TableCell></TableRow>
            ) : (
              paginatedNumeros.map(ns => (
                <TableRow key={ns.id}>
                  <TableCell><strong>{ns.numeroSerie}</strong></TableCell>
                  <TableCell>{ns.productoNombre}</TableCell>
                  <TableCell><Chip label={ns.estadoInventario.replace(/_/g, ' ')} color={getEstadoColor(ns.estadoInventario)} size="small" /></TableCell>
                  <TableCell>{ns.ubicacionNombre || '-'}</TableCell>
                  <TableCell>{ns.proveedorNombre}</TableCell>
                  <TableCell>{new Date(ns.fechaIngreso).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleOpenEdit(ns)} color="primary"><Edit /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={esMovil ? [5, 10] : [5, 10, 25]}
          component="div"
          count={numeros.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth fullScreen={esMovil}>
        <DialogTitle>Editar Número de Serie</DialogTitle>
        <DialogContent>
          {selectedSerie && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>N° serie: {selectedSerie.numeroSerie}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>Producto: {selectedSerie.productoNombre}</Typography>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Ubicación</InputLabel>
                <Select value={editForm.ubicacionId} label="Ubicación"
                  onChange={(e) => setEditForm(prev => ({ ...prev, ubicacionId: e.target.value as any }))}>
                  <MenuItem value="">Sin ubicación</MenuItem>
                  {ubicaciones.map(u => (<MenuItem key={u.id} value={u.id}>{u.nombre} ({u.codigo})</MenuItem>))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Estado</InputLabel>
                <Select value={editForm.estadoInventario} label="Estado"
                  onChange={(e) => setEditForm(prev => ({ ...prev, estadoInventario: e.target.value }))}>
                  {estadosDisponibles.map(e => (<MenuItem key={e} value={e}>{e.replace(/_/g, ' ')}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={editLoading}>
            {editLoading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
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

export default NumerosSerieList;
