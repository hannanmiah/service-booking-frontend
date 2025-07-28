<template>
  <div class="py-8">
    <!-- Service Header -->
    <div class="bg-white shadow">
      <div class="container mx-auto px-4 py-8">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="flex items-center space-x-4">
            <li><NuxtLink to="/" class="text-indigo-600 hover:text-indigo-800">Home</NuxtLink></li>
            <li class="flex items-center">
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-400" />
              <NuxtLink to="/services" class="ml-4 text-indigo-600 hover:text-indigo-800">Services</NuxtLink>
            </li>
            <li class="flex items-center">
              <UIcon name="i-heroicons-chevron-right" class="h-5 w-5 text-gray-400" />
              <span class="ml-4 text-gray-500">{{ service.name }}</span>
            </li>
          </ol>
        </nav>
        
        <div class="mt-6">
          <h1 class="text-3xl font-bold text-gray-900">{{ service.name }}</h1>
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center">
              <UIcon 
                v-for="i in 5" 
                :key="i"
                :name="i <= service.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                class="h-5 w-5 text-yellow-400"
              />
              <span class="ml-2 text-gray-600">{{ service.rating }} ({{ service.reviewCount }})</span>
            </div>
            <span class="text-2xl font-bold text-indigo-600">${{ service.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2">
          <!-- Image -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              :src="service.image || '/images/service-placeholder.jpg'" 
              :alt="service.name"
              class="w-full h-96 object-cover"
            >
          </div>

          <!-- Service Details -->
          <div class="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Service Details</h2>
            <p class="text-gray-700">{{ service.longDescription || service.description }}</p>
            
            <div class="mt-6">
              <h3 class="text-lg font-medium mb-2">What's Included</h3>
              <ul class="space-y-2">
                <li v-for="(item, index) in service.includedItems" :key="index" class="flex items-start">
                  <UIcon name="i-heroicons-check-circle" class="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Right Column - Booking Card -->
        <div class="lg:sticky lg:top-8 h-fit">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Book This Service</h2>
            
            <form @submit.prevent="handleBooking" class="space-y-4">
              <UFormGroup label="Date">
                <UInput type="date" v-model="bookingDate" :min="new Date().toISOString().split('T')[0]" />
              </UFormGroup>

              <UFormGroup label="Time Slot">
                <USelect
                  v-model="selectedTimeSlot"
                  :options="availableTimeSlots"
                  placeholder="Select a time slot"
                />
              </UFormGroup>

              <UButton 
                type="submit" 
                color="indigo" 
                block
                size="lg"
                :loading="isSubmitting"
              >
                Book Now for ${{ service.price }}
              </UButton>
            </form>

            <!-- Service Provider -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Service Provider</h3>
              <div class="flex items-center">
                <img :src="service.provider.avatar" :alt="service.provider.name" class="h-10 w-10 rounded-full">
                <div class="ml-3">
                  <p class="text-sm font-medium">{{ service.provider.name }}</p>
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-star-solid" class="h-4 w-4 text-yellow-400" />
                    <span class="ml-1 text-sm text-gray-500">{{ service.provider.rating }} ({{ service.provider.reviewCount }})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const serviceId = route.params.id;
const isSubmitting = ref(false);
const bookingDate = ref('');
const selectedTimeSlot = ref('');

// Mock service data - replace with API call
const service = ref({
  id: serviceId,
  name: 'Home Cleaning',
  description: 'Professional home cleaning service',
  longDescription: 'Our professional home cleaning service provides a thorough clean of your entire home. Our trained professionals will clean and sanitize all surfaces, leaving your home spotless and fresh.',
  price: 99,
  rating: 4.8,
  reviewCount: 124,
  image: '/images/cleaning.jpg',
  includedItems: [
    'Dusting of all surfaces',
    'Vacuuming and mopping floors',
    'Bathroom cleaning and sanitization',
    'Kitchen cleaning',
    'Window cleaning (interior)'
  ],
  provider: {
    name: 'CleanPro Services',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.8,
    reviewCount: 245
  }
});

// Available time slots
const availableTimeSlots = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '1:00 PM - 3:00 PM',
  '3:00 PM - 5:00 PM'
];

// Handle form submission
const handleBooking = async () => {
  if (!bookingDate.value || !selectedTimeSlot.value) {
    // Show error
    return;
  }

  isSubmitting.value = true;
  try {
    // Handle booking logic
    console.log('Booking details:', {
      serviceId: service.value.id,
      date: bookingDate.value,
      timeSlot: selectedTimeSlot.value
    });
    
    // Redirect to booking confirmation
    // navigateTo(`/booking/confirm?service=${service.value.id}&date=${bookingDate.value}&time=${selectedTimeSlot.value}`);
  } catch (error) {
    console.error('Error creating booking:', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Fetch service details on mount
onMounted(() => {
  // Fetch service details using serviceId
  // service.value = await fetchService(serviceId);
});
</script>
