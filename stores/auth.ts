import { defineStore } from 'pinia'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'hr' | 'employee'
  department: string
  position: string
  avatar?: string
  roles?: Array<{
    id: string
    name: string
    description: string
    permissions: string[]
    isActive: boolean
  }>
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    token: null as string | null,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isHR: (state) => state.user?.role === 'hr',
    canManageEmployees: (state) => state.user?.role === 'admin' || state.user?.role === 'hr',
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: credentials
        })
        
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        
        if (process.client) {
          localStorage.setItem('auth-token', response.token)
          localStorage.setItem('auth-user', JSON.stringify(response.user))
        }
        
        return response
      } catch (error: any) {
        // Handle API errors
        if (error.data?.statusMessage) {
          throw new Error(error.data.statusMessage)
        }
        throw new Error(error.message || 'Login failed')
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      if (process.client) {
        localStorage.removeItem('auth-token')
        localStorage.removeItem('auth-user')
      }
      
      await navigateTo('/login')
    },

    async register(userData: { 
      name: string; 
      email: string; 
      password: string; 
      department?: string; 
      position?: string;
      role?: string;
    }) {
      try {
        const response = await $fetch('/api/auth/register', {
          method: 'POST',
          body: userData
        })
        
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        
        if (process.client) {
          localStorage.setItem('auth-token', response.token)
          localStorage.setItem('auth-user', JSON.stringify(response.user))
        }
        
        return response
      } catch (error: any) {
        // Handle API errors
        if (error.data?.statusMessage) {
          throw new Error(error.data.statusMessage)
        }
        throw new Error(error.message || 'Registration failed')
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return null
      
      try {
        const response = await $fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })
        
        this.user = response.user
        this.isAuthenticated = true
        
        if (process.client) {
          localStorage.setItem('auth-user', JSON.stringify(response.user))
        }
        
        return response.user
      } catch (error) {
        // Token is invalid, logout
        this.logout()
        return null
      }
    },

    async initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth-token')
        const userData = localStorage.getItem('auth-user')
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData)
            this.token = token
            this.user = user
            this.isAuthenticated = true
            
            // Validate token by fetching current user
            await this.fetchCurrentUser()
          } catch (error) {
            console.error('Failed to parse user data from localStorage:', error)
            this.logout()
          }
        }
      }
    },
  },
})