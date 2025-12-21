<template>
  <div class="print-page">
    <div class="tool-header">
      <div class="header-left">
        <n-avatar size="medium" :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-color)' }">
          <div class="i-tdesign-printer text-lg" />
        </n-avatar>
        <div class="tool-title">{{ i18nt.print.print }}</div>
      </div>
      <n-button type="primary" @click="print">
        {{ i18nt.print.executePrint }}
      </n-button>
    </div>

    <div class="content-container">
      <div class="content-column">
        <n-card :title="i18nt.print.settings" size="small" class="content-card">
          <n-space vertical size="large">
            <!-- Tips -->
            <n-alert type="info" show-icon v-if="i18nt.print.tips">
              {{ i18nt.print.tips }}
            </n-alert>

            <!-- Printer Selection -->
            <n-form-item :label="i18nt.print.printer">
              <n-select
                v-model:value="selName"
                :options="printerOptions"
                :placeholder="i18nt.print.printer"
              />
            </n-form-item>

            <!-- Toggles -->
            <n-space>
              <n-tag checkable v-model:checked="silent">
                {{ i18nt.print.silentPrinting }}
              </n-tag>
              <n-tag checkable v-model:checked="printBackground">
                {{ i18nt.print.backgroundColor }}
              </n-tag>
              <n-tag checkable v-model:checked="color">
                {{ i18nt.print.colorful }}
              </n-tag>
            </n-space>

            <!-- Page Size -->
            <n-form-item :label="i18nt.print.pageSize">
              <n-select
                v-model:value="pageSizeString"
                :options="pageSizeOptionsComputed"
              />
            </n-form-item>

            <!-- Margins -->
            <n-form-item :label="i18nt.print.margin">
              <n-space vertical style="width: 100%">
                <n-select
                  v-model:value="margins.marginType"
                  :options="marginTypeOptions"
                />
                <n-grid v-if="margins.marginType === 'custom'" :x-gap="12" :cols="4">
                  <n-grid-item>
                    <n-input-number v-model:value="margins.top" size="small" :show-button="false">
                      <template #suffix>T</template>
                    </n-input-number>
                  </n-grid-item>
                  <n-grid-item>
                    <n-input-number v-model:value="margins.bottom" size="small" :show-button="false">
                      <template #suffix>B</template>
                    </n-input-number>
                  </n-grid-item>
                  <n-grid-item>
                    <n-input-number v-model:value="margins.left" size="small" :show-button="false">
                      <template #suffix>L</template>
                    </n-input-number>
                  </n-grid-item>
                  <n-grid-item>
                    <n-input-number v-model:value="margins.right" size="small" :show-button="false">
                      <template #suffix>R</template>
                    </n-input-number>
                  </n-grid-item>
                </n-grid>
              </n-space>
            </n-form-item>
          </n-space>
        </n-card>
      </div>

      <div class="content-column">
        <n-card :title="i18nt.print.preview" size="small" class="content-card">
           <div class="preview-area">
              <div class="preview-box"></div>
              <n-image
                width="200"
                src="https://img2.baidu.com/it/u=2173864545,554093748&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=882"
                object-fit="contain"
              />
           </div>
        </n-card>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, Ref, computed } from 'vue'
import { i18nt } from '@renderer/i18n'
import { invoke, IpcChannel } from '@renderer/utils/ipcRenderer'
import type { WebContentsPrintOptions } from 'electron'
import { 
  NSelect, 
  NButton, 
  NCard, 
  NSpace, 
  NAlert, 
  NGrid, 
  NGridItem, 
  NTag, 
  NFormItem, 
  NInputNumber,
  NImage,
  NAvatar
} from 'naive-ui'

const selName = ref('')
const printers = ref<Electron.PrinterInfo[]>([])
const printerOptions = computed(() => {
  return printers.value.map((p) => ({
    label: p.displayName,
    value: p.name,
  }))
})

const silent = ref(false)
const printBackground = ref(false)
const color = ref(true)
const marginTypes = ref(['default', 'none', 'printableArea', 'custom'])
const marginTypeOptions = computed(() => {
  return marginTypes.value.map((t) => ({
    label: t,
    value: t,
  }))
})

const margins: Ref<WebContentsPrintOptions['margins']> = ref({
  marginType: 'default',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
})
const pageSizeString = ref<string>('A4')
const pageSizeOptions = ref(['A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid'])
const pageSizeOptionsComputed = computed(() => {
  return pageSizeOptions.value.map((s) => ({
    label: s,
    value: s,
  }))
})

const pageSizeObject = ref({ width: 210000, height: 297000 })
const selPageSizeType = ref(0) // 0 string  1 Size

onMounted(async () => {
  // 获取打印机列表
  printers.value = await invoke(IpcChannel.GetPrinters)
  if (printers.value.length) {
    const defaultItem = printers.value.find((v) => v.isDefault)
    if (defaultItem) {
      selName.value = defaultItem.name
    } else {
      selName.value = printers.value[0].name
    }
  }
})

async function print() {
  if (selName.value) {
    const printRes = await invoke(IpcChannel.PrintHandlePrint, {
      silent: silent.value,
      deviceName: selName.value,
      printBackground: printBackground.value,
      color: color.value,
      margins: toRaw(margins.value),
      pageSize:
        selPageSizeType.value === 0
          ? toRaw(pageSizeString.value)
          : toRaw(pageSizeObject.value),
    })
    console.info(printRes)
  }
}
</script>
<style scoped>
.print-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tool-title {
  font-family: var(--font-code);
  font-size: 18px;
  font-weight: bold;
}

.content-container {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

.content-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.content-card {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
  background: rgba(0,0,0,0.02);
  border-radius: 4px;
  padding: 20px;
}

.preview-box {
  width: 50px;
  height: 50px;
  background: #ff4d4f;
  border-radius: 4px;
}
</style>
