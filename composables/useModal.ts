interface AlertOptions {
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  okText?: string
}

interface ConfirmOptions {
  title?: string
  message: string
  type?: 'danger' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
}

// Global state - shared across all components
const globalAlertState = ref({
  isOpen: false,
  title: 'Alert',
  message: '',
  type: 'info' as 'success' | 'error' | 'warning' | 'info',
  okText: 'OK',
  resolver: null as ((value: void) => void) | null
})

const globalConfirmState = ref({
  isOpen: false,
  title: 'Confirm',
  message: '',
  type: 'info' as 'danger' | 'warning' | 'info',
  confirmText: 'OK',
  cancelText: 'Cancel',
  resolver: null as ((value: boolean) => void) | null
})

// Global modal states are now reactive

// Singleton functions
const showAlert = (options: AlertOptions): Promise<void> => {
  return new Promise((resolve) => {
    globalAlertState.value = {
      isOpen: true,
      title: options.title || 'Alert',
      message: options.message || '',
      type: options.type || 'info',
      okText: options.okText || 'OK',
      resolver: resolve
    }
  })
}

const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    globalConfirmState.value = {
      isOpen: true,
      title: options.title || 'Confirm',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      resolver: resolve
    }
  })
}

const handleAlertOk = () => {
  globalAlertState.value.isOpen = false
  if (globalAlertState.value.resolver) {
    globalAlertState.value.resolver()
    globalAlertState.value.resolver = null
  }
}

const handleConfirmConfirm = () => {
  globalConfirmState.value.isOpen = false
  if (globalConfirmState.value.resolver) {
    globalConfirmState.value.resolver(true)
    globalConfirmState.value.resolver = null
  }
}

const handleConfirmCancel = () => {
  globalConfirmState.value.isOpen = false
  if (globalConfirmState.value.resolver) {
    globalConfirmState.value.resolver(false)
    globalConfirmState.value.resolver = null
  }
}

const closeAlert = () => {
  globalAlertState.value.isOpen = false
  if (globalAlertState.value.resolver) {
    globalAlertState.value.resolver()
    globalAlertState.value.resolver = null
  }
}

const closeConfirm = () => {
  globalConfirmState.value.isOpen = false
  if (globalConfirmState.value.resolver) {
    globalConfirmState.value.resolver(false)
    globalConfirmState.value.resolver = null
  }
}

// Export global states directly
export { globalAlertState, globalConfirmState }

export const useModal = () => {
  return {
    alertState: globalAlertState,
    confirmState: globalConfirmState,
    showAlert,
    showConfirm,
    handleAlertOk,
    handleConfirmConfirm,
    handleConfirmCancel,
    closeAlert,
    closeConfirm
  }
}