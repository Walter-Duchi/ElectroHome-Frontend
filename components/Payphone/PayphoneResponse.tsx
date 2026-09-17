import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Button, Snackbar } from '@mui/material';
import api from '../../services/api';
import FacturaView from '../Factura/FacturaView';
import { useCart } from '../../services/cartContext';

const PayphoneResponse: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [ventaId, setVentaId] = useState<number | null>(null);
  const [facturaError, setFacturaError] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning'>('error');

  useEffect(() => {
    const id = searchParams.get('id');
    const clientTxId = searchParams.get('clientTransactionId');
    if (!id || !clientTxId) {
      setStatus('error'); setMessage('Parámetros inválidos');
      setSnackbarMessage('Parámetros inválidos'); setSnackbarSeverity('error'); setSnackbarOpen(true);
      return;
    }
    (async () => {
      try {
        const response = await api.post('/payphone/confirm', { id: Number(id), clientTransactionId: clientTxId });
        setStatus('success');
        setMessage('¡Pago exitoso!');
        refreshCart();
        if (response.data.ventaId) {
          setVentaId(response.data.ventaId);
          try { await api.get(`/factura/html/${response.data.ventaId}`, { responseType: 'text' }); }
          catch {
            setFacturaError(true);
            setMessage('Pago exitoso pero error al generar factura.');
            setSnackbarMessage('Pago exitoso pero error al generar factura.');
            setSnackbarSeverity('warning'); setSnackbarOpen(true);
          }
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Error al confirmar pago');
        setSnackbarMessage(err.response?.data?.error || 'Error al confirmar pago');
        setSnackbarSeverity('error'); setSnackbarOpen(true);
      }
    })();
  }, [searchParams]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 }, px: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
      {status === 'loading' && (
        <Box>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography>Confirmando tu pago...</Typography>
        </Box>
      )}
      {status === 'success' && ventaId && !facturaError && (
        <Box>
          <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>
          <FacturaView ventaId={ventaId} />
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>Volver a la tienda</Button>
        </Box>
      )}
      {status === 'success' && facturaError && (
        <Box>
          <Alert severity="warning" sx={{ mb: 3 }}>{message}</Alert>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}>Reintentar</Button>
          <Button variant="outlined" onClick={() => navigate('/')}>Ir a la tienda</Button>
        </Box>
      )}
      {status === 'error' && (
        <Box>
          <Alert severity="error" sx={{ mb: 3 }}>{message}</Alert>
          <Button variant="contained" onClick={() => navigate('/cart')}>Volver al carrito</Button>
        </Box>
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

export default PayphoneResponse;
