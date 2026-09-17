import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import ProductCard from './ProductCard';
import type { Product } from '../../src/types/ecommerce';

interface ProductListProps {
  products: Product[];
  onAddToCart?: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart }) => {
  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
        <Typography variant="h6" color="text.secondary">No se encontraron productos</Typography>
      </Box>
    );
  }
  return (
    <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
      {products.map((product) => (
        <Grid key={product.id} size={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 2 }}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;
