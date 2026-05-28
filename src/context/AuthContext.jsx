import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (usuario, password) => {
        try {
            const response = await api.post('/auth/login', { usuario, password });
            const { token, nombre, roles } = response.data;

            const userData = { usuario, nombre, roles };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Error en login:", error);
            return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
        }
    };

    const register = async (nombre, usuario, password) => {
        try {
            // Por defecto, al registrarse no tiene roles o le asignamos uno base.
            // Para MSHAN, tal vez el admin deba asignar roles, pero para la prueba usaremos un rol vacio o ALMACEN
            const response = await api.post('/auth/register', { 
                nombre, 
                usuario, 
                password,
                roles: ['VENTAS'] // Opcional: ['VENTAS']
            });
            const { token, roles } = response.data;

            const userData = { usuario, nombre, roles };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Error en registro:", error);
            return { success: false, message: error.response?.data?.message || 'Error al registrarse' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
