<template>
  <div class="flex items-center justify-between px-4 py-3 sm:px-6">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        @click="goToPreviousPage"
        :disabled="(currentPage ?? 1) === 1"
        class="btn btn-outline btn-sm"
        :class="{ 'btn-disabled': (currentPage ?? 1) === 1 }"
      >
        Previous
      </button>
      <button
        @click="goToNextPage"
        :disabled="(currentPage ?? 1) === (totalPages ?? 1)"
        class="btn btn-outline btn-sm"
        :class="{ 'btn-disabled': (currentPage ?? 1) === (totalPages ?? 1) }"
      >
        Next
      </button>
    </div>
    
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div class="flex items-center gap-2">
        <p class="text-sm text-base-content/70">
          Showing
          <span class="font-medium">{{ startItem }}</span>
          to
          <span class="font-medium">{{ endItem }}</span>
          of
          <span class="font-medium">{{ totalItems }}</span>
          results
        </p>
        
        <div class="flex items-center gap-2 ml-4">
          <span class="text-sm text-base-content/70">Per page:</span>
          <select
            v-model="selectedPageSize"
            @change="handlePageSizeChange"
            class="select select-bordered select-sm"
          >
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
          <!-- Previous button -->
          <button
            @click="goToPreviousPage"
            :disabled="(currentPage ?? 1) === 1"
            class="btn btn-outline btn-sm"
            :class="{ 'btn-disabled': (currentPage ?? 1) === 1 }"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <!-- Page numbers -->
          <template v-for="page in visiblePages" :key="page">
            <button
              v-if="page !== '...'"
              @click="goToPage(page)"
              :class="page === (currentPage ?? 1) ? 'btn-active' : ''"
              class="btn btn-outline btn-sm"
            >
              {{ page }}
            </button>
            <span v-else class="px-3 py-2 text-sm text-base-content/70">
              ...
            </span>
          </template>
          
          <!-- Next button -->
          <button
            @click="goToNextPage"
            :disabled="(currentPage ?? 1) === (totalPages ?? 1)"
            class="btn btn-outline btn-sm"
            :class="{ 'btn-disabled': (currentPage ?? 1) === (totalPages ?? 1) }"
          >
            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageSizeOptions?: number[]
  maxVisiblePages?: number
}

interface Emits {
  (e: 'update:currentPage', page: number): void
  (e: 'update:pageSize', size: number): void
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
  maxVisiblePages: 7
})

const emit = defineEmits<Emits>()

const selectedPageSize = ref(props.pageSize)

const startItem = computed(() => {
  const totalItems = props.totalItems ?? 0
  const currentPage = props.currentPage ?? 1
  const pageSize = props.pageSize ?? 10
  
  if (totalItems === 0) return 0
  return (currentPage - 1) * pageSize + 1
})

const endItem = computed(() => {
  const totalItems = props.totalItems ?? 0
  const currentPage = props.currentPage ?? 1
  const pageSize = props.pageSize ?? 10
  
  if (totalItems === 0) return 0
  return Math.min(currentPage * pageSize, totalItems)
})

const visiblePages = computed(() => {
  const pages = []
  const currentPage = props.currentPage ?? 1
  const totalPages = props.totalPages ?? 1
  const maxVisiblePages = props.maxVisiblePages ?? 7
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    const halfWindow = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, currentPage - halfWindow)
    let end = Math.min(totalPages, currentPage + halfWindow)
    
    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1)
      } else {
        start = Math.max(1, end - maxVisiblePages + 1)
      }
    }
    
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
  }
  
  return pages
})

const goToPage = (page: number) => {
  const currentPage = props.currentPage ?? 1
  const totalPages = props.totalPages ?? 1
  if (page >= 1 && page <= totalPages && page !== currentPage) {
    emit('update:currentPage', page)
  }
}

const goToPreviousPage = () => {
  const currentPage = props.currentPage ?? 1
  if (currentPage > 1) {
    emit('update:currentPage', currentPage - 1)
  }
}

const goToNextPage = () => {
  const currentPage = props.currentPage ?? 1
  const totalPages = props.totalPages ?? 1
  if (currentPage < totalPages) {
    emit('update:currentPage', currentPage + 1)
  }
}

const handlePageSizeChange = () => {
  emit('update:pageSize', selectedPageSize.value)
  emit('update:currentPage', 1)
}

watch(() => props.pageSize, (newSize) => {
  selectedPageSize.value = newSize
})
</script>