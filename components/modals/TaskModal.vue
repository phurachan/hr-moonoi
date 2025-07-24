<template>
  <div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="font-bold text-lg mb-4">
        {{ isEdit ? 'Edit Task' : 'Add New Task' }}
        <span class="text-sm font-normal text-gray-500 ml-2">
          {{ formatDate(date) }}
        </span>
      </h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Task Title -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Task Title *</span>
          </label>
          <input 
            v-model="formData.title"
            type="text" 
            class="input input-bordered"
            :class="{ 'input-error': errors.title }"
            placeholder="What did you work on?"
            required
          />
          <label v-if="errors.title" class="label">
            <span class="label-text-alt text-error">{{ errors.title }}</span>
          </label>
        </div>

        <!-- Task Description -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Description</span>
          </label>
          <textarea 
            v-model="formData.description"
            class="textarea textarea-bordered"
            placeholder="Additional details about the task..."
            rows="3"
          ></textarea>
        </div>

        <!-- Time Range -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Start Time *</span>
            </label>
            <input 
              v-model="formData.startTime"
              type="time" 
              class="input input-bordered"
              :class="{ 'input-error': errors.startTime }"
              required
              @change="calculateDuration"
            />
            <label v-if="errors.startTime" class="label">
              <span class="label-text-alt text-error">{{ errors.startTime }}</span>
            </label>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">End Time *</span>
            </label>
            <input 
              v-model="formData.endTime"
              type="time" 
              class="input input-bordered"
              :class="{ 'input-error': errors.endTime }"
              required
              @change="calculateDuration"
            />
            <label v-if="errors.endTime" class="label">
              <span class="label-text-alt text-error">{{ errors.endTime }}</span>
            </label>
          </div>
        </div>

        <!-- Duration Display -->
        <div v-if="calculatedDuration > 0" class="alert alert-info">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Duration: {{ formatDuration(calculatedDuration) }}</span>
        </div>

        <!-- Project and Category -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Project</span>
            </label>
            <input 
              v-model="formData.project"
              type="text" 
              class="input input-bordered"
              placeholder="Project name"
              list="projects"
            />
            <datalist id="projects">
              <option value="Website Redesign">Website Redesign</option>
              <option value="Mobile App">Mobile App</option>
              <option value="API Development">API Development</option>
              <option value="Database Migration">Database Migration</option>
              <option value="Training Program">Training Program</option>
            </datalist>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Category *</span>
            </label>
            <select 
              v-model="formData.category"
              class="select select-bordered"
              :class="{ 'select-error': errors.category }"
              required
            >
              <option value="">Select Category</option>
              <option value="development">Development</option>
              <option value="meeting">Meeting</option>
              <option value="training">Training</option>
              <option value="support">Support</option>
              <option value="admin">Administrative</option>
              <option value="other">Other</option>
            </select>
            <label v-if="errors.category" class="label">
              <span class="label-text-alt text-error">{{ errors.category }}</span>
            </label>
          </div>
        </div>

        <!-- Overtime Checkbox -->
        <div class="form-control">
          <label class="label cursor-pointer">
            <span class="label-text">Overtime (OT)</span>
            <input 
              v-model="formData.isOT"
              type="checkbox" 
              class="toggle toggle-primary"
            />
          </label>
          <label class="label">
            <span class="label-text-alt text-gray-500">Check if this task was performed during overtime hours</span>
          </label>
        </div>

        <!-- Quick Time Presets -->
        <div class="form-control">
          <label class="label">
            <span class="label-text">Quick Time Presets</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <button 
              type="button"
              v-for="preset in timePresets" 
              :key="preset.label"
              class="btn btn-outline btn-xs"
              @click="applyTimePreset(preset)"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="modal-action">
          <button 
            type="button" 
            class="btn btn-ghost" 
            @click="$emit('close')"
          >
            Cancel
          </button>
          
          <button 
            v-if="isEdit"
            type="button" 
            class="btn btn-error btn-outline" 
            @click="handleDelete"
          >
            Delete Task
          </button>
          
          <button 
            v-if="!isEdit"
            type="button" 
            class="btn btn-outline btn-primary"
            :disabled="!isFormValid"
            @click="handleSaveAndAddAnother"
          >
            Save & Add Another
          </button>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="!isFormValid"
          >
            {{ isEdit ? 'Update' : 'Save' }} Task
          </button>
        </div>
      </form>
    </div>
    
    <!-- Modal backdrop -->
    <div class="modal-backdrop" @click="$emit('close')"></div>
  </div>
</template>

<script setup lang="ts">
interface Task {
  title: string
  description?: string
  startTime: string
  endTime: string
  duration: number
  project?: string
  category: 'development' | 'meeting' | 'training' | 'support' | 'admin' | 'other'
  isOT?: boolean
}

