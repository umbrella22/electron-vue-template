var express = require('express')
var fs = require('fs')
const path = require('path')
var app = express()

app.use(express.static(path.join(__dirname, './client')))

var server = app.listen(25565, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});