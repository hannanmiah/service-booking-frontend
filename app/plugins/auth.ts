export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore();
  
  // Initialize auth state from localStorage
  if (process.client) {
    authStore.initAuth();
  }
  
  // Add global navigation guard
  const router = useRouter();
  
  router.beforeEach((to, from, next) => {
    const isAuthenticated = authStore.isAuthenticated;
    const isAdminRoute = to.path.startsWith('/admin');
    const isAuthRoute = ['/login', '/register'].includes(to.path);
    
    // Redirect to login if not authenticated and trying to access protected route
    if (!isAuthenticated && !isAuthRoute) {
      return next('/login');
    }
    
    // Redirect to home if authenticated and trying to access auth route
    if (isAuthenticated && isAuthRoute) {
      return next('/');
    }
    
    // Redirect to home if not admin and trying to access admin route
    if (isAdminRoute && !authStore.isAdmin) {
      return next('/');
    }
    
    next();
  });
});
