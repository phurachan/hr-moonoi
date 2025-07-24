<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Personal Information Section -->
      <div class="md:col-span-2">
        <h3 class="text-lg font-semibold mb-4">Personal Information</h3>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Full Name *</span>
        </label>
        <input 
          v-model="formData.name"
          type="text" 
          class="input input-bordered"
          :class="{ 'input-error': errors.name }"
          placeholder="John Doe"
          required
        />
        <label v-if="errors.name" class="label">
          <span class="label-text-alt text-error">{{ errors.name }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Email Address *</span>
        </label>
        <input 
          v-model="formData.email"
          type="email" 
          class="input input-bordered"
          :class="{ 'input-error': errors.email }"
          placeholder="john.doe@company.com"
          required
        />
        <label v-if="errors.email" class="label">
          <span class="label-text-alt text-error">{{ errors.email }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Phone Number *</span>
        </label>
        <input 
          v-model="formData.phone"
          type="tel" 
          class="input input-bordered"
          :class="{ 'input-error': errors.phone }"
          placeholder="+1-555-0123"
          required
        />
        <label v-if="errors.phone" class="label">
          <span class="label-text-alt text-error">{{ errors.phone }}</span>
        </label>
      </div>

      <BaseInputDate
        v-model="formData.birthDate"
        name="birthDate"
        label="Birth Date"
        :max-date="today"
        :error-message="errors.birthDate"
        help-text="Select employee's birth date"
      />

      <div class="form-control md:col-span-2">
        <label class="label">
          <span class="label-text">Address</span>
        </label>
        <textarea 
          v-model="formData.address"
          class="textarea textarea-bordered"
          :class="{ 'textarea-error': errors.address }"
          placeholder="123 Main St, City, State, ZIP"
          rows="3"
        ></textarea>
        <label v-if="errors.address" class="label">
          <span class="label-text-alt text-error">{{ errors.address }}</span>
        </label>
      </div>

      <!-- Employment Information Section -->
      <div class="md:col-span-2 mt-6">
        <h3 class="text-lg font-semibold mb-4">Employment Information</h3>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Position *</span>
        </label>
        <input 
          v-model="formData.position"
          type="text" 
          class="input input-bordered"
          :class="{ 'input-error': errors.position }"
          placeholder="Software Engineer"
          required
        />
        <label v-if="errors.position" class="label">
          <span class="label-text-alt text-error">{{ errors.position }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Department *</span>
        </label>
        <select 
          v-model="formData.department"
          class="select select-bordered"
          :class="{ 'select-error': errors.department }"
          required
        >
          <option value="">Select Department</option>
          <option value="Engineering">Engineering</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Sales">Sales</option>
          <option value="Marketing">Marketing</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
          <option value="Customer Support">Customer Support</option>
        </select>
        <label v-if="errors.department" class="label">
          <span class="label-text-alt text-error">{{ errors.department }}</span>
        </label>
      </div>

      <BaseInputDate
        v-model="formData.hireDate"
        name="hireDate"
        label="Hire Date"
        required
        :error-message="errors.hireDate"
        help-text="Select employee's hire date"
      />

      <div class="form-control">
        <label class="label">
          <span class="label-text">Salary *</span>
        </label>
        <input 
          v-model.number="formData.salary"
          type="number" 
          class="input input-bordered"
          :class="{ 'input-error': errors.salary }"
          placeholder="75000"
          min="0"
          step="1000"
          required
        />
        <label v-if="errors.salary" class="label">
          <span class="label-text-alt text-error">{{ errors.salary }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Employment Status *</span>
        </label>
        <select 
          v-model="formData.status"
          class="select select-bordered"
          :class="{ 'select-error': errors.status }"
          required
        >
          <option value="">Select Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
        </select>
        <label v-if="errors.status" class="label">
          <span class="label-text-alt text-error">{{ errors.status }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Emergency Contact</span>
        </label>
        <input 
          v-model="formData.emergencyContact"
          type="text" 
          class="input input-bordered"
          :class="{ 'input-error': errors.emergencyContact }"
          placeholder="Jane Doe - 555-0124"
        />
        <label v-if="errors.emergencyContact" class="label">
          <span class="label-text-alt text-error">{{ errors.emergencyContact }}</span>
        </label>
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Avatar URL</span>
        </label>
        <input 
          v-model="formData.avatar"
          type="url" 
          class="input input-bordered"
          :class="{ 'input-error': errors.avatar }"
          placeholder="https://example.com/avatar.jpg"
        />
        <label v-if="errors.avatar" class="label">
          <span class="label-text-alt text-error">{{ errors.avatar }}</span>
        </label>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end gap-4 pt-6 border-t">
      <button 
        type="button" 
        class="btn btn-ghost" 
        @click="$emit('cancel')"
        :disabled="loading"
      >
        Cancel
      </button>
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="loading"
      >
        <span v-if="loading" class="loading loading-spinner loading-sm mr-2"></span>
        {{ isEdit ? 'Update' : 'Create' }} Employee
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
interface Employee {
  id?: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
  status: 'active' | 'inactive' | 'terminated'
  address: string
  birthDate: string
  emergencyContact: string
  avatar?: string
}

const props = defineProps<{
  employee?: Employee
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>]
  cancel: []
}>()

const isEdit = computed(() => !!props.employee?.id)

// Get today's date in YYYY-MM-DD format for date constraints
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Form data with default values
const formData = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  hireDate: null as Date | null,
  salary: 0,
  status: 'active' as 'active' | 'inactive' | 'terminated',
  address: '',
  birthDate: null as Date | null,
  emergencyContact: '',
  avatar: ''
})

// Validation errors
const errors = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  hireDate: '',
  salary: '',
  status: '',
  address: '',
  birthDate: '',
  emergencyContact: '',
  avatar: ''
})

