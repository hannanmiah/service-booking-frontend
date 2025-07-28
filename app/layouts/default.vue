<script setup lang="ts">
const route = useRoute();
const authStore = useAuthStore();

// Navigation items
const navItems = [
  { label: 'Home', to: '/', icon: 'i-heroicons-home' },
  { label: 'Services', to: '/services', icon: 'i-heroicons-wrench-screwdriver' },
  { label: 'My Bookings', to: '/bookings', icon: 'i-heroicons-calendar' },
];

// Handle logout
const handleLogout = async () => {
  await authStore.logout();
  navigateTo('/login');
};
</script>

<template>
  <UApp>
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <UContainer class="py-4">
        <div class="flex justify-between items-center">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-2">
            <UIcon name="i-heroicons-wrench-screwdriver" class="h-8 w-8 text-indigo-600" />
            <span class="text-xl font-bold text-gray-900">ServicePro</span>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center space-x-8">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="text-sm font-medium transition-colors duration-200"
              :class="{
                'text-indigo-600': route.path === item.to,
                'text-gray-500 hover:text-gray-700': route.path !== item.to
              }"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>

          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <UDropdown :items="[[
                { label: 'Profile', icon: 'i-heroicons-user-circle' },
                { label: 'Settings', icon: 'i-heroicons-cog-6-tooth' },
                { label: 'Admin Panel', icon: 'i-heroicons-cog-6-tooth', to: '/admin', v-if="authStore.isAdmin" },
                { label: 'Sign out', icon: 'i-heroicons-arrow-left-on-rectangle', click: handleLogout }
              ]]" :ui="{ width: 'w-48', item: { disabled: 'cursor-text select-text' } }">
                <UButton color="white" variant="ghost">
                  <UAvatar
                    :text="authStore.user?.name?.charAt(0) || 'U'"
                    size="sm"
                    class="mr-2"
                  />
                  <span class="hidden sm:inline">{{ authStore.user?.name || 'User' }}</span>
                </UButton>
              </UDropdown>
            </template>
            <template v-else>
              <UButton to="/login" variant="ghost" class="hidden sm:block">Sign in</UButton>
              <UButton to="/register" color="indigo">Sign up</UButton>
            </template>
          </div>
        </div>
      </UContainer>
    </header>

    <!-- Mobile Navigation -->
    <div class="fixed inset-x-0 bottom-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div class="flex justify-around">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center py-3 px-4 text-xs"
          :class="{
            'text-indigo-600': route.path === item.to,
            'text-gray-500': route.path !== item.to
          }"
        >
          <UIcon :name="item.icon" class="h-5 w-5 mb-1" />
          <span class="text-xs">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main Content -->
    <main class="min-h-[calc(100vh-200px)] pb-16 md:pb-0">
      <UContainer class="py-8">
        <NuxtPage />
      </UContainer>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 border-t border-gray-200 mt-12">
      <UContainer class="py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">ServicePro</h3>
            <p class="text-sm text-gray-500">Your trusted partner for all service needs.</p>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/about" class="text-sm text-gray-500 hover:text-indigo-600">About Us</NuxtLink></li>
              <li><NuxtLink to="/services" class="text-sm text-gray-500 hover:text-indigo-600">Our Services</NuxtLink></li>
              <li><NuxtLink to="/contact" class="text-sm text-gray-500 hover:text-indigo-600">Contact</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul class="space-y-2">
              <li><NuxtLink to="/privacy" class="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms" class="text-sm text-gray-500 hover:text-indigo-600">Terms of Service</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-4">Contact Us</h4>
            <address class="not-italic text-sm text-gray-500 space-y-2">
              <p>123 Service St, City</p>
              <p>Email: info@servicepro.com</p>
              <p>Phone: (123) 456-7890</p>
            </address>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} ServicePro. All rights reserved.
        </div>
      </UContainer>
    </footer>

    <!-- Notifications -->
    <UNotifications />
  </UApp>
</template>

<style>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* Layout adjustments for mobile */
@media (max-width: 767px) {
  main {
    padding-bottom: 80px; /* Space for mobile navigation */
  }
}
</style>