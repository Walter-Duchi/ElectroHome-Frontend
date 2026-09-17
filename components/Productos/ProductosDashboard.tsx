import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Tabs, Tab, Paper, Button, Alert,
  Dialog, DialogTitle, DialogContent, IconButton, Card, CardContent, CardActions,
  Grid, Chip, Snackbar,
} from '@mui/material';
import { Add, Refresh, Edit, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { productoManagementService } from '../../services/productoManagementService';
import type { ProductoManagement, Categoria, Marca } from '../../src/types/producto';
import ProductoForm from './ProductoForm';
import CategoriaForm from './CategoriaForm';
import MarcaForm from './MarcaForm';
import { useResponsive } from '../../src/hooks/useResponsive';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductosDashboard: React.FC = () => {
  const { esMovil } = useResponsive();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');
  const [productos, setProductos] = useState<ProductoManagement[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [openProductoDialog, setOpenProductoDialog] = useState(false);
  const [editProducto, setEditProducto] = useState<ProductoManagement | null>(null);
  const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
  const [editCategoria, setEditCategoria] = useState<Categoria | null>(null);
  const [openMarcaDialog, setOpenMarcaDialog] = useState(false);
  const [editMarca, setEditMarca] = useState<Marca | null>(null);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [prods, cats, marcasData] = await Promise.all([
        productoManagementService.getProductos(true),
        productoManagementService.getCategorias(true),
        productoManagementService.getMarcas(),
      ]);
      setProductos(prods); setCategorias(cats); setMarcas(marcasData);
    } catch {
      setSnackbarMessage('Error al cargar datos');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const handleToggleActivo = async (id: number, activo: boolean) => {
    try {
      await productoManagementService.toggleProductoActivo(id, activo);
      setSnackbarMessage(`Producto ${activo ? 'activado' : 'desactivado'}`);
      setSnackbarSeverity('success'); setSnackbarOpen(true);
      cargarDatos();
    } catch {
      setSnackbarMessage('Error al cambiar estado');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3,
      }}>
        <Typography variant="h4">Gestión de Productos</Typography>
        <Button startIcon={<Refresh />} onClick={cargarDatos} sx={{ width: { xs: '100%', sm: 'auto' } }}>Refrescar</Button>
      </Box>
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="scrollable"
          scrollButtons="auto" allowScrollButtonsMobile sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Productos" />
          <Tab label="Categorías" />
          <Tab label="Marcas" />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Add />}
              onClick={() => { setEditProducto(null); setOpenProductoDialog(true); }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}>Nuevo Producto</Button>
          </Box>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {productos.map(p => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                <Card>
                  <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                    <Box component="img" src={p.imagenUrl || '/placeholder.jpg'} alt={p.nombreCompleto}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" noWrap>{p.nombreCompleto}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      SKU: {p.sku} | Código: {p.codigo}
                    </Typography>
                    <Typography variant="body2">Precio: ${p.precio.toFixed(2)}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Chip size="small" label={p.marcaNombre} />
                      {p.categoriaNombre && <Chip size="small" label={p.categoriaNombre} />}
                      <Chip size="small" label={p.activo ? 'Activo' : 'Inactivo'} color={p.activo ? 'success' : 'default'} />
                      <Chip size="small" label={p.visibilidad} variant="outlined" />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton size="small" onClick={() => { setEditProducto(p); setOpenProductoDialog(true); }}><Edit /></IconButton>
                    <IconButton size="small" onClick={() => handleToggleActivo(p.id, !p.activo)}>
                      {p.activo ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Add />}
              onClick={() => { setEditCategoria(null); setOpenCategoriaDialog(true); }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}>Nueva Categoría</Button>
          </Box>
          {categorias.map(c => (
            <Paper key={c.id} sx={{
              p: 2, mb: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1,
            }}>
              <Box>
                <Typography variant="subtitle1">{c.nombre}</Typography>
                <Typography variant="body2" color="text.secondary">{c.descripcion}</Typography>
                {c.categoriaPadreNombre && <Typography variant="caption">Padre: {c.categoriaPadreNombre}</Typography>}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={c.activo ? 'Activo' : 'Inactivo'} size="small" />
                <IconButton size="small" onClick={() => { setEditCategoria(c); setOpenCategoriaDialog(true); }}><Edit /></IconButton>
                <IconButton size="small" color="error" onClick={async () => {
                  if (confirm('¿Eliminar categoría?')) {
                    try {
                      await productoManagementService.deleteCategoria(c.id);
                      setSnackbarMessage('Categoría eliminada'); setSnackbarSeverity('success'); setSnackbarOpen(true);
                      cargarDatos();
                    } catch (err: any) {
                      setSnackbarMessage(err.response?.data?.message || 'Error'); setSnackbarSeverity('error'); setSnackbarOpen(true);
                    }
                  }
                }}><Delete /></IconButton>
              </Box>
            </Paper>
          ))}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<Add />}
              onClick={() => { setEditMarca(null); setOpenMarcaDialog(true); }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}>Nueva Marca</Button>
          </Box>
          {marcas.map(m => (
            <Paper key={m.id} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">{m.nombre}</Typography>
              <Box>
                <IconButton size="small" onClick={() => { setEditMarca(m); setOpenMarcaDialog(true); }}><Edit /></IconButton>
                <IconButton size="small" color="error" onClick={async () => {
                  if (confirm('¿Eliminar marca?')) {
                    try {
                      await productoManagementService.deleteMarca(m.id);
                      setSnackbarMessage('Marca eliminada'); setSnackbarSeverity('success'); setSnackbarOpen(true);
                      cargarDatos();
                    } catch (err: any) {
                      setSnackbarMessage(err.response?.data?.message || 'Error'); setSnackbarSeverity('error'); setSnackbarOpen(true);
                    }
                  }
                }}><Delete /></IconButton>
              </Box>
            </Paper>
          ))}
        </TabPanel>
      </Paper>

      <Dialog open={openProductoDialog} onClose={() => setOpenProductoDialog(false)}
        maxWidth="md" fullWidth fullScreen={esMovil}>
        <DialogTitle>{editProducto ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
        <DialogContent>
          <ProductoForm
            producto={editProducto} marcas={marcas} categorias={categorias.filter(c => c.activo)}
            onSave={async (data) => {
              setLoading(true);
              try {
                if (editProducto) await productoManagementService.updateProducto({ ...data, id: editProducto.id });
                else await productoManagementService.createProducto(data);
                setSnackbarMessage(`Producto ${editProducto ? 'actualizado' : 'creado'}`);
                setSnackbarSeverity('success'); setSnackbarOpen(true);
                setOpenProductoDialog(false); cargarDatos();
              } catch (err: any) {
                setSnackbarMessage(err.response?.data?.message || 'Error'); setSnackbarSeverity('error'); setSnackbarOpen(true);
              } finally { setLoading(false); }
            }}
            onCancel={() => setOpenProductoDialog(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openCategoriaDialog} onClose={() => setOpenCategoriaDialog(false)}
        maxWidth="sm" fullWidth fullScreen={esMovil}>
        <DialogTitle>{editCategoria ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
        <DialogContent>
          <CategoriaForm
            categoria={editCategoria}
            categoriasPadre={categorias.filter(c => c.activo && c.id !== editCategoria?.id)}
            onSave={async (data) => {
              try {
                if (editCategoria) await productoManagementService.updateCategoria({ ...data, id: editCategoria.id });
                else await productoManagementService.createCategoria(data);
                setSnackbarMessage(`Categoría ${editCategoria ? 'actualizada' : 'creada'}`);
                setSnackbarSeverity('success'); setSnackbarOpen(true);
                setOpenCategoriaDialog(false); cargarDatos();
              } catch (err: any) {
                setSnackbarMessage(err.response?.data?.message || 'Error'); setSnackbarSeverity('error'); setSnackbarOpen(true);
              }
            }}
            onCancel={() => setOpenCategoriaDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={openMarcaDialog} onClose={() => setOpenMarcaDialog(false)}
        maxWidth="sm" fullWidth fullScreen={esMovil}>
        <DialogTitle>{editMarca ? 'Editar Marca' : 'Nueva Marca'}</DialogTitle>
        <DialogContent>
          <MarcaForm
            marca={editMarca}
            onSave={async (data) => {
              try {
                if (editMarca) await productoManagementService.updateMarca({ ...data, id: editMarca.id });
                else await productoManagementService.createMarca(data);
                setSnackbarMessage(`Marca ${editMarca ? 'actualizada' : 'creada'}`);
                setSnackbarSeverity('success'); setSnackbarOpen(true);
                setOpenMarcaDialog(false); cargarDatos();
              } catch (err: any) {
                setSnackbarMessage(err.response?.data?.message || 'Error'); setSnackbarSeverity('error'); setSnackbarOpen(true);
              }
            }}
            onCancel={() => setOpenMarcaDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductosDashboard;
