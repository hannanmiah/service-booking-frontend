<script setup lang="ts">
const route = useRoute();
const authStore = useAuthStore();

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: 'i-heroicons-home', current: route.path === '/admin' },
  { name: 'Services', href: '/admin/services', icon: 'i-heroicons-wrench-screwdriver', current: route.path.startsWith('/admin/services') },
  { name: 'Bookings', href: '/admin/bookings', icon: 'i-heroicons-calendar', current: route.path.startsWith('/admin/bookings') },
  { name: 'Users', href: '/admin/users', icon: 'i-heroicons-users', current: route.path.startsWith('/admin/users') },
];

const handleLogout = async () => {
  await authStore.logout();
  navigateTo('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <div class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div class="flex-1 flex flex-col min-h-0 bg-indigo-700">
        <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <h1 class="text-white text-2xl font-bold">Admin Panel</h1>
          </div>
          <nav class="mt-5 flex-1 px-2 space-y-1">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-indigo-100 hover:bg-indigo-600 hover:bg-opacity-75"
              :class="{ 'bg-indigo-800': item.current }"
            >
              <UIcon :name="item.icon" class="mr-3 h-6 w-6 text-indigo-300" />
              {{ item.name }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex-shrink-0 flex border-t border-indigo-800 p-4">
          <div class="flex items-center">
            <div class="ml-3">
              <p class="text-sm font-medium text-white">{{ authStore.user?.name }}</p>
              <button
                type="button"
                class="text-xs font-medium text-indigo-200 hover:text-white"
                @click="handleLogout"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div class="md:hidden">
      <div class="flex items-center justify-between bg-indigo-700 p-4">
        <h1 class="text-white text-xl font-bold">Admin Panel</h1>
        <button
          type="button"
          class="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span class="sr-only">Open main menu</span>
          <UIcon name="i-heroicons-bars-3" class="h-6 w-6" />
        </button>
      </div>
      <div v-if="isMobileMenuOpen" class="bg-indigo-800">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <NuxtLink
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            class="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-700"
            :class="{ 'bg-indigo-900': item.current }"
            @click="isMobileMenuOpen = false"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
        <div class="pt-4 pb-3 border-t border-indigo-700">
          <div class="flex items-center px-5">
            <div class="ml-3">
              <p class="text-sm font-medium text-white">{{ authStore.user?.name }}</p>
              <button
                type="button"
                class="text-xs font-medium text-indigo-200 hover:text-white"
                @click="handleLogout"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="md:pl-64 flex flex-col flex-1">
      <main class="flex-1">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <slot />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const isMobileMenuOpen = ref(false);
    return { isMobileMenuOpen };
  },
};
</script>