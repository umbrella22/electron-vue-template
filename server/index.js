var express = require('express')
const path = require('path')
var app = express()

app.use(express.static(path.join(__dirname, './client')))

var server = app.listen(25565, function () {
  var host = server.address().address
  var port = server.address().port

  console.log('服务启动', host, port)
})
