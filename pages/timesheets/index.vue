<template>
  <div class="container mx-auto px-4 py-8 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold">Timesheets</h1>
        <p class="text-base-content/70 mt-2">Track your daily tasks and time</p>
      </div>
      <div class="flex gap-4">
        <!-- Week Navigation -->
        <div class="flex items-center gap-2">
          <button 
            @click="navigateWeek(-1)" 
            class="btn btn-ghost btn-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
          <span class="text-lg font-semibold">{{ currentWeekText }}</span>
          <button 
            @click="navigateWeek(1)" 
            class="btn btn-ghost btn-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
        <button @click="goToToday" class="btn btn-outline btn-sm">Today</button>
        <!-- <NuxtLink to="/timesheets/hr" class="btn btn-primary btn-sm">HR View</NuxtLink> -->
      </div>
    </div>

    <!-- Timesheet Summary Cards -->
    <TimesheetsTimesheetSummaryCards :employee-id="authStore.user?.id" class="mb-8" />

    <!-- Calendar Grid -->
    <div class="bg-base-100 rounded-lg shadow-lg overflow-hidden">
      <!-- Calendar Header -->
      <div class="grid grid-cols-7 bg-base-200">
        <div 
          v-for="day in weekDays" 
          :key="day"
          class="p-4 text-center font-semibold border-r border-base-300 last:border-r-0"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar Body -->
      <div class="grid grid-cols-7 min-h-[600px]">
        <div 
          v-for="date in currentWeekDates" 
          :key="date"
          class="border-r border-base-300 last:border-r-0 border-b border-base-300"
          :class="{ 
            'bg-primary/10': isToday(date),
            'bg-base-200': isWeekend(date)
          }"
        >
          <!-- Date Header -->
          <div class="p-3 border-b border-base-300">
            <div class="flex justify-between items-center">
              <span 
                class="text-lg font-semibold"
                :class="{ 
                  'text-primary': isToday(date),
                  'text-base-content/50': isWeekend(date)
                }"
              >
                {{ formatDateNumber(date) }}
              </span>
              <button 
                @click="addTask(date)"
                class="btn btn-ghost btn-xs hover:text-primary"
                :disabled="isWeekend(date)"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
            </div>
            <div class="text-sm text-base-content/70 mt-1">
              {{ getDayTotalHours(date) }}h • {{ getTasksForDate(date).length }} tasks
            </div>
          </div>
          
          <!-- Tasks List -->
          <div class="p-2 space-y-2 min-h-[400px]" v-if="!isWeekend(date)">
            <div 
              v-for="(task, index) in getTasksForDate(date)" 
              :key="`${date}-${index}-${task.title}`"
              class="task-card p-2 rounded border border-base-300 hover:border-base-content/30 cursor-pointer transition-colors"
              :class="getTaskCardClass(task.category)"
              @click="editTask(date, task)"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-medium truncate">{{ task.title }}</h4>
                  <p class="text-xs text-base-content/70 mt-1" v-if="task.project">{{ task.project }}</p>
                </div>
                <div class="text-xs text-base-content/50 ml-2">
                  {{ task.startTime }} - {{ task.endTime }}
                </div>
              </div>
              <div class="flex justify-between items-center mt-2">
                <div class="flex items-center gap-2">
                  <span 
                    class="badge badge-xs"
                    :class="getCategoryBadgeClass(task.category)"
                  >
                    {{ task.category }}
                  </span>
                </div>
                <span class="text-xs font-medium">{{ formatDuration(task.duration) }}</span>
              </div>
            </div>
            
            <!-- Empty State -->
            <div 
              v-if="getTasksForDate(date).length === 0"
              class="text-center py-8 text-base-content/50"
            >
              <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <p class="text-sm">No tasks logged</p>
              <button 
                @click="addTask(date)"
                class="btn btn-ghost btn-xs mt-2"
              >
                Add Task
              </button>
            </div>
          </div>
          
          <!-- Weekend Message -->
          <div v-else class="p-4 text-center text-base-content/50">
            <svg class="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
            <p class="text-sm">Weekend</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <ModalsTaskModal 
      v-if="showTaskModal"
      :task="selectedTask"
      :date="selectedDate"
      :employee-id="currentUser?.id"
      :employee-name="currentUser?.name"
      @save="handleTaskSave"
      @save-and-add-another="handleTaskSaveAndAddAnother"
      @delete="handleTaskDelete"
      @close="closeTaskModal"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useTimesheetsStore } from '~/stores/timesheets'
