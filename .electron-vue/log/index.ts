import chalk from 'chalk'
import { LinearReporter } from './reporter'

export * from './reporter'

const fallbackReporter = new LinearReporter()

export const doneLog = (text: string) => {
  fallbackReporter.log({ source: 'build', level: 'success', message: text })
}
export const errorLog = (text: string | Error | null) => {
  fallbackReporter.log({ source: 'build', level: 'error', message: text })
}
export const okayLog = (text: string) => {
  fallbackReporter.log({ source: 'build', level: 'info', message: text })
}
export const warningLog = (text: string) => {
  fallbackReporter.log({ source: 'build', level: 'warning', message: text })
}
export const infoLog = (text: string) => {
  fallbackReporter.log({ source: 'build', level: 'info', message: text })
}

export const legacyDoneLog = (text: string) => {
  console.log('\n' + chalk.bgGreen.white(' DONE ') + ' ', text)
}
