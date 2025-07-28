<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Services Management</h1>
      <UButton color="indigo" @click="openCreateModal">
        <UIcon name="i-heroicons-plus" class="mr-2 h-4 w-4" />
        Add New Service
      </UButton>
    </div>

    <!-- Services Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="service in services" :key="service.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ service.name }}</div>
                <div class="text-sm text-gray-500">{{ service.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">${{ service.price }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': service.status === 'active',
                    'bg-red-100 text-red-800': service.status === 'inactive'
                  }"
                >
                  {{ service.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <UButton 
                  color="gray" 
                  variant="ghost" 
                  icon="i-heroicons-pencil"
                  @click="openEditModal(service)"
                />
                <UButton 
                  color="red" 
                  variant="ghost" 
                  icon="i-heroicons-trash"
                  @click="confirmDelete(service)"
                />
              </td>
            </tr>
            <tr v-if="services.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                No services found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Service Form Modal -->
    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ isEditing ? 'Edit Service' : 'Add New Service' }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal" />
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormGroup label="Name" name="name" required>
            <UInput v-model="formData.name" />
          </UFormGroup>
          <UFormGroup label="Description" name="description">
            <UTextarea v-model="formData.description" />
          </UFormGroup>
          <UFormGroup label="Price" name="price" required>
            <UInput v-model="formData.price" type="number" step="0.01" min="0" />
          </UFormGroup>
          <UFormGroup label="Status" name="status">
            <USelect
              v-model="formData.status"
              :options="['active', 'inactive']"
            />
          </UFormGroup>
          <div class="flex justify-end space-x-3 mt-6">
            <UButton type="button" color="gray" @click="closeModal">Cancel</UButton>
            <UButton type="submit" color="indigo" :loading="isSubmitting">
              {{ isEditing ? 'Update' : 'Create' }} Service
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal v-model="isDeleteDialogOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Confirm Deletion</h3>
        </template>
        <p class="text-gray-600 mb-4">
          Delete "{{ serviceToDelete?.name }}"? This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <UButton color="gray" @click="isDeleteDialogOpen = false">Cancel</UButton>
          <UButton color="red" :loading="isDeleting" @click="deleteService">
            Delete
          </UButton>
        </div>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useServiceStore } from '~/stores/service';
import type { Service } from '~/stores/service';

const serviceStore = useServiceStore();
const services = ref<Service[]>([]);
const isModalOpen = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const serviceToDelete = ref<Service | null>(null);

const formData = ref<Partial<Service>>({
  name: '',
  description: '',
  price: 0,
  status: 'active',
});

// Fetch services on mount
onMounted(fetchServices);

async function fetchServices() {
  try {
    await serviceStore.fetchServices();
    services.value = serviceStore.services;
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

function openCreateModal() {
  isEditing.value = false;
  formData.value = { name: '', description: '', price: 0, status: 'active' };
  isModalOpen.value = true;
}

function openEditModal(service: Service) {
  isEditing.value = true;
  formData.value = { ...service };
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  formData.value = { name: '', description: '', price: 0, status: 'active' };
}

async function handleSubmit() {
  try {
    isSubmitting.value = true;
    if (isEditing.value && formData.value.id) {
      await serviceStore.updateService(formData.value.id, formData.value);
    } else {
      await serviceStore.createService(formData.value as Omit<Service, 'id'>);
    }
    await fetchServices();
    closeModal();
  } catch (error) {
    console.error('Error saving service:', error);
  } finally {
    isSubmitting.value = false;
  }
}

function confirmDelete(service: Service) {
  serviceToDelete.value = service;
  isDeleteDialogOpen.value = true;
}

async function deleteService() {
  if (!serviceToDelete.value?.id) return;
  
  try {
    isDeleting.value = true;
    await serviceStore.deleteService(serviceToDelete.value.id);
    await fetchServices();
    isDeleteDialogOpen.value = false;
  } catch (error) {
    console.error('Error deleting service:', error);
  } finally {
    isDeleting.value = false;
  }
}
</script>
