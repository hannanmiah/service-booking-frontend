<script setup lang="ts">
import type {ApiResponse, User} from "#api";
import type { TableColumn } from '@nuxt/ui';

definePageMeta({
  middleware: ['sanctum:auth','admin'],
  layout: 'admin'
})

const columns: TableColumn<User>[] = [
  {
    accessorKey: 'id',
    header: '#',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'is_admin',
    header: 'Admin',
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
  }
]

const {data: users} = await useSanctumFetch<ApiResponse<User>>('/api/users');
</script>

<template>
  <div class="flex flex-col gap-2 md:gap-4">
    <h1 class="text-2xl font-semibold text-gray-900">Users Management</h1>

    <UCard>
      <UTable :data="users?.data" :columns="columns" />
    </UCard>
  </div>
</template>

<style scoped>

</style>