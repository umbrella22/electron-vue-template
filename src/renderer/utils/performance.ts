/**
 * 性能工具
 * 1. 计算方法执行时间
 * @returns {void}
 * @date 2019-11-29
 */

import { memoryInfo } from 'customTypes/global'
import Timer from './timer'

class Performance {
  /**
   * 计算情况
   * @returns {Function}  执行返回值获取时间信息
   * @date 2019-11-29
   */
  startExecute(name = ''): Function {
    const timer = Timer.start()
    const usedJSHeapSize = this.getMemoryInfo().usedJSHeapSize
    return (name2 = '') => {
      const executeTime = timer.stop()
      const endMemoryInfo = this.getMemoryInfo()
      console.log(
        '%cPerformance%c \n1. 路由路径：%c%s%c\n2. 执行耗时： %c%sms%c \n3. 内存波动：%sB \n4. 已分配内存： %sMB \n5. 已使用内存：%sMB \n6. 剩余内存： %sMB',
        'padding: 2px 4px 2px 4px; background-color: #4caf50; color: #fff; border-radius: 4px;',
        '',
        'color: #ff6f00',
        `${name} ${name2}`,
        '',
        'color: #ff6f00',
        executeTime,
        '',
        endMemoryInfo.usedJSHeapSize - usedJSHeapSize,
        this.toMBSize(endMemoryInfo.jsHeapSizeLimit),
        this.toMBSize(endMemoryInfo.usedJSHeapSize),
        this.toMBSize(endMemoryInfo.totalJSHeapSize),
      )
    }
  }

  /**
   * 获取内存信息
   * @returns {memoryInfo}
   * @date 2019-11-29
   */

  getMemoryInfo(): memoryInfo {
    let memoryinfo = <memoryInfo>{}
    if (window.performance && window.performance.memory) {
      memoryinfo = window.performance.memory
    }
    return memoryinfo
  }

  /**
   * 转化为MB
   * @returns {string}
   * @date 2019-11-29
   */
  toMBSize(byteSize: number): string {
    return (byteSize / (1024 * 1024)).toFixed(1)
  }
}

export default new Performance()
