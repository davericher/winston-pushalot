/*
  Inspired by: dennistimmermann/pushalot-node
  https://github.com/dennistimmermann/pushalot-node
*/
'use strict';

const https = require('https');
const EventEmitter = require('events').EventEmitter;
// Return a meningful error message based on response code

let send = function(payload, object) {
  let request = https.request({
    hostname: 'pushalot.com',
    port: 443,
    path: '/api/sendmessage',
    method: 'POST',
    headers: {
      'User-Agent': 'winston-pushalot/1.0.1 (NodeJs)',
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  }, (response) => {
    response.setEncoding('utf8');
    response.on('data', (data) => {
      if (response.statusCode === 200) {
        object.emit('success', 200, data);
      } else {
        var details = JSON.parse(data);
        object.emit('error', response.statusCode, details.Status + ': ' + details.Description);
      }
    });
  });

  request.on('error', (err) => {
    object.emit('error', err.message);
  });
  request.write(payload);
  request.end();
};

/*
  Constructor
*/
const app = function(token) {
  // Check for valid token
  if (!token) {
    throw new Error('Missing PushApi Token');
  }

  this.token = token;
  this.source = undefined;
  this.version = '1.0.0';
};

/*
  Push
*/
app.prototype.push = function(body, title, data) {
  if (typeof body === 'object') {
    data = body;
  } else {
    data = data || {};
    data.Body = data.Body || body;
    data.Title = data.Title || title;
  }
  data.AuthorizationToken = this.token;
  data.Source = data.Source || app.source || require('../package.json').name;
  let object = new EventEmitter();
  send(JSON.stringify(data), object);

  return object;
};

module.exports = app;
