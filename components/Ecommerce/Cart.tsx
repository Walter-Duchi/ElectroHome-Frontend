import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Delete, Add, Remove, ShoppingCart as CartIcon } from '@mui/icons-material';
import { useAuth } from '../../services/authContext';
import { useCart } from '../../services/cartContext';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { items: cartItems, loading, removeItem, updateQuantity, clearCart, refreshCart } = useCart();
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('error');

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth.isAuthenticated]);

  const handleQuantityChange = async (productoId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productoId, newQuantity);
    } catch (err) {
      setSnackbarMessage('Error al actualizar cantidad');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleRemoveItem = async (productoId: number) => {
    try {
      await removeItem(productoId);
    } catch (err) {
      setSnackbarMessage('Error al eliminar producto');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (err) {
      setSnackbarMessage('Error al vaciar el carrito');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Mi Carrito
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {cartItems.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Ir a la tienda
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
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
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            flexShrink: 0,
                            mr: 2,
                            overflow: 'hidden',
                            borderRadius: 1,
                          }}
                        >
                          <img
                            src={item.imagenUrl || '/placeholder.jpg'}
                            alt={item.nombreProducto}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                        <Typography variant="body1">{item.nombreProducto}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">${item.precioUnitario.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.productoId, item.cantidad - 1)}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          value={item.cantidad}
                          size="small"
                          type="number"
                          inputProps={{ min: 1, style: { textAlign: 'center', width: 60 } }}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1) {
                              handleQuantityChange(item.productoId, val);
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.productoId, item.cantidad + 1)}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => handleRemoveItem(item.productoId)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="outlined" color="error" onClick={handleClearCart}>
              Vaciar carrito
            </Button>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h5" gutterBottom>
                Total: ${total.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/checkout')}
              >
                Proceder al pago
              </Button>
            </Box>
          </Box>
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;
