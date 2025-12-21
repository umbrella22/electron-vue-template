<template>
  <div class="download-page fade-up p-6 h-full flex flex-col gap-4">
    <div class="header-section flex gap-4 items-center">
      <n-input
        v-model:value="inputUrl"
        type="text"
        :placeholder="i18nt.download.placeholder"
        class="flex-1"
        @keyup.enter="handleAddDownload"
      />
      <div class="flex gap-2">
        <n-button type="primary" @click="handleAddDownload">
          <template #icon>
            <div class="i-tdesign-download" />
          </template>
          {{ i18nt.download.download }}
        </n-button>
        <n-button @click="handleStartAll">
          <template #icon>
            <div class="i-tdesign-play-circle" />
          </template>
          {{ i18nt.download.startAll }}
        </n-button>
        <n-button @click="handlePauseAll">
          <template #icon>
            <div class="i-tdesign-pause-circle" />
          </template>
          {{ i18nt.download.pauseAll }}
        </n-button>
        <n-button type="error" ghost @click="handleCancelAll">
          <template #icon>
            <div class="i-tdesign-close-circle" />
          </template>
          {{ i18nt.download.cancelAll }}
        </n-button>
      </div>
    </div>

    <div
      class="location-section flex items-center gap-4 p-4 bg-card rounded-lg border border-borderLight"
    >
      <div class="i-tdesign-folder-open text-xl text-primary" />
      <span class="text-secondary font-bold">
        {{ i18nt.download.location }}
      </span>
      <span class="flex-1 font-mono bg-bg px-2 py-1 rounded">
        {{ downloadPath }}
      </span>
      <n-button size="small" @click="handleSelectLocation">
        {{ i18nt.download.change }}
      </n-button>
    </div>

    <div
      class="list-section flex-1 overflow-auto bg-card rounded-lg border border-borderLight p-4"
    >
      <n-empty
        v-if="downloads.length === 0"
        :description="i18nt.download.noDownloads"
        class="mt-10"
      />

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="item in downloads"
          :key="item.id"
          class="download-item p-3 rounded-lg bg-bg border border-borderLight hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="font-bold text-text truncate pr-4" :title="item.name">
              {{ item.name }}
            </div>
            <div class="flex gap-2 shrink-0">
              <n-button
                circle
                size="small"
                :type="item.status === 'active' ? 'warning' : 'primary'"
                @click="toggleItemStatus(item)"
              >
                <template #icon>
                  <div
                    :class="
                      item.status === 'active'
                        ? 'i-tdesign-pause'
                        : 'i-tdesign-play'
                    "
                  />
                </template>
              </n-button>
              <n-button
                circle
                size="small"
                type="error"
                ghost
                @click="cancelItem(item.id)"
              >
                <template #icon>
                  <div class="i-tdesign-close" />
                </template>
              </n-button>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <n-progress
              type="line"
              :percentage="item.progress"
              :indicator-placement="'inside'"
              :status="getProgressStatus(item.status)"
              class="flex-1"
              processing
            />
            <div class="w-20 text-right text-xs text-secondary font-mono">
              {{ getStatusDisplay(item) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NInput, NButton, NProgress, NEmpty, useMessage } from 'naive-ui'
import {
  useDownloadStore,
  DownloadItem,
} from '@renderer/store/modules/download'
import { storeToRefs } from 'pinia'
import { i18nt } from '@renderer/i18n'
import { invoke, vueListen, IpcChannel } from '@renderer/utils/ipcRenderer'

const message = useMessage()
const downloadStore = useDownloadStore()
const { filteredDownloads: downloads } = storeToRefs(downloadStore)

// State
const inputUrl = ref('')
const downloadPath = ref('') // Default from main process

onMounted(() => {
  invoke(IpcChannel.GetDownloadPath)
    .then((p) => {
      if (p) downloadPath.value = p
    })
    .catch(() => {})
})

vueListen(IpcChannel.DownloadProgress, (_event, payload) => {
  const item = downloadStore.downloads.find((d) => d.id === payload.id)
  if (!item) return
  item.progress = payload.progress
  if (item.status !== 'paused') item.status = 'active'
  item.speed = ''
})

vueListen(IpcChannel.DownloadDone, (_event, payload) => {
  const item = downloadStore.downloads.find((d) => d.id === payload.id)
  if (!item) return
  item.progress = 100
  item.status = 'completed'
  item.speed = ''
  message.success(`下载完成：${payload.filePath}`)
})

vueListen(IpcChannel.DownloadError, (_event, payload) => {
  const item = downloadStore.downloads.find((d) => d.id === payload.id)
  if (!item) return
  item.status = 'error'
  item.speed = ''
  message.error(payload.message || '下载失败')
})

// Actions
const handleAddDownload = () => {
  const url = inputUrl.value.trim()
  if (!url) return

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    message.error(i18nt.value.download.messages.invalidUrl)
    return
  }

  const name = url.split('/').pop() || 'unknown-file'
  const id = Date.now().toString()

  downloadStore.addDownload({
    id,
    name,
    url,
    progress: 0,
    status: 'active',
    speed: 'connecting', // Use a key instead of display text
  })

  inputUrl.value = ''
  message.success(i18nt.value.download.messages.taskAdded)

  invoke(IpcChannel.StartDownload, { id, url }).catch(() => {
    const item = downloadStore.downloads.find((d) => d.id === id)
    if (item) {
      item.status = 'error'
      item.speed = ''
    }
    message.error('下载启动失败')
  })
}

