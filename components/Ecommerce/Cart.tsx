import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Button, TextField, Divider, Alert, CircularProgress,
  Snackbar, Card, CardContent, Stack,
} from '@mui/material';
import { Delete, Add, Remove, ShoppingCart as CartIcon } from '@mui/icons-material';
import { useAuth } from '../../services/authContext';
import { useCart } from '../../services/cartContext';
import { useNavigate } from 'react-router-dom';
import { useResponsive } from '../../src/hooks/useResponsive';

const Cart: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { esMovil } = useResponsive();
  const { items: cartItems, loading, removeItem, updateQuantity, clearCart } = useCart();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => { if (!auth.isAuthenticated) navigate('/login'); }, [auth.isAuthenticated, navigate]);

  const handleQuantityChange = async (productoId: number, newQty: number) => {
    if (newQty < 1) return;
    try { await updateQuantity(productoId, newQty); }
    catch { setSnackbarMessage('Error al actualizar'); setSnackbarSeverity('error'); setSnackbarOpen(true); }
  };
  const handleRemoveItem = async (productoId: number) => {
    try { await removeItem(productoId); }
    catch { setSnackbarMessage('Error al eliminar'); setSnackbarSeverity('error'); setSnackbarOpen(true); }
  };
  const handleClearCart = async () => {
    try { await clearCart(); }
    catch { setSnackbarMessage('Error al vaciar'); setSnackbarSeverity('error'); setSnackbarOpen(true); }
  };

  const total = cartItems.reduce((sum, i) => sum + i.subtotal, 0);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.35rem', sm: '1.75rem' } }}>
        <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Mi Carrito
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {cartItems.length === 0 ? (
        <Paper sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>Tu carrito está vacío</Typography>
          <Button variant="contained" onClick={() => navigate('/')}>Ir a la tienda</Button>
        </Paper>
      ) : (
        <>
          {esMovil ? (
            <Stack spacing={2}>
              {cartItems.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 72, height: 72, flexShrink: 0, overflow: 'hidden', borderRadius: 1 }}>
                        <img src={item.imagenUrl || '/placeholder.jpg'} alt={item.nombreProducto}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body1" fontWeight={600} noWrap>{item.nombreProducto}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          ${item.precioUnitario.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                          Subtotal: ${item.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                      <IconButton color="error" size="small" onClick={() => handleRemoveItem(item.productoId)}>
                        <Delete />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
                      <IconButton size="small" onClick={() => handleQuantityChange(item.productoId, item.cantidad - 1)}>
                        <Remove />
                      </IconButton>
                      <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.cantidad}</Typography>
                      <IconButton size="small" onClick={() => handleQuantityChange(item.productoId, item.cantidad + 1)}>
                        <Add />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cartItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 60, height: 60, flexShrink: 0, mr: 2, overflow: 'hidden', borderRadius: 1 }}>
                            <img src={item.imagenUrl || '/placeholder.jpg'} alt={item.nombreProducto}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </Box>
                          <Typography variant="body1">{item.nombreProducto}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${item.precioUnitario.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton size="small" onClick={() => handleQuantityChange(item.productoId, item.cantidad - 1)}>
                            <Remove />
                          </IconButton>
                          <TextField value={item.cantidad} size="small" type="number"
                            inputProps={{ min: 1, style: { textAlign: 'center', width: 60 } }}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              if (!isNaN(v) && v >= 1) handleQuantityChange(item.productoId, v);
                            }} />
                          <IconButton size="small" onClick={() => handleQuantityChange(item.productoId, item.cantidad + 1)}>
                            <Add />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <IconButton color="error" onClick={() => handleRemoveItem(item.productoId)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box sx={{
            mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2,
          }}>
            <Button variant="outlined" color="error" onClick={handleClearCart}
              sx={{ width: { xs: '100%', sm: 'auto' } }}>Vaciar carrito</Button>
            <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
              <Typography variant="h5" gutterBottom>Total: ${total.toFixed(2)}</Typography>
              <Button variant="contained" size="large" onClick={() => navigate('/checkout')}
                sx={{ width: { xs: '100%', sm: 'auto' } }}>Proceder al pago</Button>
            </Box>
          </Box>
        </>
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;
