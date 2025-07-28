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
      <div class="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="w-full md:w-1/3">
          <UInput 
            v-model="searchQuery" 
            placeholder="Search services..." 
            icon="i-heroicons-magnifying-glass"
          />
        </div>
        <div class="w-full md:w-1/4">
          <USelect
            v-model="categoryFilter"
            :options="['All Categories', 'Cleaning', 'Repair', 'Maintenance', 'Installation']"
            placeholder="Filter by category"
          />
        </div>
      </div>

      <!-- Services Grid -->
      <div v-if="services.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="service in filteredServices" 
          :key="service.id" 
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div class="h-48 bg-gray-200 relative">
            <img 
              :src="service.image || '/images/service-placeholder.jpg'" 
              :alt="service.name"
              class="w-full h-full object-cover"
            >
            <div v-if="service.isPopular" class="absolute top-2 right-2">
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
                  :name="i <= service.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                  class="h-5 w-5 text-yellow-400"
                />
                <span class="ml-2 text-sm text-gray-500">{{ service.rating }} ({{ service.reviewCount }})</span>
              </div>
              <UButton 
                :to="`/services/${service.id}`" 
                color="indigo" 
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
          <UButton @click="resetFilters" color="indigo">
            Reset filters
          </UButton>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredServices.length > 0" class="mt-12 flex justify-center">
        <UPagination
          v-model="currentPage"
          :page-count="pageSize"
          :total="totalServices"
          :ui="{ rounded: 'first:rounded-s-md last:rounded-e-md' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useServiceStore } from '~/stores/service';

const serviceStore = useServiceStore();
const isLoading = ref(false);
const searchQuery = ref('');
const categoryFilter = ref('All Categories');
const currentPage = ref(1);
const pageSize = 9;

// Mock data - replace with actual API call
const services = ref([
  {
    id: 1,
    name: 'Home Cleaning',
    description: 'Thorough cleaning of your entire home by professional cleaners.',
    price: 99,
    rating: 4.8,
    reviewCount: 124,
    category: 'Cleaning',
    isPopular: true,
    image: '/images/cleaning.jpg'
  },
  {
    id: 2,
    name: 'AC Repair',
    description: 'Expert repair and maintenance for all types of air conditioning units.',
    price: 79,
    rating: 4.7,
    reviewCount: 98,
    category: 'Repair',
    isPopular: true,
    image: '/images/ac-repair.jpg'
  },
  {
    id: 3,
    name: 'Plumbing',
    description: '24/7 emergency plumbing services for all your needs.',
    price: 89,
    rating: 4.9,
    reviewCount: 156,
    category: 'Repair',
    image: '/images/plumbing.jpg'
  },
  {
    id: 4,
    name: 'Electrical',
    description: 'Professional electrical repairs and installations.',
    price: 109,
    rating: 4.6,
    reviewCount: 87,
    category: 'Repair',
    image: '/images/electrical.jpg'
  },
  {
    id: 5,
    name: 'Carpet Cleaning',
    description: 'Deep cleaning for all types of carpets and rugs.',
    price: 129,
    rating: 4.8,
    reviewCount: 112,
    category: 'Cleaning',
    isPopular: true,
    image: '/images/carpet-cleaning.jpg'
  },
  {
    id: 6,
    name: 'Appliance Installation',
    description: 'Professional installation of home appliances.',
    price: 149,
    rating: 4.7,
    reviewCount: 76,
    category: 'Installation',
    image: '/images/appliance-installation.jpg'
  }
]);

// Computed properties
const filteredServices = computed(() => {
  return services.value.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                        service.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesCategory = categoryFilter.value === 'All Categories' || 
                          service.category === categoryFilter.value;
    
    return matchesSearch && matchesCategory;
  });
});

const totalServices = computed(() => filteredServices.value.length);

// Methods
const resetFilters = () => {
  searchQuery.value = '';
  categoryFilter.value = 'All Categories';
};

// Fetch services on mount
onMounted(async () => {
  try {
    isLoading.value = true;
    // Uncomment when API is ready
    // await serviceStore.fetchServices();
    // services.value = serviceStore.services;
  } catch (error) {
    console.error('Error fetching services:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>
