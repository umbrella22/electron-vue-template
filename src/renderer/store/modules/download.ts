import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface DownloadItem {
  id: string
  name: string
  url: string
  progress: number
  status: 'active' | 'paused' | 'completed' | 'canceled' | 'error'
  speed: string
}

export const useDownloadStore = defineStore('download', () => {
  const downloads = ref<DownloadItem[]>([])

  const filter = ref<string>('all')

  const filteredDownloads = computed(() => {
    if (filter.value === 'all') return downloads.value
    if (filter.value === 'active') return downloads.value.filter(d => d.status === 'active' || d.status === 'paused')
    if (filter.value === 'completed') return downloads.value.filter(d => d.status === 'completed')
    return downloads.value
  })

  function addDownload(item: DownloadItem) {
    downloads.value.unshift(item)
  }

  function setFilter(f: string) {
    filter.value = f
  }

  return {
    downloads,
    filter,
    filteredDownloads,
    addDownload,
    setFilter
  }
})
