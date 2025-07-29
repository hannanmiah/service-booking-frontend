import type { Service, Booking } from '#api';

export const useServiceStore = defineStore('service', () => {
  const services = ref<Service[]>([]);
  const bookings = ref<Booking[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch all services
  const fetchServices = async () => {
    loading.value = true;
    error.value = null;
    const config = useRuntimeConfig();
    
    try {
      const { data, error: fetchError } = await useSanctumFetch('/api/services')

      if (fetchError.value) {
        throw new Error(fetchError.value.data?.message || 'Failed to fetch services');
      }

      services.value = data.value as Service[];
      return data.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create a new service (Admin only)
  const createService = async (serviceData: Omit<Service, 'id'>) => {
    loading.value = true;
    error.value = null;
    const config = useRuntimeConfig();
    
    try {
      const { data, error: createError } = await useSanctumFetch('/api/services', {
        method: 'POST',
        body: serviceData,
      });

      if (createError.value) {
        throw new Error(createError.value.data?.message || 'Failed to create service');
      }

      await fetchServices(); // Refresh the services list
      return data.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Update a service (Admin only)
  const updateService = async (id: number, serviceData: Partial<Service>) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: updateError } = await useSanctumFetch(`/api/services/${id}`, {
        method: 'PUT',
        body: serviceData,
      });

      if (updateError.value) {
        throw new Error(updateError.value.data?.message || 'Failed to update service');
      }

      await fetchServices(); // Refresh the services list
      return data.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Delete a service (Admin only)
  const deleteService = async (id: number) => {
    loading.value = true;
    error.value = null;
    const config = useRuntimeConfig();
    
    try {
      const { error: deleteError } = await useSanctumFetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (deleteError.value) {
        throw new Error(deleteError.value.data?.message || 'Failed to delete service');
      }

      await fetchServices(); // Refresh the services list
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Fetch user's bookings
  const fetchUserBookings = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: fetchError } = await useSanctumFetch('/api/bookings');

      if (fetchError.value) {
        throw new Error(fetchError.value.data?.message || 'Failed to fetch bookings');
      }

      bookings.value = data.value as Booking[];
      return data.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Create a new booking
  const createBooking = async (bookingData: { service_id: number; booking_date: string }) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: createError } = await useFetch('/api/bookings', {
        method: 'POST',
        body: bookingData,
      });

      if (createError.value) {
        throw new Error(createError.value.data?.message || 'Failed to create booking');
      }

      await fetchUserBookings(); // Refresh the bookings list
      return data.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Fetch all bookings (Admin only)
  const fetchAllBookings = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: fetchError } = await useFetch('/api/admin/bookings', {

      });

      if (fetchError.value) {
        throw new Error(fetchError.value.data?.message || 'Failed to fetch all bookings');
      }

      bookings.value = data.value as Booking[];
      return data.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    services,
    bookings,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    fetchUserBookings,
    createBooking,
    fetchAllBookings,
  };
});
