import { defineStore } from 'pinia'

export interface ToolItem {
  id: string
  name: string
  desc: string
  avatar: string
  time: string
  mainCode?: string
  rendererCode?: string
}

export const useToolsStore = defineStore('tools', {
  state: () => ({
    activeToolId: 'console',
  }),
  actions: {
    setActiveTool(id: string) {
      this.activeToolId = id
    },
  },
})