interface TimePreset {
  label: string
  startTime: string
  endTime: string
}

const props = defineProps<{
  task?: Task | null
  date: string
  employeeId: string
  employeeName: string
}>()

const emit = defineEmits<{
  save: [task: Task]
  saveAndAddAnother: [task: Task]
  delete: []
  close: []
}>()

const isEdit = computed(() => !!props.task)

// Form data with default values
const formData = reactive({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  duration: 0,
  project: '',
  category: 'development' as 'development' | 'meeting' | 'training' | 'support' | 'admin' | 'other',
  isOT: false,
})

// Validation errors
const errors = reactive({
  title: '',
  startTime: '',
  endTime: '',
  category: ''
})

// Quick time presets
const timePresets: TimePreset[] = [
  { label: '9-12 (3h)', startTime: '09:00', endTime: '12:00' },
  { label: '9-17 (8h)', startTime: '09:00', endTime: '17:00' },
  { label: '13-17 (4h)', startTime: '13:00', endTime: '17:00' },
  { label: '9-13 (4h)', startTime: '09:00', endTime: '13:00' },
  { label: '10-11 (1h)', startTime: '10:00', endTime: '11:00' },
  { label: '14-16 (2h)', startTime: '14:00', endTime: '16:00' }
]

const calculatedDuration = computed(() => {
  if (formData.startTime && formData.endTime) {
    const start = new Date(`2000-01-01 ${formData.startTime}`)
    const end = new Date(`2000-01-01 ${formData.endTime}`)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)
    return duration > 0 ? duration : 0
  }
  return 0
})

const isFormValid = computed(() => {
  return formData.title.trim() && 
         formData.startTime && 
         formData.endTime && 
         formData.category &&
         calculatedDuration.value > 0
})

// Watch for task prop changes (for editing)
watch(() => props.task, (newTask) => {
  if (newTask) {
    Object.assign(formData, {
      title: newTask.title || '',
      description: newTask.description || '',
      startTime: newTask.startTime || '',
      endTime: newTask.endTime || '',
      duration: newTask.duration || 0,
      project: newTask.project || '',
      category: newTask.category || 'development',
      isOT: newTask.isOT || false,
    })
  } else {
    // Reset form for new task
    Object.assign(formData, {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      duration: 0,
      project: '',
      category: 'development',
      isOT: false,
    })
  }
}, { immediate: true })

// Methods
const calculateDuration = () => {
  formData.duration = calculatedDuration.value
}

const applyTimePreset = (preset: TimePreset) => {
  formData.startTime = preset.startTime
  formData.endTime = preset.endTime
  calculateDuration()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  if (!formData.title.trim()) {
    errors.title = 'Task title is required'
    isValid = false
  }

  if (!formData.startTime) {
    errors.startTime = 'Start time is required'
    isValid = false
  }

  if (!formData.endTime) {
    errors.endTime = 'End time is required'
    isValid = false
  }

  if (formData.startTime && formData.endTime) {
    const start = new Date(`2000-01-01 ${formData.startTime}`)
    const end = new Date(`2000-01-01 ${formData.endTime}`)
    
    if (end <= start) {
      errors.endTime = 'End time must be after start time'
      isValid = false
    }
  }

  if (!formData.category) {
    errors.category = 'Category is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (validateForm()) {
    calculateDuration()
    emit('save', { ...formData })
  }
}

const handleSaveAndAddAnother = () => {
  if (validateForm()) {
    calculateDuration()
    const taskData = { ...formData }
    emit('saveAndAddAnother', taskData)
    
    // Reset form for new task, keeping some useful defaults
    const previousEndTime = formData.endTime
    Object.assign(formData, {
      title: '',
      description: '',
      startTime: previousEndTime, // Set next task start time to previous end time
      endTime: '',
      duration: 0,
      project: formData.project, // Keep project the same
      category: formData.category, // Keep category the same
      isOT: false, // Reset OT flag
    })
  }
}

const handleDelete = async () => {
  try {
    const modal = useModal()
    
    const confirmed = await modal.showConfirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task?',
      type: 'danger',
      confirmText: 'Delete'
    })
    
    if (confirmed) {
      emit('delete')
    }
  } catch (error) {
    console.error('Error in handleDelete:', error)
  }
}

// Auto-focus title input when modal opens
onMounted(() => {
  nextTick(() => {
    const titleInput = document.querySelector('input[type="text"]') as HTMLInputElement
    if (titleInput) {
      titleInput.focus()
    }
  })
})
</script>

<style scoped>
.modal-backdrop {
  background: rgba(0, 0, 0, 0.3);
}
</style>