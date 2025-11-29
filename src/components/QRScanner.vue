<template>
  <div class="qr-scanner" :class="{ minimized: isMinimized }">
    <div v-if="!isSupported" class="error-message">
      <div class="error-icon">📵</div>
      <p>Камера не поддерживается на этом устройстве</p>
    </div>
    
    <div v-else class="scanner-container" @click="handleContainerClick">
      <qrcode-stream
        :paused="paused"
        @detect="onDetect"
        @camera-on="onCameraReady"
        @error="onError"
        class="scanner-view"
      >
        <div class="scanner-overlay">
          <div class="scanner-frame" :class="{ scanning: !paused }">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
            <div v-if="!paused" class="scan-line"></div>
          </div>
          <p class="scanner-hint">
            {{ paused ? 'Обработка...' : 'Наведите камеру на QR-код билета' }}
          </p>
        </div>
      </qrcode-stream>
    </div>
    
    <div v-if="lastError" class="error-toast">
      <span class="error-icon">⚠️</span>
      {{ lastError }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'

const props = defineProps({
  minimized: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['scanned', 'expand'])

const isSupported = ref(true)
const paused = ref(false)
const lastError = ref(null)
const isMinimized = ref(false)

// Синхронизация с props
watch(() => props.minimized, (val) => {
  isMinimized.value = val
}, { immediate: true })

function onDetect(detectedCodes) {
  if (detectedCodes.length > 0) {
    const code = detectedCodes[0].rawValue
    paused.value = true
    lastError.value = null
    emit('scanned', code)
    
    // Возобновляем сканирование через 2 секунды
    setTimeout(() => {
      paused.value = false
    }, 2000)
  }
}

function onCameraReady() {
  lastError.value = null
  isSupported.value = true
}

function onError(error) {
  console.error('Camera error:', error)
  
  if (error.name === 'NotAllowedError') {
    lastError.value = 'Разрешите доступ к камере в настройках'
  } else if (error.name === 'NotFoundError') {
    lastError.value = 'Камера не найдена'
    isSupported.value = false
  } else if (error.name === 'NotReadableError') {
    lastError.value = 'Камера уже используется другим приложением'
  } else if (error.name === 'OverconstrainedError') {
    lastError.value = 'Камера не поддерживает требуемые настройки'
  } else {
    lastError.value = error.message || 'Ошибка камеры'
  }
}

function resume() {
  paused.value = false
  lastError.value = null
}

function pause() {
  paused.value = true
}

function minimize() {
  isMinimized.value = true
}

function expand() {
  isMinimized.value = false
}

function handleContainerClick() {
  if (isMinimized.value) {
    emit('expand')
  }
}

defineExpose({ resume, pause, minimize, expand })
</script>

<style scoped>
.qr-scanner {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.qr-scanner.minimized {
  max-width: 120px;
  margin: 0 auto 16px;
}

.qr-scanner.minimized .scanner-container {
  aspect-ratio: 1;
  cursor: pointer;
}

.qr-scanner.minimized .scanner-overlay {
  display: none;
}

.qr-scanner.minimized .scanner-container::after {
  content: '📷 Нажмите для сканирования';
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 0.75rem;
  color: #9ca3af;
}

.scanner-container {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 1;
  transition: all 0.3s ease;
}

.scanner-view {
  width: 100%;
  height: 100%;
}

.scanner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scanner-frame {
  position: relative;
  width: 220px;
  height: 220px;
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
}

.scanner-frame.scanning {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6); }
  50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); }
}

.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #10b981;
  border-style: solid;
  border-width: 0;
}

.top-left {
  top: -2px;
  left: -2px;
  border-top-width: 4px;
  border-left-width: 4px;
  border-top-left-radius: 12px;
}

.top-right {
  top: -2px;
  right: -2px;
  border-top-width: 4px;
  border-right-width: 4px;
  border-top-right-radius: 12px;
}

.bottom-left {
  bottom: -2px;
  left: -2px;
  border-bottom-width: 4px;
  border-left-width: 4px;
  border-bottom-left-radius: 12px;
}

.bottom-right {
  bottom: -2px;
  right: -2px;
  border-bottom-width: 4px;
  border-right-width: 4px;
  border-bottom-right-radius: 12px;
}

.scan-line {
  position: absolute;
  left: 10px;
  right: 10px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% { top: 10px; opacity: 0; }
  10%, 90% { opacity: 1; }
  50% { top: calc(100% - 12px); }
}

.scanner-hint {
  margin-top: 24px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  text-align: center;
  padding: 0 20px;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 20px;
  text-align: center;
}

.error-message .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-message p {
  color: #fca5a5;
  font-size: 16px;
}

.error-toast {
  position: absolute;
  bottom: -60px;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(8px);
}

.error-toast .error-icon {
  font-size: 18px;
}
</style>

