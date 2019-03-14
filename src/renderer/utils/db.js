import DataStore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export default new DataStore({
  autoload: true,
  filename: path.join(remote.app.getPath('userData'), '/data.db')
})
