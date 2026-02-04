import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { access_token } = response.data;

            // Get user info
            const userResponse = await api.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${access_token}` }
            });

            const userData = userResponse.data;

            // Store in state and localStorage
            setToken(access_token);
            setUser(userData);
            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));

            toast.success('Login successful!');
            return true;
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            toast.error(message);
            return false;
        }
    };

    const signup = async (username, email, password) => {
        try {
            await api.post('/api/auth/register', { username, email, password });
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            toast.error(message);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!token,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