import { useAuthStore } from '~/stores/auth'

// Check authentication

const timesheetsStore = useTimesheetsStore()
const authStore = useAuthStore()
const { getCurrentDate, isToday: isDateToday } = useSSRSafeDate()
const { timesheetsByDate, totalWeekHours, currentWeekTimesheets } = storeToRefs(timesheetsStore)
const { user: currentUser } = storeToRefs(authStore)

// Check authentication
if (!authStore.isAuthenticated) {
  await navigateTo('/login')
}

// Reactive data
const selectedDate = ref('')
const showTaskModal = ref(false)
const selectedTask = ref(null)
const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Date will be initialized in the main onMounted hook

// Computed properties
const currentWeekDates = computed(() => {
  return getCurrentWeekDates(selectedDate.value)
})

const currentWeekText = computed(() => {
  const dates = currentWeekDates.value
  if (!dates || dates.length === 0) {
    return 'No dates available'
  }
  
  const startDate = new Date(dates[0])
  const endDate = new Date(dates[6])
  
  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid dates'
  }
  
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' })
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`
  } else {
    return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${startDate.getFullYear()}`
  }
})


const daysWithEntries = computed(() => {
  return currentWeekTimesheets.value.length
})

const totalWeekTasks = computed(() => {
  return currentWeekTimesheets.value.reduce((total, timesheet) => 
    total + timesheet.tasks.length, 0
  )
})

// Methods
const getCurrentWeekDates = (selectedDate: string): string[] => {
  // Handle empty or invalid date
  if (!selectedDate) {
    return []
  }
  
  const date = new Date(selectedDate)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date provided to getCurrentWeekDates:', selectedDate)
    return []
  }
  
  const currentDay = date.getDay()
  const startOfWeek = new Date(date)
  
  startOfWeek.setDate(date.getDate() - currentDay)
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek)
    weekDate.setDate(startOfWeek.getDate() + i)
    
    // Additional safety check for each week date
    if (!isNaN(weekDate.getTime())) {
      weekDates.push(weekDate.toISOString().split('T')[0])
    }
  }
  
  return weekDates
}

const navigateWeek = (direction: number) => {
  if (!selectedDate.value) return
  
  const currentDate = new Date(selectedDate.value)
  if (isNaN(currentDate.getTime())) {
    console.warn('Invalid date in navigateWeek:', selectedDate.value)
    return
  }
  
  currentDate.setDate(currentDate.getDate() + (direction * 7))
  selectedDate.value = currentDate.toISOString().split('T')[0]
  timesheetsStore.setSelectedDate(selectedDate.value)
  loadWeekData()
}

const goToToday = () => {
  const today = getCurrentDate()
  if (today) {
    selectedDate.value = today
    timesheetsStore.setSelectedDate(selectedDate.value)
    loadWeekData()
  }
}

const isToday = (date: string) => {
  return isDateToday(date)
}

const isWeekend = (date: string) => {
  if (!date) return false
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return false
  const day = dateObj.getDay()
  return day === 0 || day === 6
}

const formatDateNumber = (date: string) => {
  if (!date) return ''
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  return dateObj.getDate()
}

const getTasksForDate = (date: string) => {
  const timesheet = timesheetsStore.getTimesheetByDate(date)
  return timesheet ? timesheet.tasks : []
}

const getDayTotalHours = (date: string) => {
  const timesheet = timesheetsStore.getTimesheetByDate(date)
  return timesheet ? timesheet.totalHours.toFixed(1) : '0.0'
}

const addTask = (date: string) => {
  selectedDate.value = date
  selectedTask.value = null
  showTaskModal.value = true
}

const editTask = (date: string, task: any) => {
  selectedDate.value = date
  selectedTask.value = task
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  selectedTask.value = null
}

const handleTaskSave = async (taskData: any) => {
  try {
    await saveTaskData(taskData)
    closeTaskModal()
  } catch (error) {
    console.error('Error saving task:', error)
  }
}

