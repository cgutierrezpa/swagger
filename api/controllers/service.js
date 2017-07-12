let db = require('../../lib/db.js'),
	errorHandler = require('../../lib/errorHandler.js'),
	bcrypt = require('bcrypt');

module.exports = {
	/* Public methods */
/*
	findAll : function(req, res, done){
		db.get().query('SELECT * FROM ' + db.tables.service + ' WHERE is_active = 1', function(err, rows){
			if(err){
				res.status(500).json({"message":"Internal server error.\n"});
			}
			res.status(200).send(rows);
			done();
		});
	},
*/
	findByProvider : function(req, res, done){
		db.get().query('SELECT * FROM ' + db.tables.service + ' WHERE _id = ? AND is_active = 1', req.params.id, function(err, rows){
			if(err){
				res.status(500).json({"message":"Internal server error.\n"});
				return done(err);
			}
			if (rows.length == 0){
				res.status(404).send("Service not found.\n");
				return done();
			}
			res.status(200).send(rows);
			done();
		});
	},

	create : function(req, res, done) {
		//req.body.fk_provider = req.authInfo._id;
		try{
			db.get().getConnection(function(err, connection){
				if(err){
					res.status(500).json({"message":"Internal server error.\n"});
					throw err;
				}
				
				connection.beginTransaction(function(err){
					if(err){
						res.status(500).json({"message":"Internal server error.\n"});
						throw err;
					}

					connection.query('INSERT INTO ' + db.tables.service + ' SET ?', req.swagger.params.body.value, function(err, result) {
						/* We need to create an if-else structure because connection.rollback is asynchronous, hence even if an err is raised, 
							the next query will be performer and we will not be able to see that the error comes from the first query */

						if(err){
							connection.rollback(function(){
								res.status(500).json({"message":"Internal server error.\n"});
								throw err;
							});
						}else{ 
							/* Este método 'create' no recibirá datos de la descripción del servicio, se creará una entrada con una
						descripción vacía en la tabla relacional t_agency_service_description, y se modificará la descripción por
						medio de una llamada a updateDescription desde el front */

							let serviceId = result.insertId;

							connection.query('INSERT INTO ' + db.tables.service_description +
							' (fk_agency_service, tx_description) VALUES (?,"")', serviceId, function(err, result){
							if(err){
								connection.rollback(function(){
									res.status(500).json({"message":"Internal server error.\n"});
									throw err;
								});
							}

							connection.commit(function(err){
								if(err){
									connection.rollback(function(){
										res.status(500).json({"message":"Internal server error.\n"});
										throw err;
									});
								}
								connection.release();
								return res.status(200).json({"serviceId": serviceId});
							});
						});
						}
					});
				});
			});
		}catch(err){
			errorhandler.internalServer(res, err);
		}	
	},

	update: function(req, res, done){
		db.get().query('UPDATE ' +  db.tables.service +
			' SET ? WHERE _id = ? AND fk_provider = ?',
			[req.body, req.body._id, req.authInfo._id], function(err, result){
				if(err){
					res.status(500).json({"message":"Internal server error.\n"});
					throw err;
				}
				if(result.affectedRows == 0){
					return res.status(404).send("Service not found.\n");
				}
				return res.status(200).send(result);
		});
	},

	updateDescription : function(req, res, done){
		db.get().query('UPDATE ' + db.tables.service_description + ' AS description ' +
			'JOIN ' + db.tables.service + ' AS service ON description.fk_agency_service = service._id ' +
			'SET ? WHERE service.fk_provider = ?',
			[req.body, req.authInfo._id], function(err, result){
				if(err){
					res.status(500).json({"message":"Internal server error.\n"});
					throw err;
				}
				if(result.affectedRows == 0){
					return res.status(404).send("Service not found.\n");
				}
				return res.status(200).send(result);
		});
	}
/*

	delete : function(req, res, done) {
		db.get().query('UPDATE ' + db.tables.service + ' SET is_active = 0 WHERE _id = ? ', req.params.id, function (err, rows) {
			if(err){
				res.status(500).json({"message":"Internal server error.\n"});
				return done(err);
			}
			res.status(200).send();
			done();
		})
	},

*/
	/* Internal methods non-callable from client */

}