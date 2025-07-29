<script setup lang="ts">
import type { ApiResponse, Service} from '#api';
const {data: services} = await useSanctumFetch<ApiResponse<Service>>('/api/services',{
  params: {
    featured: true
  }
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-indigo-700 text-white py-20">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">Professional Home Services</h1>
        <p class="text-xl mb-8 max-w-2xl mx-auto">Book trusted professionals for all your home service needs</p>
        <UButton to="/services" size="xl" class="bg-white text-indigo-700 hover:bg-indigo-50">
          Book a Service
        </UButton>
      </div>
    </section>

    <!-- Services -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Popular Services</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="service in services?.data" :key="service.id" class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="h-48 bg-gray-200">
              <img
                :src="service?.image || '/images/service.svg'"
                :alt="service.name"
                class="w-full h-full object-cover"
              >
            </div>
            <div class="p-6">
              <h3 class="text-xl font-semibold">{{ service.name }}</h3>
              <p class="text-gray-600 mt-2 line-clamp-2">{{ service.description }}</p>
              <div class="mt-4 flex justify-between items-center">
                <span class="text-indigo-600 font-bold">${{ service.price }}</span>
                <UButton :to="`/services/${service.id}`" color="primary" size="sm">
                  Book Now
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-gray-100 py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers today</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton to="/register" color="primary" size="xl">
            Sign Up Now
          </UButton>
          <UButton to="/services" variant="outline" size="xl">
            Learn More
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>