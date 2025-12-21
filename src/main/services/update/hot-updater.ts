import { emptyDir, createWriteStream, readFile, copy, remove } from 'fs-extra'
import { join, resolve } from 'path'
import { promisify } from 'util'
import { pipeline } from 'stream'
import { app, BrowserWindow } from 'electron'
import { gt } from 'semver'
import { createHmac } from 'crypto'
import AdmZip from 'adm-zip'
import { version } from '../../../../package.json'
import { hotPublishConfig } from '../../config/hot-publish'
import axios, { AxiosResponse } from 'axios'
import { webContentSend } from '../ipc/web-content-send'

const streamPipeline = promisify(pipeline)
const appPath = app.getAppPath()
const updatePath = resolve(appPath, '..', '..', 'update')
const request = axios.create()

function hash(data: Buffer, type = 'sha256', key = 'Sky'): string {
  const hmac = createHmac(type, key)
  hmac.update(data)
  return hmac.digest('hex')
}

async function download(url: string, filePath: string): Promise<void> {
  const res = await request({ url, responseType: 'stream' })
  await streamPipeline(res.data, createWriteStream(filePath))
}

const updateInfo = {
  status: 'init',
  message: '',
}

interface Res extends AxiosResponse<any> {
  data: {
    version: string
    name: string
    hash: string
  }
}

export const updater = async (windows?: BrowserWindow): Promise<void> => {
  try {
    const res: Res = await request({
      url: `${hotPublishConfig.url}/${
        hotPublishConfig.configName
      }.json?time=${new Date().getTime()}`,
    })
    if (gt(res.data.version, version)) {
      await emptyDir(updatePath)
      const filePath = join(updatePath, res.data.name)
      updateInfo.status = 'downloading'
      if (windows)
        webContentSend['hot-update-status'](windows.webContents, updateInfo)
      await download(`${hotPublishConfig.url}/${res.data.name}`, filePath)
      const buffer = await readFile(filePath)
      const sha256 = hash(buffer)
      if (sha256 !== res.data.hash) throw new Error('sha256 error')
      const appPathTemp = join(updatePath, 'temp')
      const zip = new AdmZip(filePath)
      zip.extractAllTo(appPathTemp, true, true)
      updateInfo.status = 'moving'
      if (windows)
        webContentSend['hot-update-status'](windows.webContents, updateInfo)
      await remove(join(`${appPath}`, 'dist'))
      await remove(join(`${appPath}`, 'package.json'))
      await copy(appPathTemp, appPath)
      updateInfo.status = 'finished'
      if (windows)
        webContentSend['hot-update-status'](windows.webContents, updateInfo)
    }
  } catch (error) {
    updateInfo.status = 'failed'
    updateInfo.message = error instanceof Error ? error.message : String(error)

    if (windows)
      webContentSend['hot-update-status'](windows.webContents, updateInfo)
  }
}

export const getUpdateInfo = () => updateInfo
