var sys = require('util'),
    rest = require('restler');

rest.get('http://peaceful-bastion-8967.herokuapp.com').on('complete', function(result) {
  sys.puts(result);
});
