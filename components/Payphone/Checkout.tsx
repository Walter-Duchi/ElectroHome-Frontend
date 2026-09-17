import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Paper, Divider, CircularProgress, Alert,
  Button, Grid, Snackbar,
} from '@mui/material';
import { cartService } from '../../services/cartService';
import type { CartItem } from '../../src/types/ecommerce';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface PayphoneInitData {
  clientTransactionId: string; amount: number; amountWithoutTax: number;
  amountWithTax: number; tax: number; token: string; storeId: string;
  reference: string; currency: string; urlResponse: string;
}

declare global { interface Window { PPaymentButtonBox: any; } }

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [initData, setInitData] = useState<PayphoneInitData | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => { loadCart(); }, []);

  useEffect(() => {
    if (initData) {
      if (!document.querySelector('#payphone-css')) {
        const link = document.createElement('link');
        link.id = 'payphone-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css';
        document.head.appendChild(link);
      }
      if (!document.querySelector('#payphone-js')) {
        const script = document.createElement('script');
        script.id = 'payphone-js';
        script.type = 'module';
        script.src = 'https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js';
        document.head.appendChild(script);
        script.onload = renderPayphoneBox;
      } else { renderPayphoneBox(); }
    }
  }, [initData]);

  const loadCart = async () => {
    try {
      const items = await cartService.getCart();
      if (items.length === 0) { navigate('/cart'); return; }
      setCartItems(items);
      const r = await api.post('/payphone/init');
      setInitData(r.data);
    } catch (err: any) {
      setSnackbarMessage(err.response?.data?.error || 'Error al cargar carrito');
      setSnackbarOpen(true);
    } finally { setLoading(false); }
  };

  const renderPayphoneBox = () => {
    if (!window.PPaymentButtonBox || !initData) return;
    const container = document.getElementById('pp-button');
    if (container) container.innerHTML = '';
    const ppb = new window.PPaymentButtonBox({
      token: initData.token, clientTransactionId: initData.clientTransactionId,
      amount: initData.amount, amountWithoutTax: initData.amountWithoutTax,
      amountWithTax: initData.amountWithTax, tax: initData.tax,
      currency: initData.currency, storeId: initData.storeId,
      reference: initData.reference, urlResponse: initData.urlResponse,
      lang: 'es', defaultMethod: 'card',
    });
    ppb.render('pp-button');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando información de pago...</Typography>
      </Container>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Finalizar compra</Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>Resumen de tu pedido</Typography>
            {cartItems.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 1 }}>
                <Typography sx={{ wordBreak: 'break-word' }}>
                  {item.nombreProducto} x {item.cantidad}
                </Typography>
                <Typography>${item.subtotal.toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${total.toFixed(2)}</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom>Método de pago</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Paga con Payphone (tarjeta o saldo Payphone)
            </Typography>
            {initData ? <div id="pp-button" style={{ minHeight: '200px', width: '100%' }} /> : <CircularProgress size={24} />}
            <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => navigate('/cart')}>
              Cancelar y volver al carrito
            </Button>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Checkout;
