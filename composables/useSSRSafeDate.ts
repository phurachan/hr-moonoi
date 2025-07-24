/**
 * SSR-safe date utilities to prevent hydration mismatches
 */
export const useSSRSafeDate = () => {
  const getCurrentDate = () => {
    if (process.client) {
      return new Date().toISOString().split('T')[0]
    }
    return ''
  }
  
  const getCurrentYear = () => {
    if (process.client) {
      return new Date().getFullYear()
    }
    return new Date().getFullYear()
  }
  
  const isToday = (date: string) => {
    if (process.client) {
      return date === new Date().toISOString().split('T')[0]
    }
    return false
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }
  
  const formatDateShort = (dateString: string) => {
    if (!dateString) return ''
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }
  
  return {
    getCurrentDate,
    getCurrentYear,
    isToday,
    formatDate,
    formatDateShort
  }
}