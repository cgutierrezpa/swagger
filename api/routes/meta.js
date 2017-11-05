var swaggerSpec = require('../swagger/swagger.json');

module.exports = function(app){
	app.get('/swagger.json', function(req, res) {
		res.setHeader('Content-Type', 'application/json');
		res.send(swaggerSpec);
	});
}