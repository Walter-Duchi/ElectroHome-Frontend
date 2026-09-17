import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Alert, Snackbar, Box,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface FacturaResumen {
  id: number; codigoFactura: string; fechaCompra: string; totalCompra: number;
  claveAcceso: string; numeroAutorizacion: string; fechaAutorizacion: string;
}

const MisFacturas: React.FC = () => {
  const [facturas, setFacturas] = useState<FacturaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try { setFacturas((await api.get('/factura/mis-facturas')).data); }
      catch { setSnackbarMessage('No se pudieron cargar sus facturas'); setSnackbarOpen(true); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Mis Facturas</Typography>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Clave Acceso</TableCell>
              <TableCell>Fecha Autorización</TableCell>
              <TableCell align="center">Ver</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facturas.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.codigoFactura}</TableCell>
                <TableCell>{new Date(f.fechaCompra).toLocaleDateString()}</TableCell>
                <TableCell>${f.totalCompra.toFixed(2)}</TableCell>
                <TableCell>
                  <Box sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.claveAcceso}
                  </Box>
                </TableCell>
                <TableCell>{f.fechaAutorizacion ? new Date(f.fechaAutorizacion).toLocaleDateString() : '-'}</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => navigate(`/mis-facturas/${f.id}`)} color="primary" size="small">
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar open={snackbarOpen} autoHideDuration={7000} onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MisFacturas;
