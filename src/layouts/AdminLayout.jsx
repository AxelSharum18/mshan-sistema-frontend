import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, ShoppingCart, Package, Users, Settings, LogOut,
  Moon, Sun, ChevronDown, ArrowLeftRight, Tag, Truck, LayoutGrid, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isMobile = window.innerWidth <= 768;
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/panel',             name: 'Principal',     icon: <Home size={20} />,          end: true },
    { path: '/panel/ventas',      name: 'Ventas',        icon: <ShoppingCart size={20} /> },
    { path: '/panel/movimientos', name: 'Movimientos',   icon: <ArrowLeftRight size={20} /> },
    { path: '/panel/compras',     name: 'Compras',       icon: <Package size={20} /> },
    { path: '/panel/modelos',     name: 'Modelos',       icon: <LayoutGrid size={20} /> },
    { path: '/panel/categorias',  name: 'Categorías',    icon: <Tag size={20} /> },
    { path: '/panel/clientes',    name: 'Clientes',      icon: <Users size={20} /> },
    { path: '/panel/proveedores', name: 'Proveedores',   icon: <Truck size={20} /> },
    {path: '/panel/materiales', name: 'Materiales', icon: <Package size={20} />},
  ];

  return (
    <div className={`admin-container ${isDarkMode ? 'dark' : 'light'}`}>
      
      {/* SIDEBAR */}
      <aside 
        className={`sidebar ${
  isMobile
    ? (isMobileSidebarOpen ? 'expanded mobile-open' : '')
    : (isSidebarHovered ? 'expanded' : '')
}`}
        onMouseEnter={() => !isMobile && setIsSidebarHovered(true)}
        onMouseLeave={() => !isMobile && setIsSidebarHovered(false)}
      >
        <div className="sidebar-logo">
          <div className="logo-icon">M</div>
          <span className="logo-text">MSHAN</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <NavLink 
              to={item.path} 
              key={index}
              end={item.end || false}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon">{item.icon}</div>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            {isMobile && (
  <button
    className="mobile-menu-btn"
    onClick={() => setIsMobileSidebarOpen(prev => !prev)}
  >
    {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
  </button>
)}
            <h2 className="page-title">Panel de Control · MSHAN</h2>
          </div>

          <div className="topbar-right">
            <button className="theme-toggle-btn" onClick={toggleTheme} title="Cambiar tema">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="profile-dropdown" ref={dropdownRef}>
              <div 
                className="profile-trigger" 
                onClick={() => setIsProfileOpen(prev => !prev)}
              >
                <div className="avatar">
                  {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.nombre || 'Usuario'}</span>
                  <span className="user-role">{user?.roles?.[0] || 'ADMIN'}</span>
                </div>
                <ChevronDown size={15} style={{ color: 'var(--text-secondary)', marginLeft: 2 }} />
              </div>

              {isProfileOpen && (
                <div className="dropdown-menu-custom">
                  <div className="dropdown-item-custom" style={{ fontWeight: 600, cursor: 'default', pointerEvents: 'none' }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                      {user?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span>{user?.nombre}</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item-custom" onClick={handleLogout} style={{ color: '#e53e3e' }}>
                    <LogOut size={15} />
                    <span>Cerrar Sesión</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* OUTLET */}
        <div className="content-wrapper">
          <Outlet />
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;
