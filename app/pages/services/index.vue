<template>
  <div class="py-8">
    <!-- Hero Section -->
    <div class="bg-indigo-700 text-white py-12">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">Our Services</h1>
        <p class="text-xl max-w-2xl mx-auto">Professional services for your home and office</p>
      </div>
    </div>

    <!-- Services Grid -->
    <div class="container mx-auto px-4 py-12">
      <!-- Search and Filter -->
      <div class="mb-8 flex flex-col md:flex-row gap-4 items-center justify-end">
          <UInput
              size="xl"
            v-model="searchQuery" 
            placeholder="Search services..." 
            icon="i-heroicons-magnifying-glass"
          />
      </div>

      <!-- Services Grid -->
      <div v-if="services?.data.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="service in services.data"
          :key="service.id" 
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div class="h-48 bg-gray-200 relative">
            <img 
              :src="service.image || '/images/service.svg'"
              :alt="service.name"
              class="w-full h-full object-cover"
            >
            <div v-if="service.is_featured" class="absolute top-2 right-2">
              <span class="bg-yellow-400 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                Popular
              </span>
            </div>
          </div>
          <div class="p-6">
            <div class="flex justify-between items-start">
              <h3 class="text-xl font-semibold text-gray-900">{{ service.name }}</h3>
              <div class="text-indigo-600 font-bold">${{ service.price }}</div>
            </div>
            <p class="mt-2 text-gray-600">{{ service.description }}</p>
            
            <div class="mt-4 flex items-center justify-between">
              <div class="flex items-center">
                <UIcon 
                  v-for="i in 5" 
                  :key="i"
                  :name="i <= service?.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                  class="h-5 w-5 text-yellow-400"
                />
                <span class="ml-2 text-sm text-gray-500">{{ service?.rating || 0 }} ({{ service?.reviewCount || 0 }})</span>
              </div>
              <UButton 
                :to="`/services/${service.id}`" 
                color="primary"
                size="sm"
              >
                View Details
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-circle" class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-lg font-medium text-gray-900">No services found</h3>
        <p class="mt-1 text-gray-500">We couldn't find any services matching your criteria.</p>
        <div class="mt-6">
          <UButton @click="resetFilters" color="primary">
            Reset filters
          </UButton>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="services.data.length > 0" class="mt-12 flex justify-center">
        <UPagination
          v-model:page="currentPage"
          :items-per-page="services.meta.per_page"
          :total="services.meta.total"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Service,ApiResponse } from '#api';

definePageMeta({
  middleware: ['sanctum:auth']
});

const client = useSanctumClient();
const isLoading = ref(false);
const searchQuery = ref('');
const categoryFilter = ref('All Categories');
const currentPage = ref(1);

const {data: services} = await useAsyncData<ApiResponse<Service>>(`services-page-${currentPage.value}-search-${searchQuery.value}`,  () => {
  return client('/api/services', {
    params: {
      search: searchQuery.value,
      page: currentPage.value
    }
  })
},{
  watch: [searchQuery, currentPage],
});

const resetFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = 'All Categories';
  currentPage.value = 1;
};
</script>
