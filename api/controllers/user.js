let db = require('../../lib/db.js'),
errorhandler = require('../../lib/errorHandler.js'),
bcrypt = require('bcrypt'),
promise = require('bluebird'),
crypto = promise.promisifyAll(require('crypto')),
nodemailer = require('nodemailer'),
moment = require('moment'),
async = require('async');

module.exports = {

	/* Public methods */

	findAllUsers : function(req, res){
		db.get().queryAsync('SELECT * FROM ' + db.tables.user + ' WHERE is_active = 1').then(function(rows){
			if (rows.length == 0){
				return res.status(404).json({"message": "No users found."});
			}

			return res.status(200).json(rows);
		}).catch(function(err){
			res.status(500).json({"message": "Internal server error."});
			throw err;
		})
	},

	findUserById : function(req, res){
		db.get().queryAsync('SELECT * FROM ' + db.tables.user + ' WHERE _id = ? AND is_active = 1',req.swagger.params.userId.value)
		.then(function(rows){
			if (rows.length == 0){
				return res.status(404).json({"message": "User not found."});
			}
			delete rows[0]._id;
			delete rows[0].tx_password;
			delete rows[0].is_active;
			delete rows[0].dt_create_timestamp;

			return res.status(200).json(rows[0]);
		}).catch(function(err){
			errorhandler.internalServer(res, err);
		})
	},

	create : async function(req, res) {
		try{
			let fetchedUser = await module.exports.findByEmail(req.swagger.params.body.value.tx_email);

			if (fetchedUser.length != 0){
				return res.status(409).send('Email already exists.');
			}

			var connection;
			
			bcrypt.hash(req.swagger.params.body.value.tx_password, 10)
			.then(function(hash) {
				let verificationData;
				let response;
				req.swagger.params.body.value.tx_password = hash;
				return db.get().getConnectionAsync();
			})
			.then(function(dbConnection){
				connection = dbConnection;
				return connection.beginTransactionAsync();
			})
			.then(function(){
				return connection.queryAsync('INSERT INTO ' + db.tables.user + ' SET ? ', req.swagger.params.body.value);
			})
			.then(function(rows){
				return crypto.randomBytesAsync(128);
			})
			.then(function(buffer){
				verificationData = {
					tx_email: req.swagger.params.body.value.tx_email,
					tx_token: buffer.toString('hex'),
					dt_expires_on: moment().add(1, 'days').format()
				}

				return connection.queryAsync('INSERT INTO ' + db.tables.signup_token + ' SET ? ', verificationData);
			})
			.then(function(result) {
				response = result;
				return connection.commit();
			})
			.then(function(){
				module.exports.sendVerificationEmail(req.swagger.params.body.value.tx_email);
				connection.release();
				return res.status(200).send(response);
			})
			.catch(function(err){
				if (connection != undefined){
					connection.rollback(function(){
						res.status(500).send({"message": "Internal server error."});
						throw err;
					});
				}else{
					res.status(500).send({"message": "Internal server error."});
					throw err;
				}
			})
		}catch(err){
			errorhandler.internalServer(res, err);
		}
	},

	updateUser: function(req, res){
		db.get().queryAsync('UPDATE ' + db.tables.user + ' SET ? WHERE _id = ? AND is_active = 1',
			[req.swagger.params.body.value, req.swagger.params.body.value._id, req.authInfo._id])
		.then(function(result) {
			if (result.affectedRows == 0){
				return res.status(404).send({"message": "User not found."});
			}

			return res.status(200).send(result);
		})
		.catch(function(err){
			errorhandler.internalServer(res, err);
		})
	},

	deleteUser : function(req, res) {
		db.get().queryAsync('UPDATE ' + db.tables.user + ' SET is_active = 0 WHERE _id = ?', req.authInfo._id)
		.then(function(result) {
			if(result.changedRows == 0){
				return res.status(404).json({"message": "User not found."})
			}
			return res.status(200).send(result);
		})
		.catch(function(err){
			errorhandler.internalServer(res, err);
		});
	},

	resetPassword: function(req, res){
		let passwordResetData = {
			tx_email: req.swagger.params.body.value.tx_email,
			tx_token: buffer.toString('hex'),
			dt_expires_on: moment().add(1, 'days').format()
		}

		crypto.randomBytes(128)
		.then(function(buffer){
			passwordResetData.tx_token = buffer.toString('hex');
			return db.get().queryAsync('INSERT INTO ' + db.tables.reset_token + ' SET ? ', passwordResetData);
		})
		.then(function(result) {
			let transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'rubenlopezlozoya12@gmail.com',
					pass: 'elmaskie2'
				}
			});

			let mailOptions = {
				from: 'rubenlopezlozoya12@gmail.com',
				to: req.swagger.params.body.value.tx_email,
				subject: 'Flocker - Password reset',
				html: '<h1>Password restoration</h1><p>Please, click in the link below to reset your password.</p><a href="http://localhost:3000/api/auth/password/reset' + passwordResetData.tx_token + '">Reset</a>'
			};

			transporter.sendMail(mailOptions, function(err, info){
				if(err){
					throw err;
				}

				return info;
			});
		})
		.catch(function(err){
			if(err){
				res.status(500).send({"message": "Internal server error."});
				throw err;
			}
		});
	},

	changePassword : function(req, res){
		bcrypt.hash(req.swagger.params.body.value.tx_password, 10)
		.then(function(hash) {
			return db.get().queryAsync('UPDATE ' + db.tables.user + ' SET tx_password = ? WHERE _id = ? ', [hash, req.authInfo._id])

		})
		.then(function(rows){
			return res.status(200).send(rows);
		})
		.catch(function(err){
			if(err){
				res.status(500).send({"message": "Internal server error."});
				throw err;
			}
		});
	},

	/* Internal methods non-callable from client */
	sendVerificationEmail : function(email, token){
		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'rubenlopezlozoya12@gmail.com',
				pass: 'elmaskie2'
			}
		});

		let mailOptions = {
			from: 'rubenlopezlozoya12@gmail.com',
			to: email,
			subject: 'Flocker - Account verification',
			html: '<h1>Thanks for registering to Flocker!</h1><p>Please, click in the link below to verify your account.</p><a href="http://localhost:3000/api/auth/activate/' + token + '">Activate</a>'
		};

		transporter.sendMail(mailOptions, function(err, info){
			if(err){
				throw err;
			}

			return info;
		});
	},

	findByEmail : async function(email){
		return new Promise(function(resolve, reject){
			return db.get().queryAsync('SELECT * FROM ' + db.tables.user + ' WHERE tx_email = ?', email)
			.then(function(rows){
				return resolve(rows);
			})
			.catch(function(err){
				return reject(err);
			})
		})
	}
}