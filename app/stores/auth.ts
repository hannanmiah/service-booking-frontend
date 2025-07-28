import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<any>(null);
  const isAuthenticated = ref(false);
  const isAdmin = ref(false);

  const setAuth = (userData: any, authToken: string) => {
    token.value = authToken;
    user.value = userData;
    isAuthenticated.value = true;
    isAdmin.value = userData.is_admin || false;
    
    // Store in localStorage
    if (process.client) {
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    isAdmin.value = false;
    
    // Clear from localStorage
    if (process.client) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  };

  // Initialize from localStorage
  const initAuth = () => {
    if (process.client) {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
        isAdmin.value = user.value?.is_admin || false;
      }
    }
  };

  // Login method
  const login = async (email: string, password: string) => {
    const config = useRuntimeConfig();
    const { data, error } = await useFetch('/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: {
        email,
        password,
      },
    });

    if (error.value) {
      throw new Error(error.value.data?.message || 'Login failed');
    }

    if (data.value) {
      setAuth(data.value.user, data.value.token);
    }
  };

  // Register method
  const register = async (userData: any) => {
    const config = useRuntimeConfig();
    const { data, error } = await useFetch('/register', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: userData,
    });

    if (error.value) {
      throw new Error(error.value.data?.message || 'Registration failed');
    }

    if (data.value) {
      setAuth(data.value.user, data.value.token);
    }
  };

  // Logout method
  const logout = () => {
    clearAuth();
    navigateTo('/login');
  };

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    setAuth,
    clearAuth,
    initAuth,
    login,
    register,
    logout,
  };
});
