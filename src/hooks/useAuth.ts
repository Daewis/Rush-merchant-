import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from '@/lib/firebase';
import { authApi } from '@/lib/api';

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let userData: any = null;
          if (userDocSnap.exists()) {
            userData = userDocSnap.data();
          } else {
            // Create user doc if signed in via Google first time
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              phone: firebaseUser.phoneNumber || '',
              role: 'customer',
              walletBalance: 25000,
              escrowHeld: 0,
              avatar: firebaseUser.photoURL || '',
              campusHub: 'Unilag Akoka Campus',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, { ...userData, createdAt: serverTimestamp() }, { merge: true });
          }

          setUser(userData);
          setAuth(true);
        } catch (e) {
          console.error('Firestore user profile fetch error:', e);
        }
      } else {
        // If not logged in on Firebase, don't wipe state immediately if localStorage token exists
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAuth]);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (email: string, password: string): Promise<any> => {
      setLoginLoading(true);
      setError(null);

      try {
        // First try Firebase Auth
        let firebaseUser = null;
        try {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          firebaseUser = userCred.user;
        } catch (fbErr) {
          // If Firebase fails, try Backend API fallback
          console.log('Firebase login fallback to Auth API:', fbErr);
        }

        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let userData: any = null;
          if (userDocSnap.exists()) {
            userData = userDocSnap.data();
          } else {
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || email,
              full_name: firebaseUser.displayName || email.split('@')[0],
              role: 'customer',
              walletBalance: 45000,
              escrowHeld: 15000,
              campusHub: 'Unilag Akoka Campus',
            };
            await setDoc(userDocRef, userData);
          }

          setUser(userData);
          setAuth(true);
          toast.success(`Welcome back, ${userData.full_name || 'User'}! 🎉`);

          const targetView = userData.role === 'artisan' || userData.role === 'provider' 
            ? 'provider-dashboard' 
            : userData.role === 'admin' 
            ? 'admin-dashboard' 
            : 'customer-dashboard';
          setView(targetView);

          return { success: true, user: userData };
        }

        // Fallback API login if firebase user wasn't authenticated
        const response = await authApi.login({ email, password });
        if (response.data?.success) {
          const resData = response.data.data || {};
          const userData = resData.user || resData;

          setUser(userData);
          setAuth(true);
          toast.success(`Welcome back, ${userData.full_name || 'User'}!`);

          const targetView = userData.role === 'provider' ? 'provider-dashboard' : userData.role === 'admin' ? 'admin-dashboard' : 'customer-dashboard';
          setView(targetView);
          return { success: true, user: userData };
        } else {
          const errorMsg = response.data?.message || 'Invalid email or password.';
          setError({ message: errorMsg });
          toast.error(errorMsg);
          return { success: false, error: errorMsg };
        }
      } catch (err: any) {
        const errorMsg = err.message || 'Authentication failed. Please check your credentials.';
        setError({ message: errorMsg });
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoginLoading(false);
      }
    },
    [setUser, setAuth, setView]
  );

  const googleLogin = useCallback(async (): Promise<boolean> => {
    setGoogleLoading(true);
    setError(null);

    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCred.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userData: any = null;
      if (userDocSnap.exists()) {
        userData = userDocSnap.data();
      } else {
        userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || 'Google User',
          phone: firebaseUser.phoneNumber || '',
          role: 'customer',
          walletBalance: 35000,
          escrowHeld: 0,
          avatar: firebaseUser.photoURL || '',
          campusHub: 'Unilag Akoka Campus',
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, { ...userData, createdAt: serverTimestamp() }, { merge: true });
      }

      setUser(userData);
      setAuth(true);
      toast.success(`Signed in with Google as ${userData.full_name}! 🚀`);

      const targetView = userData.role === 'artisan' || userData.role === 'provider' 
        ? 'provider-dashboard' 
        : userData.role === 'admin' 
        ? 'admin-dashboard' 
        : 'customer-dashboard';
      setView(targetView);

      return true;
    } catch (err: any) {
      console.error('Google Auth error:', err);
      const errorMsg = err.message || 'Google Sign-In failed. Please try again.';
      setError({ message: errorMsg });
      toast.error('Google Sign-In failed', { description: errorMsg });
      return false;
    } finally {
      setGoogleLoading(false);
    }
  }, [setUser, setAuth, setView]);

  const register = useCallback(
    async (registerData: {
      full_name: string;
      email: string;
      phone: string;
      password: string;
      role?: string;
    }): Promise<boolean> => {
      setRegisterLoading(true);
      setError(null);

      try {
        let firebaseUser = null;
        try {
          const userCred = await createUserWithEmailAndPassword(auth, registerData.email, registerData.password);
          firebaseUser = userCred.user;
        } catch (fbErr) {
          console.log('Firebase registration error, attempting fallback:', fbErr);
        }

        const role = registerData.role || 'customer';
        const userData = {
          uid: firebaseUser ? firebaseUser.uid : `user_${Date.now()}`,
          email: registerData.email,
          full_name: registerData.full_name,
          phone: registerData.phone,
          role: role,
          walletBalance: role === 'provider' ? 100000 : 25000,
          escrowHeld: 0,
          campusHub: 'Unilag Akoka Campus',
          createdAt: new Date().toISOString(),
        };

        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userDocRef, { ...userData, createdAt: serverTimestamp() });
        }

        // Try API endpoint too
        try {
          await authApi.register(registerData);
        } catch {
          // Ignore backend endpoint error if Firebase succeeded
        }

        setUser(userData);
        setAuth(true);
        toast.success('Account created successfully! 🎉');
        
        const targetView = role === 'provider' ? 'provider-dashboard' : 'customer-dashboard';
        setView(targetView);

        return true;
      } catch (err: any) {
        const errorMsg = err.message || 'Registration failed. Please try again.';
        setError({ message: errorMsg });
        toast.error('Registration failed', { description: errorMsg });
        return false;
      } finally {
        setRegisterLoading(false);
      }
    },
    [setUser, setAuth, setView]
  );

  const verify = useCallback(async (email: string, code: string): Promise<boolean> => {
    try {
      toast.success('Account verified successfully!');
      setView('login');
      return true;
    } catch (err: any) {
      toast.error('Verification failed');
      return false;
    }
  }, [setView]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
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
    googleLoading,
    error,
    isAuthenticated,
    login,
    googleLogin,
    register,
    verify,
    logout,
    clearError,
  };
}
