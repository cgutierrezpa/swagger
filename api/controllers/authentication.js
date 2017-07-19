let db = require('../../lib/db.js'),
errorhandler = require('../../lib/errorHandler.js'),
bcrypt = require('bcrypt'),
promise = require('bluebird'),
authManager = require('../../lib/authManager.js')
moment = require('moment');

module.exports = {

	login: function(req, res){
		let fetchedUser = db.get().queryAsync('SELECT _id, tx_password, is_active, is_admin FROM ' + db.tables.user +
		' WHERE tx_email = ?', req.swagger.params.body.value.tx_email);

		let checkPassword = fetchedUser.then(function(rows){

			if (rows.length == 0){
				throw new Error('404');
			}

			if(rows[0].is_active == 0){
				throw new Error('403');
			}

			return bcrypt.compare(req.swagger.params.body.value.tx_password, rows[0].tx_password);
		});

		return promise.join(fetchedUser, checkPassword, function(rows, authenticated) {	
			if (!authenticated){
				throw new Error('400');
			}
			let user = rows[0];
			return res.status(200).json({"token": authManager.createToken(user)});
		})
		.catch(function(err){
			switch(err.message){
				case '400':
					return res.status(400).json({"message": "Invalid password or username."});
				case '403':
					return res.status(403).json({"message": "User account is not active yet."});
				case '404':
					return res.status(404).json({"message": "User not found."});
			}
			errorhandler.internalServer(res, err);
		});
	},

	activate : async function(req, res){
		try{
			let verificationData = await module.exports.getVerificationData(req.params.token);

			if(verificationData.length == 0){
				return res.status(404).json({"message": "Invalid token."});
			}

			if (verificationData[0].dt_expires_on < moment().format()){
				return res.status(409).json({"message": "Token has expired."});
			}

			db.get().queryAsync('UPDATE ' + db.tables.user + ' SET is_active = 1 WHERE tx_email = ? ', verificationData[0].tx_email)
			.then(function(rows) {
				return res.status(200).json(rows);
			}).catch(function(err){
				res.status(500).json({"message": "Internal server error."});
				throw err;
			})		
		}catch(err){
			res.status(500).json({"message": "Internal server error."});
			throw err;
		}
	},

	resetPassword : async function(req, res){
		try{
			let passwordResetData = await module.exports.getPasswordResetData(req.body.tx_token);

			if(passwordResetData.length == 0){
				return res.status(404).json({"message": "Invalid token."});
			}

			if (passwordResetData[0].dt_expires_on < moment().format()){
				return res.status(409).json({"message": "Token has expired."});
			}

			bcrypt.hash(req.body.tx_password, 10)
			.then(function(hash) {
				return db.get().queryAsync('UPDATE ' + db.tables.user + ' SET tx_password = ? WHERE tx_email = ? ', [hash, passwordResetData[0].tx_email]);
			})
			.then(function(rows) {
				return res.status(200).json(rows);
			}).catch(function(err){
				errorhandler.internalServer(res, err);
			});
		}catch(err){
			errorhandler.internalServer(res, err);
		}
	},

	/* Internal methods non-callable from client */
	getVerificationData : function(token){
		return new Promise(function(resolve, reject){
			db.get().queryAsync('SELECT tx_email, tx_token, dt_expires_on FROM ' + db.tables.signup_token + ' WHERE tx_token = ? ', token)
			.then(function(rows){
				return resolve(rows);
			}).catch(function(err){
				return reject(err);
			});
		});
	},

	getPasswordResetData: async function(token){
		return new Promise(function(resolve, reject){
			db.get().queryAsync('SELECT tx_email, tx_token, dt_expires_on FROM ' + db.tables.reset_token + ' WHERE tx_token = ? ', token)
			.then(function(rows){
				return resolve(rows);
			}).catch(function(err){
				return reject(err);
			})
		});
	}
}