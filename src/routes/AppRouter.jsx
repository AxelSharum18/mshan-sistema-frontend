import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import { useAuth } from '../context/AuthContext';

import AdminLayout from '../layouts/AdminLayout';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

import DashboardHome from '../pages/DashboardHome';
import VentasPage from '../pages/VentasPage';
import ComprasPage from '../pages/ComprasPage';
import MovimientosPage from '../pages/MovimientosPage';
import ClientesPage from '../pages/ClientesPage';
import ProveedoresPage from '../pages/ProveedoresPage';
import ModelosPage from '../pages/ModelosPage';
import CategoriasPage from '../pages/CategoriasPage';
import MaterialesPage from '../pages/MaterialesPage';
import ProduccionPage from '../pages/ProduccionPage';

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<AuthPage />} />
            
            <Route path="/panel" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<DashboardHome />} />
                <Route path="ventas" element={<VentasPage />} />
                <Route path="movimientos" element={<MovimientosPage />} />
                <Route path="compras" element={<ComprasPage />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="proveedores" element={<ProveedoresPage />} />
                <Route path="modelos" element={<ModelosPage />} />
                <Route path="categorias" element={<CategoriasPage />} />
                <Route path="materiales" element={<MaterialesPage />} />
                <Route path="produccion" element={<ProduccionPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;
