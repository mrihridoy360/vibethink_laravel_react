import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Set Axios defaults for unified SPA cookie session auth
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            if (response.data.success) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (email, password, remember = false) => {
        // Fetch CSRF cookie before making the request
        try {
            await axios.get('/sanctum/csrf-cookie').catch(() => {});
        } catch (e) {}

        const response = await axios.post('/api/auth/login', { email, password, remember });
        if (response.data.success) {
            setUser(response.data.user);
        }
        return response.data;
    };

    const register = async (name, email, phone, password, password_confirmation) => {
        try {
            await axios.get('/sanctum/csrf-cookie').catch(() => {});
        } catch (e) {}

        const response = await axios.post('/api/auth/register', {
            name,
            email,
            phone,
            password,
            password_confirmation
        });
        if (response.data.success) {
            setUser(response.data.user);
        }
        return response.data;
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
