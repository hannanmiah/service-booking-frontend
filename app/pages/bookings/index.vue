<template>
  <div class="py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p class="mt-1 text-sm text-gray-500">View and manage your upcoming and past service appointments.</p>
      </div>

      <!-- Bookings List -->
      <div class="space-y-4">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-indigo-600" />
        </div>

        <!-- Empty State -->
        <div v-else-if="bookings.data.length === 0" class="text-center py-12">
          <UIcon name="i-heroicons-calendar" class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p class="mt-1 text-sm text-gray-500">You don't have any {{ activeTab === 'upcoming' ? 'upcoming' : 'past' }} bookings.</p>
          <div class="mt-6">
            <UButton to="/services" color="success">
              <UIcon name="i-heroicons-plus" class="h-5 w-5 mr-2" />
              Book a Service
            </UButton>
          </div>
        </div>

        <!-- Bookings -->
        <div v-else class="space-y-4">
          <div v-for="booking in bookings.data" :key="booking.id" class="bg-white shadow overflow-hidden rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    {{ booking.service?.name || 'Service' }}
                  </h3>
                  <UBadge 
                    :color="getStatusColor(booking.status)" 
                    variant="subtle" 
                    class="ml-3"
                  >
                    {{ formatStatus(booking.status) }}
                  </UBadge>
                </div>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  Booking #{{ booking.id }}
                </p>
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-4">
                <UButton 
                  :to="`/bookings/${booking.id}`" 
                  color="success"
                  variant="outline"
                  size="sm"
                >
                  View Details
                </UButton>
              </div>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Date & Time</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ formatDateTime(booking.booking_date) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Provider</dt>
                  <dd class="mt-1 text-sm text-gray-900">
                    {{ booking?.provider?.name || 'N/A' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Amount</dt>
                  <dd class="mt-1 text-sm font-medium text-gray-900">
                    ${{ booking?.service?.price || '0.00' }}
                  </dd>
                </div>
              </dl>
              
              <!-- Actions -->
              <div v-if="booking.status === 'pending'" class="mt-4 pt-4 border-t border-gray-100 flex space-x-3">
                <UButton 
                  color="error"
                  variant="outline" 
                  size="sm"
                  @click="cancelBooking(booking)"
                  :loading="cancellingBookingId === booking.id"
                >
                  Cancel Booking
                </UButton>
                <UButton 
                  color="info"
                  size="sm"
                  :to="`/bookings/${booking.id}/reschedule`"
                >
                  Reschedule
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '#api';
import { useServiceStore } from '~/stores/service';

const serviceStore = useServiceStore();
const isLoading = ref(false);
const cancellingBookingId = ref<number | null>(null);

// Pagination
const currentPage = ref(1);
const pageSize = 10;

const {data: bookings} = await useSanctumFetch<{data: Booking[]}>(`/api/bookings`);

// Tabs
const activeTab = ref('upcoming');
const tabs = [
  { label: 'Upcoming', value: 'upcoming', icon: 'i-heroicons-clock' },
  { label: 'Past', value: 'past', icon: 'i-heroicons-check-circle' },
  { label: 'Cancelled', value: 'cancelled', icon: 'i-heroicons-x-circle' },
];

// Format date and time
const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format status
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'success';
    case 'completed':
      return 'info';
    case 'cancelled':
      return 'error';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Filter bookings based on active tab
const filteredBookings = computed(() => {
  if (!serviceStore.bookings) return [];
  
  const now = new Date();
  return serviceStore.bookings.filter((booking: any) => {
    const bookingDate = new Date(booking.booking_date);
    
    if (activeTab.value === 'upcoming') {
      return booking.status !== 'cancelled' && booking.status !== 'completed' && bookingDate >= now;
    } else if (activeTab.value === 'past') {
      return booking.status === 'completed' || (booking.status !== 'cancelled' && bookingDate < now);
    } else {
      return booking.status === activeTab.value;
    }
  }).sort((a: any, b: any) => {
    return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
  });
});

// Paginated bookings
const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredBookings.value.slice(start, end);
});

// Cancel booking
const cancelBooking = async (booking: any) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  try {
    cancellingBookingId.value = booking.id;
    // In a real app, you would call an API to cancel the booking
    // await serviceStore.cancelBooking(booking.id);
    
    // For demo purposes, we'll just update the local state
    const index = serviceStore.bookings.findIndex((b: any) => b.id === booking.id);
    if (index !== -1) {
      serviceStore.bookings[index].status = 'cancelled';
    }
    
    useToast().add({
      title: 'Booking Cancelled',
      description: 'Your booking has been cancelled successfully.',
      icon: 'i-heroicons-check-circle',
      color: 'green',
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    useToast().add({
      title: 'Error',
      description: 'Failed to cancel booking. Please try again.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
    });
  } finally {
    cancellingBookingId.value = null;
  }
};

// Fetch user bookings on mount
onMounted(async () => {
  try {
    isLoading.value = true;
    await serviceStore.fetchUserBookings();
  } catch (error) {
    console.error('Error fetching bookings:', error);
    useToast().add({
      title: 'Error',
      description: 'Failed to load bookings. Please try again.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
    });
  } finally {
    isLoading.value = false;
  }
});

// Watch for tab changes and reset pagination
watch(activeTab, () => {
  currentPage.value = 1;
});
</script>