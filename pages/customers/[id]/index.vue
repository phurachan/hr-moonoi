<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/customers" class="btn btn-ghost btn-sm">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Customers
      </NuxtLink>
      <div class="flex-1">
        <h1 class="text-3xl font-bold">Customer Details</h1>
        <p class="text-gray-600 mt-2">View customer information</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink :to="`/customers/${customerId}/edit`" class="btn btn-primary btn-sm">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Customer Details -->
    <div v-else class="space-y-6">
      <!-- Main Info Card -->
      <div class="bg-base-100 rounded-lg shadow-lg">
        <div class="p-6">
          <div class="flex items-center gap-6 mb-6">
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-20">
                <span class="text-2xl">{{ getInitials(customer.name) }}</span>
              </div>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold">{{ customer.name }}</h2>
              <div class="flex items-center gap-2 mt-2">
                <div class="badge" :class="getStatusClass(customer.status)">
                  {{ customer.status }}
                </div>
                <span class="text-gray-500">• Created {{ formatDate(customer.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Contact Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold border-b pb-2">Contact Information</h3>
              
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <div>
                    <div class="font-medium">Phone</div>
                    <div class="text-gray-600">{{ customer.tel }}</div>
                  </div>
                </div>

                <div v-if="customer.email" class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <div>
                    <div class="font-medium">Email</div>
                    <div class="text-gray-600">{{ customer.email }}</div>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <div>
                    <div class="font-medium">Address</div>
                    <div class="text-gray-600 whitespace-pre-line">{{ customer.address }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Business Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold border-b pb-2">Business Information</h3>
              
              <div class="space-y-3">
                <div v-if="customer.taxId" class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <div>
                    <div class="font-medium">Tax ID</div>
                    <div class="text-gray-600">{{ customer.taxId }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 10V11m0 10v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2z"></path>
                  </svg>
                  <div>
                    <div class="font-medium">Status</div>
                    <div class="badge" :class="getStatusClass(customer.status)">
                      {{ customer.status }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <div class="font-medium">Last Updated</div>
                    <div class="text-gray-600">{{ formatDate(customer.updatedAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-base-100 rounded-lg shadow-lg">
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
          <div class="flex flex-wrap gap-4">
            <NuxtLink 
              :to="`/invoices/create?customer=${customer.id}`" 
              class="btn btn-outline btn-sm"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Create Invoice
            </NuxtLink>
            
            <button @click="contactCustomer" class="btn btn-outline btn-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              Contact
            </button>

            <NuxtLink :to="`/customers/${customer.id}/edit`" class="btn btn-outline btn-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Customer
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const authStore = useAuthStore()

const customerId = route.params.id as string

const customer = ref(null)
const loading = ref(true)
const error = ref('')

const fetchCustomer = async () => {
  try {
    const response = await $fetch(`/api/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    customer.value = response
  } catch (err: any) {
    console.error('Error fetching customer:', err)
    error.value = 'Failed to load customer details'
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'badge-success'
    case 'inactive':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const contactCustomer = () => {
  if (customer.value?.tel) {
    window.open(`tel:${customer.value.tel}`)
  }
}

onMounted(() => {
  fetchCustomer()
})

useHead(() => ({
  title: customer.value ? `${customer.value.name} - Customer Details` : 'Customer Details - Manager'
}))
</script>