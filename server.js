//'use strict';

var SwaggerExpress = require('swagger-express-mw'),
	env = process.env.NODE_ENV || 'test',
	config = require('./config/config.js')[env],
	express = require('express'),
	//bodyParser = require('body-parser'),
	app = express(),
	db = require('./lib/db.js'),
	port = config.server.port || 3000;

module.exports = app; // for testing
/*
var swaggerConfig = {
  appRoot: __dirname 
};*/
config.appRoot = __dirname; // required config for swagger

SwaggerExpress.create(config, function(err, swaggerExpress) {
	if (err) { throw err; }

	// install middleware
	swaggerExpress.register(app);

  	db.connect(function(err) {
		if (err) {
			console.log('Unable to connect to MySQL.')
			process.exit(1)
		} else {
			app.listen(port, function() {
				console.log('Listening on port ' + port +'...')
			})
		}
	});
  /*
  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }*/
});
