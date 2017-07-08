module.exports = {

	internalServer: function(res, err){
		res.status(500).send("Internal server error.\n");
		throw err;
	}
	
}