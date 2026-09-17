import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Card, CardContent, CircularProgress,
  Alert, Button, Chip, Divider, LinearProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Snackbar, Stack,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AttachMoney, ShoppingCart, Inventory,
  ReportProblem, People, Download,
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { analistaService } from '../../services/analistaService';
import type {
  DashboardAnalista, VentaDiaria, ProductoMasVendido, CategoriaVentas,
  ReclamoEstado, ProductoBajoStock, UsuariosPorRol,
} from '../../src/types/analista';
import { useResponsive } from '../../src/hooks/useResponsive';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('es-EC').format(value);

const currencyFormatter = (value: any) => {
  if (value === undefined || value === null) return '-';
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? '-' : formatCurrency(num);
};
const numberFormatter = (value: any) => {
  if (value === undefined || value === null) return '-';
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? '-' : formatNumber(num);
};

const renderCustomLabel = ({ name, percent }: { name?: string; percent?: number }) => {
  if (!name || percent === undefined) return null;
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

const AnalistaDashboard: React.FC = () => {
  const { esMovil } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardAnalista | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => { cargarDashboard(); }, []);

  const cargarDashboard = async () => {
    setLoading(true); setError(null);
    try { setData(await analistaService.getDashboard()); }
    catch {
      setSnackbarMessage('Error al cargar el dashboard');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const handleExportVentas = async () => {
    try { await analistaService.exportarVentas(); }
    catch {
      setSnackbarMessage('Error al exportar ventas');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    }
  };
  const handleExportInventario = async () => {
    try { await analistaService.exportarInventario(); }
    catch {
      setSnackbarMessage('Error al exportar inventario');
      setSnackbarSeverity('error'); setSnackbarOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
        <Button onClick={cargarDashboard} size="small" sx={{ ml: 2 }}>Reintentar</Button>
      </Alert>
    );
  }
  if (!data) return null;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Box sx={{
        display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2, mb: 3,
      }}>
        <Typography variant="h4">Dashboard de Análisis</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportVentas}
            size={esMovil ? 'small' : 'medium'}>Exportar Ventas</Button>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportInventario}
            size={esMovil ? 'small' : 'medium'}>Exportar Inventario</Button>
        </Stack>
      </Box>

      <Grid container spacing={{ xs: 1.5, md: 3 }} sx={{ mb: 4 }}>
        {[
          { title: 'Ingresos Totales', value: formatCurrency(data.resumen.totalIngresos), sub: `${Math.abs(data.ventasUltimos30Dias.variacionPorcentual).toFixed(1)}% vs periodo anterior`, icon: <AttachMoney sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} /> },
          { title: 'Ventas (30 días)', value: formatNumber(data.resumen.totalVentas), sub: `Promedio: ${formatCurrency(data.resumen.promedioVenta)}`, icon: <ShoppingCart sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.7 }} /> },
          { title: 'Productos en Inventario', value: formatNumber(data.resumen.productosEnInventario), sub: `${data.inventario.totalProductos} diferentes`, icon: <Inventory sx={{ fontSize: 40, color: '#ff9800', opacity: 0.7 }} /> },
          { title: 'Reclamos Pendientes', value: formatNumber(data.resumen.reclamosPendientes), sub: `${data.reclamosPorEstado.length} estados`, icon: <ReportProblem sx={{ fontSize: 40, color: '#f44336', opacity: 0.7 }} /> },
        ].map((card, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography color="textSecondary" gutterBottom variant="body2">{card.title}</Typography>
                  <Typography variant="h5">{card.value}</Typography>
                  <Typography variant="body2" color="textSecondary">{card.sub}</Typography>
                </Box>
                {card.icon}
              </Box>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={{ xs: 1.5, md: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
            <Typography variant="h6" gutterBottom>Ventas Diarias (30 días)</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.ventasUltimos30Dias.ventasDiarias.map((v: VentaDiaria) => ({
                    fecha: new Date(v.fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }),
                    total: v.total, cantidad: v.cantidadVentas,
                  }))}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={50} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={50} />
                  <RechartsTooltip formatter={(value, name) => {
                    if (name === 'Ingresos') return currencyFormatter(value);
                    if (name === 'Cantidad') return numberFormatter(value);
                    return value;
                  }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="total" stroke="#8884d8" name="Ingresos" />
                  <Line yAxisId="right" type="monotone" dataKey="cantidad" stroke="#82ca9d" name="Cantidad" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
            <Typography variant="h6" gutterBottom>Productos Más Vendidos</Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 320 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Unidades</TableCell>
                    <TableCell align="right">Ingreso</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.productosMasVendidos.slice(0, 5).map((p: ProductoMasVendido) => (
                    <TableRow key={p.productoId}>
                      <TableCell>
                        <Typography variant="body2">{p.nombreProducto}</Typography>
                        <Typography variant="caption" color="textSecondary">{p.marca}</Typography>
                      </TableCell>
                      <TableCell align="right">{p.unidadesVendidas}</TableCell>
                      <TableCell align="right">{formatCurrency(p.ingresoGenerado)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
            <Typography variant="h6" gutterBottom>Ventas por Categoría</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.ventasPorCategoria.map((c: CategoriaVentas) => ({
                  nombre: c.nombreCategoria.length > 15 ? c.nombreCategoria.substring(0, 12) + '...' : c.nombreCategoria,
                  unidades: c.unidadesVendidas, ingreso: c.ingresoGenerado,
                }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={50} />
                  <RechartsTooltip formatter={(value, name) => {
                    if (name === 'Ingresos') return currencyFormatter(value);
                    if (name === 'Unidades') return numberFormatter(value);
                    return value;
                  }} />
                  <Legend />
                  <Bar dataKey="ingreso" fill="#8884d8" name="Ingresos" />
                  <Bar dataKey="unidades" fill="#82ca9d" name="Unidades" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6" gutterBottom>Reclamos por Estado</Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.reclamosPorEstado} cx="50%" cy="50%" labelLine={false}
                    label={renderCustomLabel} outerRadius={esMovil ? '60%' : '70%'}
                    fill="#8884d8" dataKey="cantidad" nameKey="estado">
                    {data.reclamosPorEstado.map((_e, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: unknown) => `${value as number} reclamos`} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Divider sx={{ my: 2, width: '100%' }} />
            <TableContainer sx={{ maxHeight: 220, width: '100%', overflowX: 'auto' }}>
              <Table size="small" stickyHeader sx={{ minWidth: 280 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Porcentaje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.reclamosPorEstado.map((e: ReclamoEstado) => (
                    <TableRow key={e.estado}>
                      <TableCell>{e.estado}</TableCell>
                      <TableCell align="right">{e.cantidad}</TableCell>
                      <TableCell align="right">{e.porcentaje.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
            <Typography variant="h6" gutterBottom>Productos con Bajo Stock</Typography>
            {data.inventario.productosBajoStock.length === 0 ? (
              <Alert severity="success">No hay productos con bajo stock</Alert>
            ) : (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 400 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Stock</TableCell>
                      <TableCell align="right">Umbral</TableCell>
                      <TableCell align="right">Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.inventario.productosBajoStock.map((p: ProductoBajoStock) => (
                      <TableRow key={p.productoId}>
                        <TableCell>{p.nombreProducto}</TableCell>
                        <TableCell align="right">{p.stockActual}</TableCell>
                        <TableCell align="right">{p.umbralMinimo}</TableCell>
                        <TableCell align="right">
                          <Chip size="small" label={p.stockActual === 0 ? 'Agotado' : 'Bajo stock'}
                            color={p.stockActual === 0 ? 'error' : 'warning'} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
            <Typography variant="h6" gutterBottom>Usuarios Activos</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <People sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4">{data.usuarios.total}</Typography>
                <Typography variant="body2" color="textSecondary">
                  +{data.usuarios.nuevosUltimoMes} nuevos
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Distribución por rol</Typography>
            {data.usuarios.porRol.map((r: UsuariosPorRol) => (
              <Box key={r.rol} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">{r.rol}</Typography>
                  <Typography variant="body2">{r.cantidad}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={(r.cantidad / data.usuarios.total) * 100}
                  sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AnalistaDashboard;
