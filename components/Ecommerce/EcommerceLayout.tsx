import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Badge, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Button, InputBase, FormControl,
  OutlinedInput, Select, useTheme, alpha, Drawer, List, ListItem,
  ListItemButton, Collapse,
} from '@mui/material';
import {
  Receipt, ShoppingCart, AccountCircle, ExitToApp, Dashboard, Assignment,
  Menu as MenuIcon, Search as SearchIcon, Close as CloseIcon, Store, Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../services/authContext';
import { useCart } from '../../services/cartContext';
import { Link, useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../src/types/ecommerce';
import { ThemeSelector } from '../ThemeSelector/ThemeSelector';
import { useResponsive } from '../../src/hooks/useResponsive';

interface EcommerceLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onCategoryChange?: (categoryId?: number) => void;
  selectedCategory?: number;
}

const EcommerceLayout: React.FC<EcommerceLayoutProps> = ({
  children, onSearch, onCategoryChange, selectedCategory,
}) => {
  const { auth, logout, userRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const { esMovil } = useResponsive();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [busquedaMovilAbierta, setBusquedaMovilAbierta] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    try { setCategories(await categoryService.getAllCategories()); }
    catch (error) { console.error('Error loading categories', error); }
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); handleMenuClose(); setDrawerAbierto(false); navigate('/'); };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    setBusquedaMovilAbierta(false);
    setDrawerAbierto(false);
  };

  const handleCategoryChange = (categoryId?: number) => {
    if (onCategoryChange) onCategoryChange(categoryId);
  };

  const nombreCompleto = auth.user?.nombres && auth.user?.apellidos
    ? `${auth.user.nombres} ${auth.user.apellidos}`
    : auth.user?.correo?.split('@')[0] || 'Usuario';

  const goTo = (ruta: string) => { handleMenuClose(); setDrawerAbierto(false); navigate(ruta); };

  const searchBox = (
    <Box component="form" onSubmit={handleSearchSubmit}
      sx={{ flexGrow: 1, mr: { xs: 0, sm: 2 }, width: '100%' }}>
      <Box sx={{
        position: 'relative', borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.black, 0.05),
        '&:hover': { backgroundColor: alpha(theme.palette.common.black, 0.1) },
        width: '100%',
      }}>
        <Box sx={{
          padding: theme.spacing(0, 2), height: '100%', position: 'absolute',
          pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SearchIcon fontSize="small" />
        </Box>
        <InputBase
          placeholder="Buscar productos…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            color: 'inherit', width: '100%',
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
          }}
        />
      </Box>
    </Box>
  );

  const drawerContent = (
    <Box sx={{ width: { xs: '85vw', sm: 300 }, maxWidth: 320, pt: 1 }} role="presentation">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>ElectroHome</Typography>
        <IconButton onClick={() => setDrawerAbierto(false)} size="small"><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Box sx={{
            position: 'relative', borderRadius: 1,
            backgroundColor: alpha(theme.palette.common.black, 0.05),
            display: 'flex', alignItems: 'center', px: 1.5,
          }}>
            <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase placeholder="Buscar productos…" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, py: 1 }} />
          </Box>
        </Box>
        <FormControl size="small" fullWidth sx={{ mt: 2 }}>
          <Select displayEmpty value={selectedCategory || ''}
            onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
            input={<OutlinedInput />}>
            <MenuItem value="">Todas las categorías</MenuItem>
            {categories.map((cat) => (<MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>))}
          </Select>
        </FormControl>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => goTo('/')}>
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>
        </ListItem>
        {auth.isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => goTo('/cart')}>
              <ListItemIcon>
                <Badge badgeContent={totalItems} color="secondary"><ShoppingCart /></Badge>
              </ListItemIcon>
              <ListItemText primary="Mi Carrito" />
            </ListItemButton>
          </ListItem>
        )}
        {auth.isAuthenticated && userRole !== 'Cliente' && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => goTo('/app')}>
              <ListItemIcon><Dashboard /></ListItemIcon>
              <ListItemText primary="Área Propia" />
            </ListItemButton>
          </ListItem>
        )}
        {auth.isAuthenticated && (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => goTo('/app/reclamos')}>
                <ListItemIcon><Assignment /></ListItemIcon>
                <ListItemText primary="Manejar Reclamos" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => goTo('/app/perfil')}>
                <ListItemIcon><AccountCircle /></ListItemIcon>
                <ListItemText primary="Mi Perfil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => goTo('/mis-facturas')}>
                <ListItemIcon><Receipt /></ListItemIcon>
                <ListItemText primary="Ver mis facturas" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      <Box sx={{ p: 1 }}><ThemeSelector variant="menu-item" /></Box>
      {auth.isAuthenticated && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{nombreCompleto}</Typography>
            <Typography variant="caption" color="text.secondary">{userRole}</Typography>
          </Box>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon><ExitToApp /></ListItemIcon>
                <ListItemText primary="Cerrar Sesión" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
      {!auth.isAuthenticated && (
        <>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button variant="outlined" fullWidth onClick={() => goTo('/register')}>Registrarse</Button>
            <Button variant="contained" fullWidth onClick={() => goTo('/login')}>Iniciar sesión</Button>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 } }}>
          {esMovil && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerAbierto(true)} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component={Link} to="/"
            sx={{
              textDecoration: 'none', color: 'inherit', fontWeight: 700,
              flexGrow: { xs: 1, md: 0 }, mr: { md: 4 }, whiteSpace: 'nowrap',
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}>
            ElectroHome
          </Typography>

          {!esMovil && (
            <>
              <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
                <Select displayEmpty value={selectedCategory || ''}
                  onChange={(e) => handleCategoryChange(e.target.value ? Number(e.target.value) : undefined)}
                  input={<OutlinedInput />}>
                  <MenuItem value="">Todas las categorías</MenuItem>
                  {categories.map((cat) => (<MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>))}
                </Select>
              </FormControl>
              {searchBox}
            </>
          )}

          {esMovil && (
            <IconButton color="inherit" onClick={() => setBusquedaMovilAbierta(!busquedaMovilAbierta)}>
              <SearchIcon />
            </IconButton>
          )}

          {auth.isAuthenticated && (
            <IconButton color="inherit" component={Link} to="/cart" sx={{ mr: { xs: 0, sm: 1 } }}>
              <Badge badgeContent={totalItems} color="secondary"><ShoppingCart /></Badge>
            </IconButton>
          )}

          {!esMovil && (
            auth.isAuthenticated ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
                  <Box sx={{ textAlign: 'right', mr: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>{nombreCompleto}</Typography>
                    <Typography variant="caption" color="text.secondary">{userRole}</Typography>
                  </Box>
                  <IconButton color="inherit" edge="end"><AccountCircle /></IconButton>
                </Box>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
                  PaperProps={{ sx: { mt: 1.5, minWidth: 220 } }}>
                  {userRole !== 'Cliente' && (
                    <MenuItem component={Link} to="/app" onClick={handleMenuClose}>
                      <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
                      <ListItemText>Área Propia</ListItemText>
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/app/reclamos" onClick={handleMenuClose}>
                    <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
                    <ListItemText>Manejar Reclamos</ListItemText>
                  </MenuItem>
                  <MenuItem component={Link} to="/app/perfil" onClick={handleMenuClose}>
                    <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                    <ListItemText>Mi Perfil</ListItemText>
                  </MenuItem>
                  <MenuItem component={Link} to="/mis-facturas" onClick={handleMenuClose}>
                    <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
                    <ListItemText>Ver mis facturas</ListItemText>
                  </MenuItem>
                  <Divider />
                  <ThemeSelector variant="menu-item" />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
                    <ListItemText>Cerrar Sesión</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button color="inherit" component={Link} to="/register">Registrarse</Button>
                <Button color="inherit" component={Link} to="/login">Iniciar sesión</Button>
              </Box>
            )
          )}
        </Toolbar>

        {esMovil && (
          <Collapse in={busquedaMovilAbierta}>
            <Box sx={{ px: 1.5, pb: 1.5 }}>{searchBox}</Box>
          </Collapse>
        )}
      </AppBar>

      <Drawer anchor="left" open={drawerAbierto} onClose={() => setDrawerAbierto(false)}
        ModalProps={{ keepMounted: true }}>
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, md: 3 }, width: '100%', overflowX: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default EcommerceLayout;
