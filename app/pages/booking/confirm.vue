<template>
  <div class="py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Success Message -->
      <div class="text-center mb-12">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <UIcon name="i-heroicons-check" class="h-8 w-8 text-green-600" />
        </div>
        <h1 class="mt-4 text-3xl font-extrabold text-gray-900">Booking Confirmed!</h1>
        <p class="mt-2 text-lg text-gray-600">Your service has been successfully booked.</p>
        <p class="text-gray-500">A confirmation has been sent to your email.</p>
      </div>

      <!-- Booking Summary -->
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Booking Details
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">
            Your booking reference: <span class="font-mono font-medium">#{{ booking?.data.id }}</span>
          </p>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Service</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ booking?.data?.service?.name }}
              </dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Date & Time</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ formatDate(booking?.data?.booking_date) }}, {{ booking?.data.created_at }}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Service Provider</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ booking?.data?.serviceProvider?.name || 'Service Pro' }}
              </dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Address</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {{ booking?.data?.address || 'N/A' }}
              </dd>
            </div>
            <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Total Amount</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                ${{ booking?.data?.service?.price }}
              </dd>
            </div>
            <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-500">Status</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Confirmed
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 class="text-lg font-medium text-blue-800">What's Next?</h3>
        <ul class="mt-4 space-y-3">
          <li class="flex items-start">
            <UIcon name="i-heroicons-envelope" class="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <span class="text-sm text-blue-700">Check your email for booking confirmation and details.</span>
          </li>
          <li class="flex items-start">
            <UIcon name="i-heroicons-phone" class="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <span class="text-sm text-blue-700">The service provider may contact you to confirm details.</span>
          </li>
          <li class="flex items-start">
            <UIcon name="i-heroicons-calendar" class="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <span class="text-sm text-blue-700">We'll send you a reminder 24 hours before your appointment.</span>
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <UButton 
          to="/bookings" 
          color="success"
          class="w-full sm:w-auto justify-center"
        >
          View My Bookings
        </UButton>
        <UButton 
          to="/" 
          variant="outline" 
          class="w-full sm:w-auto justify-center"
        >
          Back to Home
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const route = useRoute();

// fetch
const {data: booking} = await useSanctumFetch<{data: Booking}>(`/api/bookings/${route.query.booking}`);

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
</script>
