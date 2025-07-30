<template>
  <div class="container mx-auto px-4 py-8 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">
          {{ isEditing ? 'Edit Leave Request' : 'Request Leave' }}
        </h1>
        <p class="text-base-content/70 mt-2">
          {{ isEditing ? 'Update your leave request details' : 'Submit a new leave request' }}
        </p>
      </div>
      <NuxtLink to="/leaves" class="btn btn-outline">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to Leaves
      </NuxtLink>
    </div>

    <!-- Leave Balance Summary -->
    <div v-if="leavesStore.currentBalance && !isEditing" class="bg-base-100 rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Your Leave Balance</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div v-for="(balance, type) in leavesStore.currentBalance.leaveBalances" :key="type" class="text-center">
          <div class="text-2xl font-bold text-primary">{{ balance.remaining }}</div>
          <div class="text-sm text-base-content/50 capitalize">{{ type }}</div>
        </div>
      </div>
    </div>

    <!-- Leave Request Form -->
    <div class="bg-base-100 rounded-lg p-6">
      <form @submit.prevent="submitRequest" class="space-y-6">
        <!-- Leave Type -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-base-content/70">Leave Type *</span>
          </label>
          <select 
            v-model="form.leaveType" 
            class="select select-bordered w-full"
            :class="{ 'select-error': errors.leaveType }"
            required
          >
            <option value="">Select leave type</option>
            <option v-for="type in leavesStore.leaveTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
          <label v-if="errors.leaveType" class="label">
            <span class="label-text-alt text-red-400">{{ errors.leaveType }}</span>
          </label>
        </div>

        <!-- Half Day Option -->
        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-4">
            <input 
              type="checkbox" 
              v-model="form.isHalfDay" 
              class="checkbox checkbox-primary"
              @change="updateDates"
            />
            <span class="label-text text-base-content/70">Half Day Leave</span>
          </label>
        </div>

        <!-- Half Day Period -->
        <div v-if="form.isHalfDay" class="form-control">
          <label class="label">
            <span class="label-text text-base-content/70">Half Day Period *</span>
          </label>
          <div class="flex gap-4">
            <label class="label cursor-pointer justify-start gap-2">
              <input 
                type="radio" 
                name="halfDayPeriod" 
                value="morning" 
                v-model="form.halfDayPeriod"
                class="radio radio-primary"
              />
              <span class="label-text text-base-content/70">Morning</span>
            </label>
            <label class="label cursor-pointer justify-start gap-2">
              <input 
                type="radio" 
                name="halfDayPeriod" 
                value="afternoon" 
                v-model="form.halfDayPeriod"
                class="radio radio-primary"
              />
              <span class="label-text text-base-content/70">Afternoon</span>
            </label>
          </div>
        </div>

        <!-- Date Range -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-control">
            <BaseInputDate
              v-model="form.startDate"
              label="Start Date"
              :required="true"
              :disabled="false"
              :error-message="errors.startDate"
              @change="updateDates"
            />
          </div>

          <div class="form-control">
            <BaseInputDate
              v-model="form.endDate"
              label="End Date"
              :required="!form.isHalfDay"
              :disabled="form.isHalfDay"
              :error-message="errors.endDate"
              @change="updateDates"
            />
          </div>
        </div>

        <!-- Total Days Display -->
        <div v-if="totalDays > 0" class="bg-base-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <span class="text-base-content/70">Total Leave Days:</span>
            <span class="text-xl font-bold text-primary">
              {{ totalDays }} {{ totalDays === 1 ? 'day' : 'days' }}
            </span>
          </div>
          
          <!-- Balance Check -->
          <div v-if="form.leaveType && leavesStore.currentBalance && form.leaveType !== 'unpaid'" class="mt-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-base-content/50">Available Balance:</span>
              <span 
                :class="hasEnoughBalance ? 'text-green-400' : 'text-red-400'"
              >
                {{ getAvailableBalance() }} days
              </span>
            </div>
            <div v-if="!hasEnoughBalance" class="alert alert-warning mt-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-4.938 4.938A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 2.136-.67 4.116-1.812 5.938L12 12l8.062 8.062z"></path>
              </svg>
              <span>Insufficient leave balance for this request</span>
            </div>
          </div>
        </div>

        <!-- Reason -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-base-content/70">Reason for Leave *</span>
          </label>
          <textarea 
            v-model="form.reason"
            class="textarea textarea-bordered h-32"
            :class="{ 'textarea-error': errors.reason }"
            placeholder="Please provide a detailed reason for your leave request..."
            maxlength="500"
            required
          ></textarea>
          <label class="label">
            <span class="label-text-alt text-base-content/50">{{ form.reason.length }}/500 characters</span>
            <span v-if="errors.reason" class="label-text-alt text-red-400">{{ errors.reason }}</span>
          </label>
        </div>

        <!-- Emergency Contact -->
        <div class="form-control">
          <label class="label">
            <span class="label-text text-base-content/70">Emergency Contact</span>
          </label>
          <input 
            type="text" 
            v-model="form.emergencyContact"
            class="input input-bordered"
            placeholder="Emergency contact name and phone number"
          />
          <label class="label">
            <span class="label-text-alt text-base-content/50">Optional - Recommended for longer leaves</span>
          </label>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-4 pt-6">
          <NuxtLink to="/leaves" class="btn btn-ghost">
            Cancel
          </NuxtLink>
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="!isFormValid || leavesStore.loading"
          >
            <span v-if="leavesStore.loading" class="loading loading-spinner loading-sm"></span>
            {{ isEditing ? 'Update Request' : 'Submit Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLeavesStore } from '~/stores/leaves'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const leavesStore = useLeavesStore()
const authStore = useAuthStore()
const route = useRoute()

// Check if editing
const isEditing = computed(() => !!route.query.edit)
const editId = computed(() => route.query.edit as string)

// Form data
const form = reactive({
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: '',
  isHalfDay: false,
  halfDayPeriod: 'morning',
  emergencyContact: ''
})

// Form validation
const errors = reactive({
  leaveType: '',
  startDate: '',
  endDate: '',
  reason: ''
})

// Computed properties
const totalDays = computed(() => {
  if (!form.startDate || !form.endDate) return 0
  
  if (form.isHalfDay) return 0.5
  
  const start = new Date(form.startDate)
  const end = new Date(form.endDate)
  const timeDiff = end.getTime() - start.getTime()
  return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1)
})

const hasEnoughBalance = computed(() => {
  if (!form.leaveType || form.leaveType === 'unpaid' || !leavesStore.currentBalance) return true
  
  const balance = leavesStore.currentBalance.leaveBalances[form.leaveType as keyof typeof leavesStore.currentBalance.leaveBalances]
  return balance ? balance.remaining >= totalDays.value : false
})

const isFormValid = computed(() => {
  return form.leaveType && 
         form.startDate && 
         (form.isHalfDay || form.endDate) && 
         form.reason.trim() && 
         totalDays.value > 0 &&
         (!form.isHalfDay || form.halfDayPeriod) &&
         (form.leaveType === 'unpaid' || hasEnoughBalance.value)
})

// Methods
const updateDates = () => {
  if (form.isHalfDay) {
    // For half day, set end date same as start date
    form.endDate = form.startDate
  }
  validateDates()
}

const validateDates = () => {
  errors.startDate = ''
  errors.endDate = ''
  
  if (!form.startDate) return
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const startDate = new Date(form.startDate)
  
  if (startDate < today) {
    errors.startDate = 'Start date cannot be in the past'
  }
  
  // Only validate end date if it's not half day and end date exists
  if (!form.isHalfDay && form.endDate) {
    const endDate = new Date(form.endDate)
    
    if (endDate < startDate) {
      errors.endDate = 'End date cannot be before start date'
    }
  }
}

const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  // Validate required fields
  if (!form.leaveType) errors.leaveType = 'Please select a leave type'
  if (!form.startDate) errors.startDate = 'Start date is required'
  // Only require end date if it's not half day
  if (!form.isHalfDay && !form.endDate) errors.endDate = 'End date is required'
  if (!form.reason.trim()) errors.reason = 'Reason is required'
  
  // For half day, validate that half day period is selected
  if (form.isHalfDay && !form.halfDayPeriod) {
    errors.startDate = 'Please select half day period'
  }
  
  // Validate dates only if we have the required dates
  if (form.startDate && (form.isHalfDay || form.endDate)) {
    validateDates()
  }
  
  // Check leave balance
  if (form.leaveType && form.leaveType !== 'unpaid' && !hasEnoughBalance.value) {
    errors.leaveType = 'Insufficient leave balance for this request'
  }
  
  return !Object.values(errors).some(error => error)
}

