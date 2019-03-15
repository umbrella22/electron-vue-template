import db from '../utils/db'

export default {
  adddata (data) {
    return new Promise((resolve, reject) => {
      db.insert(data, (err, newdoc) => {
        if (err) {
          reject(err)
          return false
        }
        resolve(newdoc)
      })
    })
  },
  finddata (query) {
    return new Promise((resolve, reject) => {
      db.find(query, (err, res) => {
        if (err) {
          reject(err)
          return false
        }
        resolve(res)
      })
    })
  },
  findone (query) {
    return new Promise((resolve, reject) => {
      db.findOne(query, (err, res) => {
        if (err) {
          reject(err)
          return false
        }
        resolve(res)
      })
    })
  }
}