// Watch for employee prop changes (for editing)
watch(() => props.employee, (newEmployee) => {
  if (newEmployee) {
    Object.assign(formData, {
      name: newEmployee.name || '',
      email: newEmployee.email || '',
      phone: newEmployee.phone || '',
      position: newEmployee.position || '',
      department: newEmployee.department || '',
      hireDate: newEmployee.hireDate ? new Date(newEmployee.hireDate) : null,
      salary: newEmployee.salary || 0,
      status: newEmployee.status || 'active',
      address: newEmployee.address || '',
      birthDate: newEmployee.birthDate ? new Date(newEmployee.birthDate) : null,
      emergencyContact: newEmployee.emergencyContact || '',
      avatar: newEmployee.avatar || ''
    })
  }
}, { immediate: true })

// Validation functions
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Required field validation
  if (!formData.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

  if (!formData.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!formData.phone.trim()) {
    errors.phone = 'Phone number is required'
    isValid = false
  }

  if (!formData.position.trim()) {
    errors.position = 'Position is required'
    isValid = false
  }

  if (!formData.department.trim()) {
    errors.department = 'Department is required'
    isValid = false
  }

  if (!formData.hireDate) {
    errors.hireDate = 'Hire date is required'
    isValid = false
  }

  if (!formData.salary || formData.salary <= 0) {
    errors.salary = 'Please enter a valid salary'
    isValid = false
  }

  if (!formData.status) {
    errors.status = 'Employment status is required'
    isValid = false
  }

  return isValid
}

// Handle form submission
const handleSubmit = () => {
  if (validateForm()) {
    // Convert dates to strings for submission
    const submitData = {
      ...formData,
      hireDate: formData.hireDate ? formData.hireDate.toISOString().split('T')[0] : '',
      birthDate: formData.birthDate ? formData.birthDate.toISOString().split('T')[0] : ''
    }
    emit('submit', submitData)
  }
}

// Reset form
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hireDate: null,
    salary: 0,
    status: 'active',
    address: '',
    birthDate: null,
    emergencyContact: '',
    avatar: ''
  })
  
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

// Expose reset function to parent
defineExpose({
  resetForm
})
</script>