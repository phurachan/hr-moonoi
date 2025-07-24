<template>
  <div class="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-white">Reports Dashboard</h1>
        <p class="text-gray-300 mt-2">Generate comprehensive reports for your organization</p>
      </div>
    </div>

    <!-- Report Categories -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Invoice Reports -->
      <div class="card bg-gray-800 shadow-xl border border-gray-700 hover:border-primary transition-colors">
        <div class="card-body">
          <div class="flex items-center mb-4">
            <div class="avatar placeholder mr-4">
              <div class="bg-primary text-primary-content rounded-full w-12">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
            </div>
            <h2 class="card-title text-white">Invoice Reports</h2>
          </div>
          <p class="text-gray-300 mb-4">Generate detailed invoice reports based on timesheet data with billable hours and rates.</p>
          <ul class="text-sm text-gray-400 mb-6 space-y-1">
            <li>• Billable hours tracking</li>
            <li>• Rate calculations</li>
            <li>• Project-based invoicing</li>
            <li>• PDF & Excel export</li>
          </ul>
          <div class="card-actions">
            <NuxtLink to="/reports/invoices" class="btn btn-primary w-full">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Generate Invoice Reports
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Timesheet Reports -->
      <div class="card bg-gray-800 shadow-xl border border-gray-700 hover:border-secondary transition-colors">
        <div class="card-body">
          <div class="flex items-center mb-4">
            <div class="avatar placeholder mr-4">
              <div class="bg-secondary text-secondary-content rounded-full w-12">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <h2 class="card-title text-white">Timesheet Reports</h2>
          </div>
          <p class="text-gray-300 mb-4">Comprehensive timesheet analytics and reporting for all employees and projects.</p>
          <ul class="text-sm text-gray-400 mb-6 space-y-1">
            <li>• Time tracking analytics</li>
            <li>• Employee productivity</li>
            <li>• Project time allocation</li>
            <li>• Approval workflows</li>
          </ul>
          <div class="card-actions">
            <NuxtLink to="/timesheets/reports" class="btn btn-secondary w-full">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              View Timesheet Reports
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Employee Reports -->
      <div class="card bg-gray-800 shadow-xl border border-gray-700 hover:border-accent transition-colors">
        <div class="card-body">
          <div class="flex items-center mb-4">
            <div class="avatar placeholder mr-4">
              <div class="bg-accent text-accent-content rounded-full w-12">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <h2 class="card-title text-white">Employee Reports</h2>
          </div>
          <p class="text-gray-300 mb-4">Detailed employee performance and HR analytics for better workforce management.</p>
          <ul class="text-sm text-gray-400 mb-6 space-y-1">
            <li>• Performance metrics</li>
            <li>• Department analytics</li>
            <li>• Attendance tracking</li>
            <li>• HR insights</li>
          </ul>
          <div class="card-actions">
            <NuxtLink to="/reports/employees" class="btn btn-accent w-full">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Generate Employee Reports
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="bg-gray-800 rounded-lg shadow p-6 mt-8">
      <h3 class="text-lg font-semibold mb-6 text-white">Quick Statistics</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="stat bg-gray-700 rounded-lg p-4">
          <div class="stat-title text-gray-300">This Month</div>
          <div class="stat-value text-primary">{{stats.totalHours}}h</div>
          <div class="stat-desc text-gray-400">Total logged hours</div>
        </div>
        <div class="stat bg-gray-700 rounded-lg p-4">
          <div class="stat-title text-gray-300">Billable Hours</div>
          <div class="stat-value text-success">{{stats.billableHours}}h</div>
          <div class="stat-desc text-gray-400">{{stats.billablePercentage}}% of total</div>
        </div>
        <div class="stat bg-gray-700 rounded-lg p-4">
          <div class="stat-title text-gray-300">Active Projects</div>
          <div class="stat-value text-info">{{stats.activeProjects}}</div>
          <div class="stat-desc text-gray-400">Currently tracked</div>
        </div>
        <div class="stat bg-gray-700 rounded-lg p-4">
          <div class="stat-title text-gray-300">Revenue</div>
          <div class="stat-value text-accent">{{stats.totalRevenue?.toLocaleString('th-TH')}}</div>
          <div class="stat-desc text-gray-400">This month estimate</div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-gray-800 rounded-lg shadow p-6 mt-8">
      <h3 class="text-lg font-semibold mb-6 text-white">Recent Report Activity</h3>
      <div class="space-y-4">
        <div v-for="activity in recentActivity" :key="activity.id" class="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div class="flex items-center gap-4">
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-10">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
            <div>
              <p class="text-white font-medium">{{activity.type}} report generated</p>
              <p class="text-gray-400 text-sm">{{activity.description}}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-gray-300 text-sm">{{formatDate(activity.createdAt)}}</p>
            <div class="badge badge-sm" :class="getStatusBadge(activity.status)">{{activity.status}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Sample data - in real app, fetch from API
const stats = ref({
  totalHours: 2847,
  billableHours: 2156,
  billablePercentage: 76,
  activeProjects: 12,
  totalRevenue: 89750
})

const recentActivity = ref([
  {
    id: 1,
    type: 'Invoice',
    description: 'Monthly invoice report for October 2024',
    createdAt: new Date().toISOString(),
    status: 'completed'
  },
  {
    id: 2,
    type: 'Timesheet',
    description: 'Weekly timesheet summary report',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'completed'
  },
  {
    id: 3,
    type: 'Employee',
    description: 'Department performance analysis',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'processing'
  }
])

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return 'badge-success'
    case 'processing':
      return 'badge-warning'
    case 'failed':
      return 'badge-error'
    default:
      return 'badge-neutral'
  }
}

// Set page title
useHead({
  title: 'Reports Dashboard - Manager'
})
</script>