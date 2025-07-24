<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
      <span v-if="required" class="label-text-alt text-error">*</span>
    </label>
    
    <div ref="datePickerRef" class="relative">
      <!-- Input Field -->
      <input
        ref="inputRef"
        :id="inputId"
        :name="name"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        type="text"
        class="input input-bordered w-full"
        :class="inputClasses"
        readonly
        @click="handleInputClick"
        @focus="handleInputFocus"
      />
      
      <!-- Calendar Icon -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
      
      <!-- Calendar Dropdown -->
      <div v-if="showCalendar" class="absolute top-full left-0 mt-2 bg-base-100 border border-base-300 rounded-box shadow-lg z-50 p-4">
        <div class="calendar-container">
          <!-- Calendar Header -->
          <div class="flex items-center justify-between mb-4">
            <button
              type="button"
              class="btn btn-ghost btn-sm btn-circle"
              @click="previousMonth"
              :disabled="disabled"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="flex items-center gap-2">
              <select
                v-model="currentMonth"
                class="select select-bordered select-sm"
                :disabled="disabled"
                @change="updateCalendar"
              >
                <option v-for="(month, index) in months" :key="index" :value="index">
                  {{ month }}
                </option>
              </select>
              
              <select
                v-model="currentYear"
                class="select select-bordered select-sm"
                :disabled="disabled"
                @change="updateCalendar"
              >
                <option v-for="year in availableYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            
            <button
              type="button"
              class="btn btn-ghost btn-sm btn-circle"
              @click="nextMonth"
              :disabled="disabled"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-1 text-center text-xs">
            <!-- Day Headers -->
            <div v-for="day in dayHeaders" :key="day" class="p-2 font-medium text-base-content/70">
              {{ day }}
            </div>
            
            <!-- Calendar Days -->
            <button
              v-for="day in calendarDays"
              :key="`${day.date}-${day.isCurrentMonth}`"
              type="button"
              class="btn btn-ghost btn-sm h-8 w-8 p-0 text-xs"
              :class="getDayClasses(day)"
              :disabled="disabled || !day.isCurrentMonth || !isDateSelectable(day.date)"
              @click="selectDate(day.date)"
            >
              {{ day.day }}
            </button>
          </div>
          
          <!-- Calendar Footer -->
          <div class="flex justify-between items-center mt-4 pt-3 border-t border-base-300">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              @click="selectToday"
              :disabled="disabled"
            >
              Today
            </button>
            
            <div class="flex gap-2">
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                @click="clearDate"
                :disabled="disabled"
              >
                Clear
              </button>
              
              <button
                type="button"
                class="btn btn-primary btn-sm"
                @click="closeCalendar"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Error Message -->
    <label v-if="errorMessage" class="label">
      <span class="label-text-alt text-error">{{ errorMessage }}</span>
    </label>
    
    <!-- Help Text -->
    <label v-if="helpText && !errorMessage" class="label">
      <span class="label-text-alt text-base-content/70">{{ helpText }}</span>
    </label>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Date],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select date'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'secondary', 'accent', 'success', 'warning', 'error'].includes(value)
  },
  minDate: {
    type: [String, Date],
    default: null
  },
  maxDate: {
    type: [String, Date],
    default: null
  },
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    default: 'YYYY-MM-DD'
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Reactive state
const showCalendar = ref(false)
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const inputRef = ref(null)
const datePickerRef = ref(null)

// Computed properties
const inputId = computed(() => props.name || `date-input-${Math.random().toString(36).substr(2, 9)}`)

const selectedDate = computed(() => {
  if (!props.modelValue) return null
  return props.modelValue instanceof Date ? props.modelValue : new Date(props.modelValue)
})

