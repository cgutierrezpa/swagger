'use strict';
var SwaggerExpress = require('swagger-express-mw'),
env = process.env.NODE_ENV || 'test',
config = require('./config/config.js')[env],
express = require('express'),
app = express(),
db = require('./lib/db.js'),
port = config.server.port || 3000;

module.exports = app; // Required to perform tests over the API

config.appRoot = __dirname; // Required by the Swagger specification.
config.swaggerFile = 'api/swagger/swagger.json'; //By default, Swagger will look for swagger.yaml so we need to tell it to look for swagger.json

SwaggerExpress.create(config, function(err, swaggerExpress) {
	if (err) { throw err; }

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
});
