import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Box, IconButton, Toolbar, Typography, Menu, MenuItem,
  ListItemIcon, ListItemText, Divider, Button, Tooltip, Drawer, List, ListItem,
  ListItemButton, Stack,
} from '@mui/material';
import {
  Menu as MenuIcon, AccountCircle, ExitToApp, Add, Store, Assignment,
  Receipt, Dashboard, Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../services/authContext';
import CreateUserModal from '../Navbar/CreateUserModal';
import { ThemeSelector } from '../ThemeSelector/ThemeSelector';
import { useResponsive } from '../../src/hooks/useResponsive';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { esMovil } = useResponsive();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { auth, logout, userRole } = useAuth();

  const nombreCompleto = auth.user?.nombres && auth.user?.apellidos
    ? `${auth.user.nombres} ${auth.user.apellidos}`
    : auth.user?.correo?.split('@')[0] || 'Usuario';

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); handleMenuClose(); setDrawerAbierto(false); };
  const canCreateUsers = () => userRole === 'Administrador';

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'Administrador': return 'Panel de Administración';
      case 'Revisor': return 'Panel de Revisión';
      case 'Tecnico': return 'Panel Técnico';
      case 'Personal de Entrega': return 'Panel de Entregas';
      case 'Analista_Datos': return 'Panel de Análisis';
      case 'Encargado_Inventario': return 'Panel de Inventario';
      case 'Gestor_Productos': return 'Panel de Productos';
      case 'Cliente': return 'Mi Panel de Cliente';
      default: return 'Sistema de Gestión';
    }
  };

  const navegarA = (ruta: string) => {
    handleMenuClose();
    setDrawerAbierto(false);
    navigate(ruta);
  };

  const drawerContent = (
    <Box sx={{ width: { xs: '85vw', sm: 300 }, maxWidth: 320, pt: 1 }} role="presentation">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Menú</Typography>
        <IconButton onClick={() => setDrawerAbierto(false)} size="small"><CloseIcon /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{nombreCompleto}</Typography>
        <Typography variant="caption" color="text.secondary">{userRole}</Typography>
      </Box>
      <Divider />
      <List>
        {userRole !== 'Cliente' && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => navegarA('/app')}>
              <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
              <ListItemText primary="Área Propia" />
            </ListItemButton>
          </ListItem>
        )}
        <ListItem disablePadding>
          <ListItemButton onClick={() => navegarA('/app/perfil')}>
            <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
            <ListItemText primary="Mi Perfil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navegarA('/app/reclamos')}>
            <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
            <ListItemText primary="Manejar Reclamos" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navegarA('/mis-facturas')}>
            <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
            <ListItemText primary="Mis Facturas" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navegarA('/')}>
            <ListItemIcon><Store fontSize="small" /></ListItemIcon>
            <ListItemText primary="Ir a la Tienda" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 1 }}><ThemeSelector variant="menu-item" /></Box>
      {canCreateUsers() && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button fullWidth variant="contained" color="secondary" startIcon={<Add />}
              onClick={() => { setDrawerAbierto(false); setShowCreateModal(true); }}>
              Crear Usuario
            </Button>
          </Box>
        </>
      )}
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'clip' }}>
      <AppBar
        position="fixed"
        sx={{ top: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: { xs: 0.5, md: 2 } }}>
          {esMovil && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerAbierto(true)} sx={{ mr: 0.5 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6" noWrap component="div"
            sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis',
              fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.25rem' } }}
          >
            {getDashboardTitle()}
          </Typography>

          {!esMovil && (
            <>
              <Tooltip title="Ir a la tienda">
                <Button color="inherit" startIcon={<Store />} onClick={() => navigate('/')} sx={{ mr: 2 }}>
                  Tienda
                </Button>
              </Tooltip>
              {canCreateUsers() && (
                <Tooltip title="Crear nuevo usuario">
                  <Button variant="contained" color="secondary" startIcon={<Add />}
                    onClick={() => setShowCreateModal(true)} sx={{ mr: 2 }}>
                    Crear Usuario
                  </Button>
                </Tooltip>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
                <Box sx={{ textAlign: 'right', mr: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>{nombreCompleto}</Typography>
                  <Typography variant="caption" color="text.secondary">{userRole}</Typography>
                </Box>
                <IconButton color="inherit" edge="end"><AccountCircle /></IconButton>
              </Box>
            </>
          )}

          {esMovil && (
            <IconButton color="inherit" onClick={() => setDrawerAbierto(true)}>
              <AccountCircle />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerAbierto} onClose={() => setDrawerAbierto(false)}
        ModalProps={{ keepMounted: true }}>
        {drawerContent}
      </Drawer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
        PaperProps={{ sx: { mt: 1.5, minWidth: 220, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}>
        {userRole !== 'Cliente' && (
          <MenuItem onClick={() => navegarA('/app')}>
            <ListItemIcon><Dashboard fontSize="small" /></ListItemIcon>
            <ListItemText>Área Propia</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => navegarA('/app/perfil')}>
          <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
          <ListItemText>Mi Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navegarA('/app/reclamos')}>
          <ListItemIcon><Assignment fontSize="small" /></ListItemIcon>
          <ListItemText>Manejar Reclamos</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navegarA('/mis-facturas')}>
          <ListItemIcon><Receipt fontSize="small" /></ListItemIcon>
          <ListItemText>Mis Facturas</ListItemText>
        </MenuItem>
        <Divider />
        <ThemeSelector variant="menu-item" />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>

      <Box component="main" sx={{
        flexGrow: 1,
        px: { xs: 1.5, sm: 2, md: 3 },
        pb: { xs: 1.5, sm: 2, md: 3 },
        pt: { xs: 9, sm: 10, md: 11 },
        backgroundColor: 'background.default',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        overflowX: 'clip',
      }}>
        {children}
      </Box>

      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} />}
    </Box>
  );
}

export default DashboardLayout;
