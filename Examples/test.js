'use strict';
var winston = require('winston');

winston.add(require('./winston-pushalot').Pushalot, {
  token: 'Some API Token',
  source: 'Hell Yeah'
});

winston.log('info', 'test', {
  source: 'werd'
}, function(err) {
  if (err) {
    console.log(err.message);
  }
  console.log(err);
});
