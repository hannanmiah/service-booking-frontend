<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Bookings Management</h1>
    
    <!-- Filters -->
    <div class="mb-6 flex space-x-4">
      <UInput 
        v-model="searchQuery" 
        placeholder="Search bookings..." 
        icon="i-heroicons-magnifying-glass"
        class="w-64"
      />
      <USelect
        v-model="statusFilter"
        :options="['all', 'pending', 'confirmed', 'completed', 'cancelled']"
        class="w-40"
      />
    </div>

    <!-- Bookings Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <UTable 
        :columns="columns" 
        :rows="filteredBookings"
        :loading="isLoading"
      >
        <template #status-data="{ row }">
          <UBadge 
            :color="getStatusColor(row.status)"
            variant="subtle"
          >
            {{ row.status }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex space-x-2">
            <UButton 
              color="blue" 
              variant="ghost" 
              icon="i-heroicons-eye"
              @click="viewBooking(row)"
              title="View Details"
            />
            <UButton 
              v-if="row.status === 'pending'"
              color="green" 
              variant="ghost" 
              icon="i-heroicons-check"
              @click="updateStatus(row, 'confirmed')"
              title="Confirm Booking"
            />
            <UButton 
              v-if="row.status === 'confirmed'"
              color="green" 
              variant="ghost" 
              icon="i-heroicons-check-circle"
              @click="updateStatus(row, 'completed')"
              title="Mark as Completed"
            />
            <UButton 
              v-if="!['completed', 'cancelled'].includes(row.status)"
              color="red" 
              variant="ghost" 
              icon="i-heroicons-x-mark"
              @click="updateStatus(row, 'cancelled')"
              title="Cancel Booking"
            />
          </div>
        </template>
      </UTable>

      <!-- Empty State -->
      <div v-if="!isLoading && filteredBookings.length === 0" class="p-6 text-center text-gray-500">
        No bookings found
      </div>

      <!-- Pagination -->
      <div v-if="filteredBookings.length > 0" class="px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Showing <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> to 
          <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredBookings.length) }}</span> of 
          <span class="font-medium">{{ filteredBookings.length }}</span> results
        </div>
        <UPagination
          v-model="currentPage"
          :page-count="pageSize"
          :total="filteredBookings.length"
          :ui="{ rounded: 'first:rounded-s-md last:rounded-e-md' }"
        />
      </div>
    </div>

    <!-- Booking Details Modal -->
    <UModal v-model="isViewModalOpen">
      <UCard v-if="selectedBooking">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Booking #{{ selectedBooking.id }}</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="isViewModalOpen = false" />
          </div>
        </template>

        <div class="space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-500">Customer</h4>
            <p class="mt-1 text-sm text-gray-900">{{ selectedBooking.user?.name }}</p>
            <p class="text-sm text-gray-500">{{ selectedBooking.user?.email }}</p>
          </div>
          
          <div>
            <h4 class="text-sm font-medium text-gray-500">Service</h4>
            <p class="mt-1 text-sm text-gray-900">{{ selectedBooking.service?.name }}</p>
            <p class="text-sm text-gray-500">${{ selectedBooking.service?.price }}</p>
          </div>
          
          <div>
            <h4 class="text-sm font-medium text-gray-500">Date & Time</h4>
            <p class="mt-1 text-sm text-gray-900">{{ formatDateTime(selectedBooking.booking_date) }}</p>
          </div>
          
          <div>
            <h4 class="text-sm font-medium text-gray-500">Status</h4>
            <UBadge 
              :color="getStatusColor(selectedBooking.status)"
              variant="subtle"
              class="mt-1"
            >
              {{ selectedBooking.status }}
            </UBadge>
          </div>
          
          <div v-if="selectedBooking.notes">
            <h4 class="text-sm font-medium text-gray-500">Notes</h4>
            <p class="mt-1 text-sm text-gray-900 whitespace-pre-line">{{ selectedBooking.notes }}</p>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useServiceStore } from '~/stores/service';
import type { Booking } from '~/stores/service';

const serviceStore = useServiceStore();
const bookings = ref<Booking[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = 10;
const isViewModalOpen = ref(false);
const selectedBooking = ref<Booking | null>(null);

// Table columns
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'user.name', label: 'Customer' },
  { key: 'service.name', label: 'Service' },
  { key: 'booking_date', label: 'Date & Time' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' }
];

// Fetch bookings on mount
onMounted(async () => {
  await fetchBookings();
});

async function fetchBookings() {
  try {
    isLoading.value = true;
    await serviceStore.fetchAllBookings();
    bookings.value = serviceStore.bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
  } finally {
    isLoading.value = false;
  }
}

// Filter and search bookings
const filteredBookings = computed(() => {
  return bookings.value
    .filter(booking => {
      const matchesSearch = !searchQuery.value || 
        booking.user?.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        booking.service?.name?.toLowerCase().includes(searchQuery.value.toLowerCase());
      
      const matchesStatus = statusFilter.value === 'all' || 
        booking.status === statusFilter.value;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
});

// Pagination
const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredBookings.value.slice(start, start + pageSize);
});

// Format date and time
function formatDateTime(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleString('en-US', options);
}

// Get status color
function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    pending: 'yellow',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'red',
  };
  return statusColors[status] || 'gray';
}

// View booking details
function viewBooking(booking: Booking) {
  selectedBooking.value = booking;
  isViewModalOpen.value = true;
}

// Update booking status
async function updateStatus(booking: Booking, newStatus: string) {
  try {
    await serviceStore.updateBooking(booking.id, { status: newStatus });
    await fetchBookings();
  } catch (error) {
    console.error('Error updating booking status:', error);
  }
}
</script>