const handleTaskSaveAndAddAnother = async (taskData: any) => {
  try {
    await saveTaskData(taskData)
    // Reset form for new task but keep modal open
    selectedTask.value = null
    // Optional: auto-increment time for next task
    const endTime = taskData.endTime
    if (endTime) {
      // You could set a default start time for the next task
      // This would be enhanced based on your specific needs
    }
  } catch (error) {
    console.error('Error saving task:', error)
  }
}

const saveTaskData = async (taskData: any) => {
  const timesheet = timesheetsStore.getTimesheetByDate(selectedDate.value)
  
  if (timesheet) {
    // Update existing timesheet
    const tasks = [...timesheet.tasks]
    if (selectedTask.value) {
      // Edit existing task
      const taskIndex = tasks.findIndex(t => t === selectedTask.value)
      if (taskIndex !== -1) {
        tasks[taskIndex] = taskData
      }
    } else {
      // Add new task
      tasks.push(taskData)
    }
    
    await timesheetsStore.updateTimesheet(timesheet.id, { tasks })
  } else {
    // Create new timesheet
    await timesheetsStore.createTimesheet({
      employeeId: currentUser.value?.id,
      employeeName: currentUser.value?.name,
      date: selectedDate.value,
      tasks: [taskData]
    })
  }
}

const handleTaskDelete = async () => {
  try {
    const timesheet = timesheetsStore.getTimesheetByDate(selectedDate.value)
    
    if (timesheet && selectedTask.value) {
      const tasks = timesheet.tasks.filter(t => t !== selectedTask.value)
      
      if (tasks.length > 0) {
        await timesheetsStore.updateTimesheet(timesheet.id, { tasks })
      } else {
        await timesheetsStore.deleteTimesheet(timesheet.id)
      }
    }
    
    closeTaskModal()
  } catch (error) {
    console.error('Error deleting task:', error)
  }
}

const getTaskCardClass = (category: string) => {
  const classes = {
    development: 'border-l-4 border-l-blue-500 bg-blue-900',
    meeting: 'border-l-4 border-l-purple-500 bg-purple-900',
    training: 'border-l-4 border-l-green-500 bg-green-900',
    support: 'border-l-4 border-l-orange-500 bg-orange-900',
    admin: 'border-l-4 border-l-neutral bg-base-200',
    other: 'border-l-4 border-l-yellow-500 bg-yellow-900'
  }
  return classes[category] || classes.other
}

const getCategoryBadgeClass = (category: string) => {
  const classes = {
    development: 'badge-info',
    meeting: 'badge-primary',
    training: 'badge-success',
    support: 'badge-warning',
    admin: 'badge-neutral',
    other: 'badge-accent'
  }
  return classes[category] || classes.other
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

const loadWeekData = async () => {
  if (currentUser.value?.id) {
    const weekDates = currentWeekDates.value
    await timesheetsStore.fetchEmployeeTimesheets(
      currentUser.value.id,
      weekDates[0],
      weekDates[6]
    )
  }
}

// Load data on mount
onMounted(async () => {
  // Ensure we have a selected date before loading data
  if (!selectedDate.value) {
    const currentDate = getCurrentDate()
    if (currentDate) {
      selectedDate.value = currentDate
      timesheetsStore.setSelectedDate(selectedDate.value)
    } else {
      // Fallback to current date if SSR safe date returns empty
      selectedDate.value = new Date().toISOString().split('T')[0]
      timesheetsStore.setSelectedDate(selectedDate.value)
    }
  }
  
  // Validate the selected date before proceeding
  const testDate = new Date(selectedDate.value)
  if (isNaN(testDate.getTime())) {
    console.warn('Invalid selectedDate detected, resetting to today')
    selectedDate.value = new Date().toISOString().split('T')[0]
    timesheetsStore.setSelectedDate(selectedDate.value)
  }
  
  await loadWeekData()
})

// Watch for date changes
watch(selectedDate, () => {
  timesheetsStore.setSelectedDate(selectedDate.value)
})

// Set page title
useHead({
  title: 'Timesheets - Manager'
})
</script>

<style scoped>
.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>