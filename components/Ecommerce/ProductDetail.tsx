import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Paper, Button, Divider, Chip, CircularProgress, Alert,
} from '@mui/material';
import { AddShoppingCart, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuth } from '../../services/authContext';
import { useCart } from '../../services/cartContext';
import type { Product } from '../../src/types/ecommerce';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => { if (id) loadProduct(parseInt(id)); }, [id]);

  const loadProduct = async (productId: number) => {
    setLoading(true);
    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
      setSelectedImage(data.imagenPrincipal || '');
    } catch { setError('No se pudo cargar el producto'); }
    finally { setLoading(false); }
  };

  const handleAddToCart = async () => {
    if (!auth.isAuthenticated) { navigate('/login'); return; }
    if (!product) return;
    try { await addToCart(product.id, 1); }
    catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2 } }}>
        <Alert severity="error">{error || 'Producto no encontrado'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mt: 2 }}>Volver</Button>
      </Container>
    );
  }
  const hasStock = product.stockDisponible > 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1.5, sm: 2 } }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mb: 2 }}>Volver</Button>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ position: 'relative', paddingTop: '100%', width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <img src={selectedImage || '/placeholder.jpg'} alt={product.nombre}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </Box>
              {product.imagenesAdicionales.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                  {product.imagenesAdicionales.map((img, i) => (
                    <Box key={i} sx={{
                      width: { xs: 64, sm: 80 }, height: { xs: 64, sm: 80 }, flexShrink: 0, cursor: 'pointer',
                      border: selectedImage === img ? '2px solid #1976d2' : '1px solid #ddd',
                      borderRadius: 1, overflow: 'hidden',
                    }} onClick={() => setSelectedImage(img)}>
                      <img src={img} alt={`${product.nombre} ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.35rem', sm: '1.75rem' } }}>
              {product.nombre}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Marca: {product.marca} | SKU: {product.sku}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" color="primary" gutterBottom>${product.precio.toFixed(2)}</Typography>
            <Box sx={{ my: 2 }}>
              <Chip label={hasStock ? 'En stock' : 'Agotado'}
                color={hasStock ? 'success' : 'error'} variant="outlined" />
            </Box>
            <Typography variant="body1" paragraph>{product.descripcion}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Garantía: {product.diasGarantia} días
            </Typography>
            <Button variant="contained" size="large" startIcon={<AddShoppingCart />}
              onClick={handleAddToCart} disabled={!hasStock}
              sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}>
              Agregar al carrito
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetail;
