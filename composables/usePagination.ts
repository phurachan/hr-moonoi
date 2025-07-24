export interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PaginationResponse {
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export const usePagination = (initialPageSize: number = 10) => {
  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)
  const totalItems = ref(0)
  const totalPages = ref(0)
  const loading = ref(false)

  const paginationState = computed<PaginationState>(() => ({
    currentPage: currentPage.value,
    pageSize: pageSize.value,
    totalItems: totalItems.value,
    totalPages: totalPages.value
  }))

  const updatePagination = (response: PaginationResponse) => {
    if (response.pagination) {
      currentPage.value = response.pagination.page
      pageSize.value = response.pagination.limit
      totalItems.value = response.pagination.total
      totalPages.value = response.pagination.pages
    }
  }

  const resetPagination = () => {
    currentPage.value = 1
    totalItems.value = 0
    totalPages.value = 0
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const changePageSize = (size: number) => {
    pageSize.value = size
    currentPage.value = 1
  }

  const getPaginationParams = () => {
    return {
      page: currentPage.value,
      limit: pageSize.value
    }
  }

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  const startItem = computed(() => {
    return (currentPage.value - 1) * pageSize.value + 1
  })

  const endItem = computed(() => {
    return Math.min(currentPage.value * pageSize.value, totalItems.value)
  })

  return {
    // State
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    loading,
    paginationState,
    
    // Computed
    hasNextPage,
    hasPreviousPage,
    startItem,
    endItem,
    
    // Methods
    updatePagination,
    resetPagination,
    goToPage,
    changePageSize,
    getPaginationParams
  }
}