const displayValue = computed(() => {
  if (!selectedDate.value) return ''
  return selectedDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

const inputClasses = computed(() => {
  const classes = []
  
  // Size classes
  if (props.size === 'xs') classes.push('input-xs')
  else if (props.size === 'sm') classes.push('input-sm')
  else if (props.size === 'lg') classes.push('input-lg')
  
  // Variant classes
  if (props.variant === 'primary') classes.push('input-primary')
  else if (props.variant === 'secondary') classes.push('input-secondary')
  else if (props.variant === 'accent') classes.push('input-accent')
  else if (props.variant === 'success') classes.push('input-success')
  else if (props.variant === 'warning') classes.push('input-warning')
  else if (props.variant === 'error') classes.push('input-error')
  
  // Error state
  if (props.errorMessage) classes.push('input-error')
  
  // Disabled state
  if (props.disabled) classes.push('input-disabled')
  
  return classes.join(' ')
})

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 100; i <= currentYear + 50; i++) {
    years.push(i)
  }
  return years
})

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const currentDate = new Date(startDate)
  
  // Generate 6 weeks of days
  for (let i = 0; i < 42; i++) {
    days.push({
      date: new Date(currentDate),
      day: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === currentMonth.value,
      isToday: isSameDay(currentDate, new Date()),
      isSelected: selectedDate.value && isSameDay(currentDate, selectedDate.value)
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return days
})

// Methods
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const isDateSelectable = (date) => {
  if (props.minDate) {
    const minDate = props.minDate instanceof Date ? props.minDate : new Date(props.minDate)
    if (date < minDate) return false
  }
  
  if (props.maxDate) {
    const maxDate = props.maxDate instanceof Date ? props.maxDate : new Date(props.maxDate)
    if (date > maxDate) return false
  }
  
  return true
}

const getDayClasses = (day) => {
  const classes = []
  
  if (!day.isCurrentMonth) {
    classes.push('text-base-content/30')
  }
  
  if (day.isToday) {
    classes.push('btn-outline btn-primary')
  }
  
  if (day.isSelected) {
    classes.push('btn-primary')
  }
  
  if (!isDateSelectable(day.date)) {
    classes.push('btn-disabled')
  }
  
  return classes.join(' ')
}

const toggleCalendar = () => {
  if (!props.disabled) {
    showCalendar.value = !showCalendar.value
  }
}

const handleInputClick = (e) => {
  e.preventDefault()
  if (!props.disabled) {
    showCalendar.value = true
  }
}

const handleInputFocus = (e) => {
  if (!props.disabled) {
    showCalendar.value = true
  }
  emit('focus', e)
}

const closeCalendar = () => {
  showCalendar.value = false
}

const selectDate = (date) => {
  if (isDateSelectable(date)) {
    emit('update:modelValue', date)
    emit('change', date)
    closeCalendar()
  }
}

const selectToday = () => {
  const today = new Date()
  if (isDateSelectable(today)) {
    selectDate(today)
  }
}

const clearDate = () => {
  emit('update:modelValue', null)
  emit('change', null)
  closeCalendar()
}

const previousMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const updateCalendar = () => {
  // Calendar will reactively update when currentMonth or currentYear changes
}

// Click outside to close calendar
let clickOutsideHandler = null

onMounted(() => {
  clickOutsideHandler = (e) => {
    // Check if click is inside the date picker component
    const isInsideDatePicker = datePickerRef.value && datePickerRef.value.contains(e.target)
    
    if (!isInsideDatePicker && showCalendar.value) {
      showCalendar.value = false
    }
  }
  
  // Add a slight delay to prevent immediate closing on input focus
  setTimeout(() => {
    document.addEventListener('click', clickOutsideHandler)
  }, 200)
})

onUnmounted(() => {
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler)
  }
})

// Set initial calendar to selected date
watch(selectedDate, (newDate) => {
  if (newDate) {
    currentMonth.value = newDate.getMonth()
    currentYear.value = newDate.getFullYear()
  }
}, { immediate: true })

// Utility methods
const focus = () => {
  showCalendar.value = true
}

const blur = () => {
  showCalendar.value = false
}

const clear = () => {
  clearDate()
}

// Expose methods for parent components
defineExpose({
  focus,
  blur,
  clear
})
</script>

<style scoped>
.calendar-container {
  min-width: 280px;
}

/* Custom scrollbar for year select */
.select::-webkit-scrollbar {
  width: 6px;
}

.select::-webkit-scrollbar-track {
  background: transparent;
}

.select::-webkit-scrollbar-thumb {
  background: oklch(var(--bc) / 0.2);
  border-radius: 3px;
}

.select::-webkit-scrollbar-thumb:hover {
  background: oklch(var(--bc) / 0.3);
}
</style>