<template>
  <div>
    <ModalsAlertModal
      :is-open="globalAlertState.isOpen"
      :title="globalAlertState.title"
      :message="globalAlertState.message"
      :type="globalAlertState.type"
      :ok-text="globalAlertState.okText"
      @ok="modal.handleAlertOk"
      @close="modal.closeAlert"
    />
    
    <ModalsConfirmModal
      :is-open="globalConfirmState.isOpen"
      :title="globalConfirmState.title"
      :message="globalConfirmState.message"
      :type="globalConfirmState.type"
      :confirm-text="globalConfirmState.confirmText"
      :cancel-text="globalConfirmState.cancelText"
      @confirm="modal.handleConfirmConfirm"
      @cancel="modal.handleConfirmCancel"
      @close="modal.closeConfirm"
    />
  </div>
</template>

<script setup>
import { globalAlertState, globalConfirmState } from '~/composables/useModal'

const modal = useModal()

// Modal system is now working properly
</script>