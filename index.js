const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-middleware');
const config = require('./webpackconfig.js');

const app = express();
const compiler = webpack(config);

app.use(express.static('dist'));
app.use(webpackMiddleware(compiler));
app.get('*', function response(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(3000, function() {
  console.log('app listening on port:3000');
});
