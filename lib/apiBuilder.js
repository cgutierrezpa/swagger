
let RefParser = require('json-schema-ref-parser'),
jsonFile = require('jsonfile');

let apiBaseUrl = __dirname.substring(0, __dirname.lastIndexOf("/")) + '/api/swagger/';
let inputAPIPath = apiBaseUrl + 'api.json';

/* We generate an API Json readable by Swagger, where all $ref are dereferenced */
RefParser.dereference(inputAPIPath)
.then(function(schema) {
	let outputAPIPath  = apiBaseUrl + 'swagger.json';

	jsonFile.writeFile(outputAPIPath, schema, function (err) {
		if (err)
			console.error(err)
	});
})
.catch(function(err) {
	console.error(err);
});