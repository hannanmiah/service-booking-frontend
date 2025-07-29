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
              <span class="ml-4 text-gray-500">{{ service?.data.name }}</span>
            </li>
          </ol>
        </nav>
        
        <div class="mt-6">
          <h1 class="text-3xl font-bold text-gray-900">{{ service?.data.name }}</h1>
          <div class="mt-4 flex items-center justify-between">
            <div class="flex items-center">
              <UIcon 
                v-for="i in 5" 
                :key="i"
                :name="i <= service?.data?.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                class="h-5 w-5 text-yellow-400"
              />
              <span class="ml-2 text-gray-600">{{ service?.data?.rating || 0 }} ({{ service?.data?.reviewCount || 0 }})</span>
            </div>
            <span class="text-2xl font-bold text-indigo-600">${{ service?.data.price }}</span>
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
              :src="service?.data?.image || '/images/service.svg'"
              :alt="service?.data.name"
              class="w-full h-96 object-cover"
            >
          </div>

          <!-- Service Details -->
          <div class="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4">Service Details</h2>
            <p class="text-gray-700">{{ service?.data?.longDescription || service?.data.description }}</p>
            
            <div class="mt-6">
              <h3 class="text-lg font-medium mb-2">What's Included</h3>
              <ul class="space-y-2">
                <li v-for="(item, index) in service?.data?.includedItems || []" :key="index" class="flex items-start">
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
              <UFormField label="Date">
                <UInput size="xl" type="date" v-model="bookingDate" :min="new Date().toISOString().split('T')[0]" />
              </UFormField>

              <UButton 
                type="submit" 
                color="primary"
                block
                size="lg"
                :loading="isSubmitting"
              >
                Book Now for ${{ service?.data.price }}
              </UButton>
            </form>

            <!-- Service Provider -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <h3 class="text-sm font-medium text-gray-900 mb-3">Service Provider</h3>
              <div class="flex items-center">
                <img :src="service?.data?.provider?.avatar" :alt="service?.data?.provider?.name" class="h-10 w-10 rounded-full">
                <div class="ml-3">
                  <p class="text-sm font-medium">{{ service?.data?.provider?.name || 'Service Pro' }}</p>
                  <div class="flex items-center">
                    <UIcon name="i-heroicons-star-solid" class="h-4 w-4 text-yellow-400" />
                    <span class="ml-1 text-sm text-gray-500">{{ service?.data?.provider?.rating || 0 }} ({{ service?.data?.provider?.reviewCount || 0 }})</span>
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
import type {Service} from '#api';

const route = useRoute();
const client = useSanctumClient();
const toast = useToast();
const serviceId = route.params.id;
const isSubmitting = ref(false);
const bookingDate = ref('');
const selectedTimeSlot = ref('');

// service fetch
const { data: service } = await useAsyncData<{data: Service}>(`service-${serviceId}`, () => {
  return client(`/api/services/${serviceId}`);
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
  if (!bookingDate.value) {
    // Show error
    toast.add({
      title: 'Error',
      description: 'Please select a date.',
      color: 'error',
    });
    return;
  }

  isSubmitting.value = true;
  try {
    // Handle booking logic
   const res = await client<Booking>('/api/bookings', {
      method: 'POST',
      body: {
        service_id: service.value?.data.id,
        booking_date: bookingDate.value,
      }
   });
    // toast
    toast.add({
      title: 'Booking Confirmed',
      description: 'Your booking has been confirmed.',
      color: 'success',
    });
    // Redirect to booking confirmation
    navigateTo(`/booking/confirm?booking=${res.id}`);
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error?.message,
      color: 'error',
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
