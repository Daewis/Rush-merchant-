import { useEffect, useState, useCallback } from 'react';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

export interface AuthError {
  field?: string;
  message: string;
  code?: string;
}

export function useAuth() {
  const { 
    user, 
    isAuthenticated, 
    setUser, 
    setAuth, 
    setView,
    logout: storeLogout 
  } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      if (user && isAuthenticated) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        try {
          const response = await authApi.me();
          if (response.data?.success && isMounted) {
            const userData = response.data.data?.user || response.data.data;
            if (userData && userData.role) {
              userData.role = userData.role.toLowerCase();
            }
            setUser(userData);
            setAuth(true);
          } else if (isMounted) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            setAuth(false);
          }
        } catch (error) {
          if (isMounted) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            setAuth(false);
          }
        }
      } else {
        setAuth(false);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated, setUser, setAuth]);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (email: string, password: string): Promise<any> => {
      setLoginLoading(true);
      setError(null);

      try {
        const response = await authApi.login({ email, password });

        if (response.data?.success) {
          const resData = response.data.data || {};
          const userData = resData.user || resData;

          if (userData && userData.role) {
            userData.role = userData.role.toLowerCase();
          }

          const accessToken = resData.access_token || response.data.access_token;
          const refreshToken = resData.refresh_token || response.data.refresh_token;

          if (accessToken && typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessToken);
            if (refreshToken) {
              localStorage.setItem('refresh_token', refreshToken);
            }
          }

          setUser(userData);
          setAuth(true);
          toast.success(`Welcome back, ${userData.full_name || 'User'}!`);
          
          // Route based on role
          if (userData.role === 'provider') {
            setView('provider-dashboard');
          } else if (userData.role === 'admin') {
            setView('admin-dashboard');
          } else {
            setView('customer-dashboard');
          }

          return { success: true, user: userData };
        } else {
          const errorMsg =
            response.data?.message || 'Login failed. Please check your credentials.';
          setError({ message: errorMsg });
          toast.error('Login failed', { description: errorMsg });
          return { success: false, error: errorMsg };
        }
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Connection failed. Please try again.';
        setError({ message: errorMsg });
        toast.error('Connection error', { description: errorMsg });
        return { success: false, error: errorMsg };
      } finally {
        setLoginLoading(false);
      }
    },
    [setUser, setAuth, setView]
  );

  const register = useCallback(
    async (userData: {
      full_name: string;
      email: string;
      phone: string;
      password: string;
      role?: string;
    }): Promise<boolean> => {
      setRegisterLoading(true);
      setError(null);

      try {
        const response = await authApi.register(userData);

        if (response.data?.success) {
          toast.success('Welcome to RUSHNG! Please check your email to verify your account.');
          setView('verify');
          return true;
        } else {
          const errorMsg =
            response.data?.message || 'Registration failed. Please try again.';
          setError({ message: errorMsg });
          toast.error('Registration failed', { description: errorMsg });
          return false;
        }
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          'Network error. Please try again.';
        setError({ message: errorMsg });
        toast.error('Connection error', { description: errorMsg });
        return false;
      } finally {
        setRegisterLoading(false);
      }
    },
    [setView]
  );

  const verify = useCallback(async (email: string, code: string): Promise<boolean> => {
    try {
      const response = await authApi.verify({ email, code });
      if (response.data?.success) {
        toast.success('Account verified successfully!');
        setView('login');
        return true;
      }
      toast.error(response.data?.message || 'Verification failed');
      return false;
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || err.response?.data?.message || 'Verification failed'
      );
      return false;
    }
  }, [setView]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
      }
      storeLogout();
      toast.success('Logged out successfully');
      setView('home');
    }
  }, [storeLogout, setView]);

  return {
    user,
    loading,
    loginLoading,
    registerLoading,
    error,
    isAuthenticated,
    login,
    register,
    verify,
    logout,
    clearError,
  };
}
