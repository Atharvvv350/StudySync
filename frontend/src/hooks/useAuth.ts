import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            // Check localStorage first (Remember Me)
            let storedUser = localStorage.getItem('user');
            let storedToken = localStorage.getItem('token');

            // If not in localStorage, check sessionStorage
            if (!storedUser || !storedToken) {
                storedUser = sessionStorage.getItem('user');
                storedToken = sessionStorage.getItem('token');
            }

            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setToken(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        checkAuth();

        // Listen for storage events to sync across tabs (optional but good)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        // Also clear admin auth
        sessionStorage.removeItem('adminAuth');

        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        navigate('/login');
    };

    const updateUser = (userData: any) => {
        setUser(userData);
        if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(userData));
        }
        if (sessionStorage.getItem('user')) {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
    };

    return { user, token, isAuthenticated, loading, logout, updateUser };
};
