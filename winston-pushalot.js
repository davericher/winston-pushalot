/*
winston-pushalot.js : transport for logging to Pushalot

Author           : Dave Richer
Web              : https://www.develops.io
Email            : <dave@develops.io>

Copyright (c)    : 2016 Dave Richer
Web              : https://www.develops.io/
License          : http://opensource.org/licenses/MIT
*/

'use strict';
const util = require('util');
const PushalotNode = require('./lib/pushalot');
const winston = require('winston');
const os = require('os');

// ### function Pushalot (options)
// Constructor for the Pushalot transport object.
const Pushalot = exports.Pushalot = function(options) {

  // Pushalot options
  options = options || {};
  PushalotNode.source = options.source || require('./package.json').name;
  // Token required
  if (!options.token) {
    throw new Error('A Pushalot api token is required');
  }

  // Winston Options
  this.name = 'Pushalot';
  this.level = options.level || 'info';

  // create the Pushalot instance
  this.client = new PushalotNode(options.token);
};

// Inherit from `winston.Transport` to take advantage of base functionality.
util.inherits(Pushalot, winston.Transport);

// function log (level, msg, [meta], callback)
// @level {string} Level at which to log the message.
// @msg {string} Message to log
// @meta {Object} **Optional** Additional metadata to attach
// @callback {function} Continuation to respond to when complete.
// This is what is exposed to the Winston API
Pushalot.prototype.log = function(level, msg, meta, callback) {

  // Build the initial message to send to Pushalot
  let message = {
    Title: level.toUpperCase() + ' From ' + os.hostname().toUpperCase(),
    Body: msg
  };

  // No meta field given, swap with callback
  if (typeof meta === 'function') {
    callback = meta;
    meta = null;
  }

  // Meta field given, extract usefull keys
  if (typeof meta === 'object') {
    // Bring in any relevent fields passed through meta
    Object.keys(meta).forEach((key) => {
      if (key === 'Source' || key === 'LinkTitle' || key === 'Link' || key === 'IsImportant' || key === 'IsSilent' || key === 'Image' || key === 'TimeToLive') {
        message[key] = meta[key];
      }
    });
  }

  // Send message to pushalot-node client
  this.client.push(message).on('error', function(code, response) {
    callback(new Error(code + ': ' + response));
  }).on('success', function() {
    callback(false);
  });
};

// Add Pushalot to the transports defined by winston.
winston.transports.Pushalot = Pushalot;
