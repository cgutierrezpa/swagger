let jwt = require('jwt-simple'),
env = process.env.NODE_ENV || 'local',
config = require('../config/config.js')[env],  
moment = require('moment');

module.exports = {

	createToken : function(user) {  
		let payload = {
			_id: user._id,
			iat: moment().unix(),
			exp: moment().add(48, "days").unix(),
			is_admin: user.is_admin
		};

		return jwt.encode(payload, config.secret);
	},

	checkToken : function(req, authOrSecDef, token, callback) {
		var currentScopes = req.swagger.operation["x-security-scopes"];

		function sendError() {
	        return req.res.status(403).json({message: 'Error: Access Denied'});
	    }

	    function tokenExpired(){
	    	return req.res.status(401).json({message: 'Error: Token has expired'});
	    }

		if(!req.headers.authorization) {
			return sendError();
		}

		var token = token.split(" ")[1];

		try{
			var payload = jwt.decode(token, config.secret);

			if(payload.exp <= moment().unix()) {
				return tokenExpired();
			}

			req.authInfo = payload;
			return callback();

			////////////////////////////////////////////////////////////////////////////////////////////////
			/* IN CASE WE NEED SOME ROLE & ISSUER MATCHING AND VERIFICATION, WE CAN MAKE USE OF THIS CODE */
			/*
			jwt.verify(tokenString, sharedSecret, function (verificationError, decodedToken) {
	            //check if the JWT was verified correctly
	            if (verificationError == null &amp;&amp; Array.isArray(currentScopes) &amp;&amp; decodedToken &amp;&amp; decodedToken.role) {
	                // check if the role is valid for this endpoint
	                var roleMatch = currentScopes.indexOf(decodedToken.role) !== -1;
	                // check if the issuer matches
	                var issuerMatch = decodedToken.iss == issuer;

	                // you can add more verification checks for the
	                // token here if necessary, such as checking if
	                // the username belongs to an active user

	                if (roleMatch &amp;&amp; issuerMatch) {
	                    //add the token to the request so that we
	                    //can access it in the endpoint code if necessary
	                    req.auth = decodedToken;
	                    //if there is no error, just return null in the callback
	                    return callback(null);
	                } else {
	                    //return the error in the callback if there is one
	                    return callback(sendError());
	                }

	            } else {
	                //return the error in the callback if the JWT was not verified
	                return callback(sendError());
	            }
	        });
	        */
	        ///////////////////////////////////////////////////////////////////////////////////////////////			
		}
		catch(err){
			return callback(sendError());
		}
	},

	createResetPasswordToken : function(id, email) {  
		let payload = {
			_id: id,
			tx_email: email, 
			iat: moment().unix(),
			exp: moment().add(30, "minutes").unix()
		};

		return jwt.encode(payload, config.secretReset);
	},

	checkResetPasswordToken : function(token){
		//To be implemented
	}
	
}