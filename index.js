const path = require('path');
const express = require('express');
const s = require('./expressAppInstance.js');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-middleware');
const bodyParser = require('body-parser');
const config = require('./webpackconfig.js');
const routes = require('./server/routes.js');


const compiler = webpack(config);

s.app.use(bodyParser.urlencoded({
    extended: true
}));

s.app.use(express.static('dist'));

s.app.use("/routes", routes);

s.app.use(webpackMiddleware(compiler));

s.server.listen(3000, function() {
  console.log('listening to port 3000');
});

s.app.get('/socket.io', function response(req, res) {
  res.sendFile(path.join(__dirname, 'node_modules/socket.io-client/dist/socket.io.js'));
});

s.app.get('/', function response(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

s.app.get('^/[0-9]+$', function response(req, res) {
  //TODO remove this hack when we get login
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


//app.listen(3000, function() {
//  console.log('app listening on port:3000');
//});
