import { usePermissions } from '~/composables/usePermissions'

export interface MenuItem {
  id: string
  title: string
  icon: string
  path?: string
  permissions?: string[]
  children?: MenuItem[]
  separator?: boolean
  badge?: {
    text: string
    color: string
  }
}

export interface MenuSection {
  title?: string
  items: MenuItem[]
}

export const useMenuConfig = () => {
  const { hasPermission, hasAnyPermission, canAccessModule, isAdmin } = usePermissions()

  // Main menu configuration
  const mainMenuConfig: MenuSection[] = [
    {
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0zM8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z',
          path: '/dashboard',
          permissions: ['dashboard.access']
        }
      ]
    },
    {
      title: 'Staff Management',
      items: [
        {
          id: 'employees',
          title: 'Employees',
          icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
          path: '/employees',
          permissions: ['employees.access'],
          children: [
            {
              id: 'employees-list',
              title: 'Employee List',
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
              path: '/employees',
              permissions: ['employees.read']
            },
            {
              id: 'employees-create',
              title: 'Add Employee',
              icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
              path: '/employees/create',
              permissions: ['employees.create']
            }
          ]
        },
        {
          id: 'customers',
          title: 'Customers',
          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
          path: '/customers',
          permissions: ['customers.access'],
          children: [
            {
              id: 'customers-list',
              title: 'Customer List',
              icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
              path: '/customers',
              permissions: ['customers.read']
            },
            {
              id: 'customers-create',
              title: 'Add Customer',
              icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
              path: '/customers/new',
              permissions: ['customers.create']
            }
          ]
        },
        {
          id: 'timesheets',
          title: 'Timesheets',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          path: '/timesheets',
          permissions: ['timesheets.access'],
          children: [
            {
              id: 'timesheets-my',
              title: 'My Timesheet',
              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              path: '/timesheets',
              permissions: ['timesheets.read', 'timesheets.create']
            },
            {
              id: 'timesheets-hr',
              title: 'Staff Management',
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
              path: '/timesheets/hr',
              permissions: ['timesheets.hr_view']
            }
          ]
        },
        {
          id: 'leaves',
          title: 'Leave Management',
          icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
          path: '/leaves',
          permissions: ['leaves.access'],
          children: [
            {
              id: 'leaves-my',
              title: 'My Leaves',
              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              path: '/leaves',
              permissions: ['leaves.read', 'leaves.create']
            },
            {
              id: 'leaves-request',
              title: 'Request Leave',
              icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
              path: '/leaves/request',
              permissions: ['leaves.create']
            },
            {
              id: 'leaves-hr',
              title: 'HR Management',
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
              path: '/leaves/hr',
              permissions: ['leaves.hr_view']
            }
          ]
        }
      ]
    },
    {
      title: 'Invoices',
      items: [
        {
          id: 'invoices',
          title: 'Invoice Management',
          icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
          path: '/reports/invoices',
          permissions: ['invoices.access']
        }
      ]
    },
    {
      title: 'System',
      items: [
        {
          id: 'settings',
          title: 'Settings',
          icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
          path: '/settings',
          permissions: ['settings.access'],
          children: [
            {
              id: 'settings-roles',
              title: 'Roles & Permissions',
              icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
              path: '/settings?tab=roles',
              permissions: ['settings.roles']
            },
            {
              id: 'settings-users',
              title: 'User Management',
              icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
              path: '/settings?tab=users',
              permissions: ['settings.user_roles']
            }
          ]
        },
        {
          id: 'separator-1',
          title: '',
          icon: '',
          separator: true
        },
        {
          id: 'profile',
          title: 'Profile',
          icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
          path: '/profile',
          permissions: ['profile.access']
        }
      ]
    }
  ]

  // Filter menu items based on permissions
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // Always show separators
      if (item.separator) return true
      
      // Admin users can see everything
      if (isAdmin.value) return true
      
      // Check if user has required permissions
      if (item.permissions && item.permissions.length > 0) {
        const hasRequiredPermission = hasAnyPermission(item.permissions)
        if (!hasRequiredPermission) return false
      }
      
      // Filter children recursively
      if (item.children) {
        item.children = filterMenuItems(item.children)
        // If no children are visible, hide parent (optional)
        // return item.children.length > 0
      }
      
      return true
    })
  }

  // Filter menu sections based on permissions
  const filterMenuSections = (sections: MenuSection[]): MenuSection[] => {
    return sections.map(section => ({
      ...section,
      items: filterMenuItems(section.items)
    })).filter(section => section.items.length > 0)
  }

  // Get filtered menu config
  const getFilteredMenuConfig = (): MenuSection[] => {
    return filterMenuSections(mainMenuConfig)
  }

  // Get menu item by ID
  const getMenuItemById = (id: string, sections?: MenuSection[]): MenuItem | null => {
    const searchSections = sections || mainMenuConfig
    
    for (const section of searchSections) {
      for (const item of section.items) {
        if (item.id === id) return item
        
        if (item.children) {
          const childItem = getMenuItemById(id, [{ title: '', items: item.children }])
          if (childItem) return childItem
        }
      }
    }
    
    return null
  }

  // Check if menu item is accessible
  const isMenuItemAccessible = (item: MenuItem): boolean => {
    if (isAdmin.value) return true
    
    if (item.permissions && item.permissions.length > 0) {
      return hasAnyPermission(item.permissions)
    }
    
    return true
  }

  // Get breadcrumbs for current path
  const getBreadcrumbs = (currentPath: string): MenuItem[] => {
    const breadcrumbs: MenuItem[] = []
    
    const findInMenu = (items: MenuItem[], path: string): boolean => {
      for (const item of items) {
        if (item.path === path) {
          breadcrumbs.push(item)
          return true
        }
        
        if (item.children) {
          if (findInMenu(item.children, path)) {
            breadcrumbs.unshift(item)
            return true
          }
        }
      }
      return false
    }
    
    for (const section of mainMenuConfig) {
      if (findInMenu(section.items, currentPath)) {
        break
      }
    }
    
    return breadcrumbs
  }

  // Get menu statistics
  const getMenuStats = () => {
    const stats = {
      totalItems: 0,
      accessibleItems: 0,
      hiddenItems: 0
    }
    
    const countItems = (items: MenuItem[]) => {
      for (const item of items) {
        if (!item.separator) {
          stats.totalItems++
          if (isMenuItemAccessible(item)) {
            stats.accessibleItems++
          } else {
            stats.hiddenItems++
          }
        }
        
        if (item.children) {
          countItems(item.children)
        }
      }
    }
    
    for (const section of mainMenuConfig) {
      countItems(section.items)
    }
    
    return stats
  }

  return {
    mainMenuConfig,
    getFilteredMenuConfig,
    getMenuItemById,
    isMenuItemAccessible,
    getBreadcrumbs,
    getMenuStats,
    filterMenuItems,
    filterMenuSections
  }
}