const express = require('express');

const app = express();
const server = require('http').Server(app);

module.exports = {
  app: app,
  server: server,
};
