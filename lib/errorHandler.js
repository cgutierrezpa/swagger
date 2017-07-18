module.exports = {

	internalServer: function(res, err){
		res.status(500).json({"message":"Internal server error."});
		throw err;
	}
	
}