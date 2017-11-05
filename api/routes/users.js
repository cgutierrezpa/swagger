/* Controller required here */
var usersController = require('../controllers/user.js'),
authManager = require('../../lib/authManager.js');

module.exports = function(app){

	app.route('/user')
	.get(usersController.findAllUsers)
	.post(authManager.checkToken, usersController.createUser)
	.put(authManager.checkToken, usersController.updateUser)
	.delete(authManager.checkToken, usersController.deleteUser);

	app.route('/user/:userId')
	.get(usersController.findUserById);

}