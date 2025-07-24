<template>
  <div class="container mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Customers</h1>
      <NuxtLink to="/customers/new" class="btn btn-primary">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Customer
      </NuxtLink>
    </div>

    <div class="card bg-base-100 shadow-lg">
      <div class="card-body">
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          <div class="form-control flex-1">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search customers..." 
              class="input input-bordered w-full"
              @input="debouncedSearch"
            />
          </div>
          
          <div class="form-control lg:w-32">
            <select v-model="selectedStatus" class="select select-bordered" @change="applyFilters">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <button @click="clearFilters" class="btn btn-ghost">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
          <div class="loading loading-spinner loading-lg"></div>
        </div>

        <div v-else-if="error" class="alert alert-error">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{{ error }}</span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Tax ID</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in paginatedCustomers" :key="customer.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="bg-neutral text-neutral-content rounded-full w-12">
                        <span class="text-lg">{{ getInitials(customer.name) }}</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">{{ customer.name }}</div>
                      <div class="text-sm opacity-50 truncate max-w-xs">{{ customer.address }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="font-medium">{{ customer.tel }}</div>
                    <div class="text-sm opacity-50">{{ customer.email || 'No email' }}</div>
                  </div>
                </td>
                <td>{{ customer.taxId || 'N/A' }}</td>
                <td>
                  <div class="badge" :class="getStatusClass(customer.status)">
                    {{ customer.status }}
                  </div>
                </td>
                <td>{{ formatDate(customer.createdAt) }}</td>
                <td>
                  <div class="flex gap-2">
                    <NuxtLink :to="`/customers/${customer.id}`" class="btn btn-ghost btn-xs" title="View">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </NuxtLink>
                    
                    <NuxtLink :to="`/customers/${customer.id}/edit`" class="btn btn-ghost btn-xs" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </NuxtLink>
                    
                    <button @click="deleteCustomer(customer)" class="btn btn-ghost btn-xs text-error" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <BasePagination
          :currentPage="pagination.currentPage.value"
          :totalPages="pagination.totalPages.value"
          :totalItems="pagination.totalItems.value"
          :pageSize="pagination.pageSize.value"
          @update:currentPage="handlePageChange"
          @update:pageSize="handlePageSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()

const customers = ref([])
const loading = ref(false)
const error = ref('')

const searchQuery = ref('')
const selectedStatus = ref('')

const pagination = usePagination(10)

const filteredCustomers = computed(() => {
  let result = customers.value

  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = result.filter(customer =>
      customer.name.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.tel.toLowerCase().includes(search) ||
      customer.address.toLowerCase().includes(search) ||
      customer.taxId?.toLowerCase().includes(search)
    )
  }

  if (selectedStatus.value) {
    result = result.filter(customer => customer.status === selectedStatus.value)
  }

  return result
})

const paginatedCustomers = computed(() => {
  const start = (pagination.currentPage.value - 1) * pagination.pageSize.value
  const end = start + pagination.pageSize.value
  return filteredCustomers.value.slice(start, end)
})

watch(filteredCustomers, (newCustomers) => {
  pagination.totalItems.value = newCustomers.length
  pagination.totalPages.value = Math.ceil(newCustomers.length / pagination.pageSize.value)
  
  if (pagination.currentPage.value > pagination.totalPages.value && pagination.totalPages.value > 0) {
    pagination.currentPage.value = 1
  }
}, { immediate: true })

const debouncedSearch = debounce(() => {
  applyFilters()
}, 300)

const applyFilters = () => {
  pagination.currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  pagination.currentPage.value = 1
}

const handlePageChange = (page) => {
  pagination.goToPage(page)
}

const handlePageSizeChange = (size) => {
  pagination.changePageSize(size)
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'badge-success'
    case 'inactive':
      return 'badge-warning'
    default:
      return 'badge-neutral'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const fetchCustomers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/customers', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    customers.value = response || []
  } catch (err) {
    console.error('Error fetching customers:', err)
    error.value = 'Failed to fetch customers'
  } finally {
    loading.value = false
  }
}

const deleteCustomer = async (customer) => {
  const modal = useModal()
  
  const confirmed = await modal.showConfirm({
    title: 'Delete Customer',
    message: `Are you sure you want to delete ${customer.name}?`,
    type: 'danger',
    confirmText: 'Delete'
  })
  
  if (confirmed) {
    try {
      await $fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      
      await fetchCustomers()
      
      await modal.showAlert({
        title: 'Success',
        message: 'Customer deleted successfully',
        type: 'success'
      })
    } catch (err) {
      console.error('Error deleting customer:', err)
      await modal.showAlert({
        title: 'Error',
        message: 'Failed to delete customer',
        type: 'error'
      })
    }
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

onMounted(async () => {
  await fetchCustomers()
})

useHead({
  title: 'Customers - Manager'
})
</script>