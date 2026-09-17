import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import FacturaView from './FacturaView';

const DetalleFactura: React.FC = () => {
  const { ventaId } = useParams<{ ventaId: string }>();
  const id = parseInt(ventaId || '0');
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>Detalle de Factura</Typography>
      <FacturaView ventaId={id} />
    </Container>
  );
};

export default DetalleFactura;