const handleStartAll = () => {
  downloadStore.downloads.forEach((item) => {
    if (item.status === 'paused' || item.status === 'error') {
      item.status = 'active'
      item.speed = 'resuming' // Use key
      invoke(IpcChannel.StartDownload, { id: item.id, url: item.url }).catch(
        () => {
          item.status = 'error'
          item.speed = ''
        },
      )
    }
  })
}

const handlePauseAll = () => {
  downloadStore.downloads.forEach((item) => {
    if (item.status === 'active') {
      item.status = 'paused'
    }
  })
}

const handleCancelAll = () => {
  downloadStore.downloads.splice(0, downloadStore.downloads.length)
  message.info(i18nt.value.download.messages.canceledAll)
}

const handleSelectLocation = () => {
  if (downloadStore.downloads.length > 0) {
    message.warning(i18nt.value.download.messages.cannotChangeLocation)
    return
  }
  invoke(IpcChannel.SelectDownloadPath)
    .then((p) => {
      if (!p) return
      downloadPath.value = p
      message.success(i18nt.value.download.messages.locationUpdated)
    })
    .catch(() => {})
}

const toggleItemStatus = (item: DownloadItem) => {
  if (item.status === 'active') {
    item.status = 'paused'
  } else {
    item.status = 'active'
    item.speed = 'resuming' // Use key
    invoke(IpcChannel.StartDownload, { id: item.id, url: item.url }).catch(
      () => {
        item.status = 'error'
        item.speed = ''
      },
    )
  }
}

const cancelItem = (id: string) => {
  const index = downloadStore.downloads.findIndex((i) => i.id === id)
  if (index !== -1) {
    downloadStore.downloads.splice(index, 1)
  }
}

const getProgressStatus = (status: string) => {
  switch (status) {
    case 'active':
      return 'info'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'default'
  }
}

const getStatusDisplay = (item: DownloadItem) => {
  if (item.status === 'active') {
    if (item.speed === 'connecting')
      return i18nt.value.download.status.connecting
    if (item.speed === 'resuming') return i18nt.value.download.status.resuming
    if (!item.speed) return i18nt.value.download.status.active
    return item.speed // Return actual speed if it's not a special key
  }
  // @ts-ignore
  return i18nt.value.download.status[item.status] || item.status
}
</script>

<style scoped>
.download-page {
  /* Ensure it takes full height of the router view area */
  height: 100%;
  color: var(--text-color);
}
</style>
