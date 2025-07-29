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
          ref="table"
        :columns="columns" 
        :data="bookings.data"
        :loading="isLoading"
        v-model:pagination="pagination"
        :pagination-options="{
        getPaginationRowModel: getPaginationRowModel()
      }"
      >
        <template #status-cell="{ row }">
          <UBadge 
            :color="getStatusColor(row.status)"
            variant="subtle"
          >
            {{ row.original.status }}
          </UBadge>
        </template>

        <template #booking_date-cell="{ row }">
          <p class="text-sm text-gray-900">{{ useDateFormat(row.original.booking_date, 'MM/DD/YYYY h:mm A') }}</p>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex space-x-2">
            <UButton 
              color="success"
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
      <div v-if="!isLoading && bookings.data.length === 0" class="p-6 text-center text-gray-500">
        No bookings found
      </div>

      <!-- Pagination -->
      <div v-if="bookings.data.length > 0" class="px-4 py-3 flex items-center justify-center border-t border-gray-200">
        <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>

    <!-- Booking Details Modal -->
    <UModal v-model="isViewModalOpen">
      <UCard v-if="selectedBooking">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Booking #{{ selectedBooking.id }}</h3>
            <UButton color="success" variant="ghost" icon="i-heroicons-x-mark" @click="isViewModalOpen = false" />
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
          
          <div v-if="selectedBooking?.notes">
            <h4 class="text-sm font-medium text-gray-500">Notes</h4>
            <p class="mt-1 text-sm text-gray-900 whitespace-pre-line">{{ selectedBooking?.notes }}</p>
          </div>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '#api';
import { getPaginationRowModel } from '@tanstack/vue-table'

definePageMeta({
  middleware: ['sanctum:auth','admin'],
  layout: 'admin'
})

const serviceStore = useServiceStore();
const table = useTemplateRef('table');
const isLoading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = 10;
const isViewModalOpen = ref(false);
const selectedBooking = ref<Booking | null>(null);

// Table columns
const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'user.name', header: 'Customer' },
  { accessorKey: 'service.name', header: 'Service' },
  { accessorKey: 'booking_date', header: 'Date & Time' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '#' }
];

// Fetch bookings
const {data: bookings} = await useSanctumFetch<{data: Booking[]}>('/api/admin/bookings');


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
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'error',
  };
  return statusColors[status] || 'info';
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

const pagination = ref({
  pageIndex: 0,
  pageSize: 15
})
</script>
