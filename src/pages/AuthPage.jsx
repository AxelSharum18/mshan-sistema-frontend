import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './AuthPage.css';

const AuthPage = () => {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Formularios state
    const [loginData, setLoginData] = useState({ usuario: '', password: '' });
    const [regData, setRegData] = useState({ nombre: '', usuario: '', password: '' });
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegChange = (e) => setRegData({ ...regData, [e.target.name]: e.target.value });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(loginData.usuario, loginData.password);
        if (res.success) {
            navigate('/panel');
        } else {
            toast.error(res.message || "Credenciales inválidas");
        }
    };

    const handleRegSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(regData.nombre, regData.usuario, regData.password);
        if (res.success) {
            navigate('/panel');
        } else {
            toast.error(res.message || "Error al registrarse");
        }
    };

    return (
        <div className="auth-container-wrapper">
            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                
                {/* SIGN UP FORM */}
                <div className="form-container sign-up-container">
                    <form className="auth-form" onSubmit={handleRegSubmit}>
                        <div className="logo-container">
                            <img src="/img/logo.jpg" alt="MSHAN Logo" className="logo" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                        </div>
                        <h1>Registrarse</h1>
                        <span>Ingrese sus datos personales</span>
                        {error && <p style={{color: 'red', fontSize: '12px'}}>{error}</p>}
                        
                        <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input type="text" name="nombre" placeholder="Nombre Completo" value={regData.nombre} onChange={handleRegChange} required />
                        </div>
                        <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input type="text" name="usuario" placeholder="Usuario" value={regData.usuario} onChange={handleRegChange} required />
                        </div>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={regData.password} onChange={handleRegChange} required />
                            {showPassword ? 
                                <EyeOff size={18} className="eye-icon" onClick={() => setShowPassword(false)} /> : 
                                <Eye size={18} className="eye-icon" onClick={() => setShowPassword(true)} />
                            }
                        </div>
                        <button type="submit" className="auth-btn">Registrarse</button>
                        <button
          type="button"
          className="mobile-switch"
          onClick={() => setIsRightPanelActive(false)}
        >
          ¿Ya tienes cuenta? Inicia Sesión
        </button>

        <a href="/" className="text-center">Volver al Inicio</a>

                    </form>
                </div>

                {/* SIGN IN FORM */}
                <div className="form-container sign-in-container">
                    <form className="auth-form" onSubmit={handleLoginSubmit}>
                        <div className="logo-container">
                            <img src="/img/logo.jpg" alt="MSHAN Logo" className="logo" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                        </div>
                        <h1>Iniciar Sesión</h1>
                        <span>Utilice su cuenta para ingresar</span>
                        {error && <p style={{color: 'red', fontSize: '12px'}}>{error}</p>}

                        <div className="input-group">
                            <User size={18} className="input-icon" />
                            <input type="text" name="usuario" placeholder="Usuario" value={loginData.usuario} onChange={handleLoginChange} required />
                        </div>
                        <div className="input-group">
                            <Lock size={18} className="input-icon" />
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
                            {showPassword ? 
                                <EyeOff size={18} className="eye-icon" onClick={() => setShowPassword(false)} /> : 
                                <Eye size={18} className="eye-icon" onClick={() => setShowPassword(true)} />
                            }
                        </div>
                        <button type="submit" className="auth-btn">Iniciar Sesión</button>
                        
                    <button
          type="button"
          className="mobile-switch"
          onClick={() => setIsRightPanelActive(true)}
        >
          ¿No tienes cuenta? Regístrate
        </button>

        <a href="/" className="text-center">Volver al Inicio</a>

                    </form>
                </div>

                {/* OVERLAY */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>¡Bienvenido de Nuevo!</h1>
                            <p>Para mantenerse conectado con nosotros, inicie sesión con su información personal</p>
                            <button className="auth-btn ghost" onClick={() => setIsRightPanelActive(false)}>Iniciar Sesión</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>¡Bienvenido a MSHAN!</h1>
                            <p>Ingrese sus datos personales y se parte de nuestra empresa</p>
                            <p style={{fontSize: '14px', marginTop: '10px'}}>¿Aún no tienes una cuenta?</p>
                            <button className="auth-btn ghost" onClick={() => setIsRightPanelActive(true)}>Registrarse</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;
