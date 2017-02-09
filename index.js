const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-middleware');
const bodyParser = require('body-parser');
const config = require('./webpackconfig.js');
const routes = require('./server/routes.js');

const app = express();
const compiler = webpack(config);

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('dist'));

app.use("/routes", routes);

app.use(webpackMiddleware(compiler));

app.get('/', function response(req, res) {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.get('^/[0-9]+$', function response(req, res) {
  //TODO remove this hack when we get login
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


app.listen(3000, function() {
  console.log('app listening on port:3000');
});
