import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { userService } from '../../services/userService';
import CreateUserModal from './CreateUserModal';

const Navbar: React.FC = () => {
  const { auth, logout, userRole } = useAuth();
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated && userRole && userRole !== 'Cliente') {
      loadAllowedRoles();
    }
  }, [auth.isAuthenticated, userRole]);

  const loadAllowedRoles = async () => {
    try {
      setLoading(true);
      const roles = await userService.getAdminAllowedRoles();
      setAllowedRoles(roles);
    } catch (error) {
      console.error('Error loading allowed roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const canCreateUsers = () => {
    return Boolean(userRole) && userRole !== 'Cliente' && allowedRoles.length > 0;
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <>
      <nav
        className="navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          width: '100%',
        }}
      >
        <div className="navbar-left">
          <span className="navbar-brand">Sistema de Reclamos</span>
          <span className="user-role-badge">{auth.user?.rol}</span>
        </div>

        <div className="navbar-right">
          {canCreateUsers() && (
            <button
              className="navbar-button create-button"
              onClick={() => setShowCreateModal(true)}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Crear Usuario'}
            </button>
          )}

          <div className="user-info">
            <span className="user-email">{auth.user?.correo}</span>
            <button className="navbar-button logout-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} />
      )}
    </>
  );
};

export default Navbar;
