import React from 'react';
import {
  Card, CardMedia, CardContent, CardActions, Typography, Button, Box, IconButton, Tooltip,
} from '@mui/material';
import { AddShoppingCart } from '@mui/icons-material';
import type { Product } from '../../src/types/ecommerce';
import { useAuth } from '../../services/authContext';
import { useCart } from '../../services/cartContext';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps { product: Product; onAddToCart?: () => void; }

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { auth } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!auth.isAuthenticated) { navigate('/login'); return; }
    try { await addToCart(product.id, 1); if (onAddToCart) onAddToCart(); }
    catch (error) { console.error(error); }
  };
  const hasStock = product.stockDisponible > 0;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative', paddingTop: '100%' }}>
        <CardMedia component="img" image={product.imagenPrincipal || '/placeholder.jpg'}
          alt={product.nombre}
          sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
      <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {product.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
          {product.categoria}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontSize: { xs: '0.7rem', sm: '0.8rem' },
        }}>{product.descripcion}</Typography>
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="h6" color="primary" fontWeight={600}
            sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}>
            ${product.precio.toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
        <Tooltip title={hasStock ? 'Añadir al carrito' : 'Agotado'}>
          <span>
            <IconButton color="primary" onClick={handleAddToCart} disabled={!hasStock} size="small">
              <AddShoppingCart fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Button size="small" variant="outlined" onClick={() => navigate(`/producto/${product.id}`)}
          sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' }, px: { xs: 1, sm: 2 } }}>
          Ver detalles
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
