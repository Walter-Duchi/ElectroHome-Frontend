import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import EcommerceLayout from './EcommerceLayout';
import ProductList from './ProductList';
import { productService } from '../../services/productService';
import type { Product, ProductFilter } from '../../src/types/ecommerce';

interface TabPanelProps { children?: React.ReactNode; index: number; value: number; }
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

const EcommerceHome: React.FC = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { loadFilteredProducts(); }, [searchQuery, selectedCategory]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [popular, newArr] = await Promise.all([
        productService.getPopularProducts(),
        productService.getNewArrivals(),
      ]);
      setPopularProducts(popular);
      setNewArrivals(newArr);
      await loadFilteredProducts();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadFilteredProducts = async () => {
    setLoading(true);
    try {
      const filter: ProductFilter = {};
      if (searchQuery) filter.busqueda = searchQuery;
      if (selectedCategory) filter.categoriaId = selectedCategory;
      setFilteredProducts(await productService.getProducts(filter));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <EcommerceLayout
      onSearch={(q) => setSearchQuery(q)}
      onCategoryChange={(c) => setSelectedCategory(c)}
      selectedCategory={selectedCategory}>
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 1.5, md: 2 } }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}
            variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <Tab label="Todos los productos" />
            <Tab label="Más populares" />
            <Tab label="Novedades" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {loading ? <Typography>Cargando...</Typography>
            : <ProductList products={filteredProducts} onAddToCart={() => {}} />}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {loading ? <Typography>Cargando...</Typography>
            : <ProductList products={popularProducts} onAddToCart={() => {}} />}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {loading ? <Typography>Cargando...</Typography>
            : <ProductList products={newArrivals} onAddToCart={() => {}} />}
        </TabPanel>
      </Container>
    </EcommerceLayout>
  );
};

export default EcommerceHome;
