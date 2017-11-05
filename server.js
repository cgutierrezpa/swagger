'use strict';
var SwaggerExpress = require('swagger-express-mw'),
env = process.env.NODE_ENV || 'test',
config = require('./config/config.js')[env],
express = require('express'),
app = express(),
bodyParser = require('body-parser'),
cors = require('cors'),
db = require('./lib/db.js'),
authManager = require('./lib/authManager.js'),
port = config.server.port || 3000;

app.use(cors()); //Required to enable CORS in all requests (used by Swagger UI)
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

require('./api/routes')(app);

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

module.exports = app; // Required to perform tests over the API and to use it from the router handler