const getAvailableBalance = () => {
  if (!form.leaveType || !leavesStore.currentBalance) return 0
  
  const balance = leavesStore.currentBalance.leaveBalances[form.leaveType as keyof typeof leavesStore.currentBalance.leaveBalances]
  return balance ? balance.remaining : 0
}

const submitRequest = async () => {
  if (!validateForm()) return
  
  const modal = useModal()
  
  try {
    const requestData = {
      leaveType: form.leaveType,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
      isHalfDay: form.isHalfDay,
      halfDayPeriod: form.isHalfDay ? form.halfDayPeriod : undefined,
      emergencyContact: form.emergencyContact.trim() || undefined
    }
    
    if (isEditing.value) {
      await leavesStore.updateLeave(editId.value, requestData)
      
      await modal.showAlert({
        title: 'Success',
        message: 'Leave request updated successfully',
        type: 'success'
      })
    } else {
      await leavesStore.createLeave(requestData)
      
      await modal.showAlert({
        title: 'Success',
        message: 'Leave request submitted successfully',
        type: 'success'
      })
    }
    
    navigateTo('/leaves')
  } catch (error: any) {
    await modal.showAlert({
      title: 'Error',
      message: error.message || 'Failed to submit leave request',
      type: 'error'
    })
  }
}

// Load data on mount
onMounted(async () => {
  await leavesStore.fetchLeaveBalances()
  
  // If editing, load the leave data
  if (isEditing.value) {
    try {
      const leave = await leavesStore.fetchLeave(editId.value)
      
      // Populate form with existing data
      form.leaveType = leave.leaveType
      form.startDate = leave.startDate
      form.endDate = leave.endDate
      form.reason = leave.reason
      form.isHalfDay = leave.isHalfDay
      form.halfDayPeriod = leave.halfDayPeriod || 'morning'
      form.emergencyContact = leave.emergencyContact || ''
    } catch (error) {
      const modal = useModal()
      await modal.showAlert({
        title: 'Error',
        message: 'Failed to load leave request details',
        type: 'error'
      })
      navigateTo('/leaves')
    }
  }
})

// Set page title
useHead({
  title: computed(() => isEditing.value ? 'Edit Leave Request - Manager' : 'Request Leave - Manager')
})
</script>

<style scoped>
.alert {
  @apply border border-current;
}
</style>