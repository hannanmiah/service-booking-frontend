<template>
  <div class="flex flex-col gap-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Services Management</h1>
      <UButton color="success" @click="openCreateModal">
        <UIcon name="i-heroicons-plus" class="mr-2 h-4 w-4"/>
        Add New Service
      </UButton>
    </div>

    <div class="bg-white shadow overflow-hidden sm:rounded-lg flex justify-end p-4">
      <u-input
          v-model="filter.search"
          placeholder="Search"
          icon="i-heroicons-magnifying-glass"
          size="xl"
      />
    </div>

    <!-- Services Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="overflow-x-auto">
        <UTable ref="table" :data="services.data" :columns="columns">
          <template #is_active-cell="{ row }">
            <UBadge
                :color="row.original.is_active ? 'success' : 'error'"
                variant="subtle"
            >
              {{ row.original.is_active ? 'Active' : 'Inactive' }}
            </UBadge>
          </template>
          <template #is_featured-cell="{ row }">
            <UBadge
                :color="row.original.is_featured ? 'success' : 'info'"
                variant="subtle"
            >
              {{ row.original.is_featured ? 'Featured' : 'Not Featured' }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex space-x-2">
              <UButton color="info" variant="ghost" icon="i-heroicons-pencil" @click="openEditModal(row.original)"/>
              <UButton color="error" variant="ghost" icon="i-heroicons-trash" @click="confirmDelete(row.original)"/>
            </div>
          </template>
        </UTable>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex justify-end mt-4">
      <UPagination
          v-model:page="page"
          :items-per-page="services?.meta.per_page"
          :total="services?.meta.total"
      />
    </div>

    <!-- Service Form Modal -->
    <UModal v-model:open="isModalOpen">

      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Edit Service' : 'Add New Service' }}
          </h3>
          <UButton color="error" variant="ghost" icon="i-heroicons-x-mark" @click="closeModal"/>
        </div>
      </template>
      <template #body>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <UFormField label="Name" name="name" required>
            <UInput v-model="formData.name" class="w-full"/>
          </UFormField>
          <UFormField label="Description" name="description">
            <UTextarea v-model="formData.description" class="w-full"/>
          </UFormField>
          <UFormField label="Price" name="price" required>
            <UInput v-model="formData.price" type="number" step="0.01" min="0" class="w-full"/>
          </UFormField>
          <UFormField label="Active" name="status">
            <USwitch
                v-model="formData.is_active"
            />
          </UFormField>
          <UFormField label="Featured" name="featured">
            <USwitch
                v-model="formData.is_featured"
            />
          </UFormField>
          <div class="flex justify-end space-x-3 mt-6">
            <UButton type="button" color="warning" @click="closeModal">Cancel</UButton>
            <UButton type="submit" color="success" :loading="isSubmitting">
              {{ isEditing ? 'Update' : 'Create' }} Service
            </UButton>
          </div>
        </form>
      </template>
    </UModal>

    <!-- Delete Confirmation -->
    <UModal v-model:open="isDeleteDialogOpen">

      <template #header>
        <h3 class="text-lg font-semibold">Confirm Deletion</h3>
      </template>
      <template #body>
        <p class="text-gray-600 mb-4">
          Delete "{{ serviceToDelete?.name }}"? This action cannot be undone.
        </p>
        <div class="flex justify-end space-x-3">
          <UButton color="warning" @click="isDeleteDialogOpen = false">Cancel</UButton>
          <UButton color="info" :loading="isDeleting" @click="deleteService">
            Delete
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type {ApiResponse, Service} from '#api';
import type {TableColumn} from "@nuxt/ui";

definePageMeta({
  middleware: ['sanctum:auth', 'admin'],
  layout: 'admin'
})

const serviceStore = useServiceStore();
const client = useSanctumClient();
const toast = useToast();
const page = ref(1);
const filter = reactive({
  search: ''
})
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
  is_active: true,
  is_featured: false
});

const columns: TableColumn<Service>[] = [
  {
    accessorKey: 'id',
    header: '#',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'price',
    header: 'Price',
  },
  {
    accessorKey: 'is_active',
    header: 'Active?',
  },
  {
    accessorKey: 'is_featured',
    header: 'Featured?',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  }
]

const getStatusColor = (status: string) => {
  if (status === 'active') {
    return 'success';
  } else if (status === 'inactive') {
    return 'danger';
  } else {
    return 'info';
  }
}

// Fetch services
const {
  data: services,
  refresh
} = await useAsyncData<ApiResponse<Service>>(`services-page-${page.value}-search-${filter.search}`, () => {
  return client('/api/services', {
    params: {
      page: page.value,
      search: filter.search
    }
  })
}, {
  watch: [page, filter],
});

function openCreateModal() {
  isEditing.value = false;
  formData.value = {name: '', description: '', price: 0, is_active: true};
  isModalOpen.value = true;
}

function openEditModal(service: Service) {
  isEditing.value = true;
  formData.value = {...service};
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  formData.value = {name: '', description: '', price: 0, is_active: true};
}

async function handleSubmit() {
  try {
    isSubmitting.value = true;
    if (isEditing.value && formData.value.id) {
      await serviceStore.updateService(formData.value.id, formData.value);
    } else {
      await serviceStore.createService(formData.value as Omit<Service, 'id'>);
    }
    toast.add({
      title: 'Success',
      description: `Service ${isEditing.value ? 'updated' : 'created'} successfully.`,
      color: 'success',
    });
    await refresh();
    closeModal();
  } catch (error) {
    toast.add({
      title: 'Error',
      description: `Failed to ${isEditing.value ? 'update' : 'create'} service.`,
      color: 'error',
    });
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
    await refresh();
    isDeleteDialogOpen.value = false;
    toast.add({
      title: 'Success',
      description: 'Service deleted successfully.',
      color: 'success',
    });
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete service.',
      color: 'error',
    });
  } finally {
    isDeleting.value = false;
  }
}
</script>
