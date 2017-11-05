var fs = require('fs');

/* This function reads all the files in the routes dir and requires them into a single file to route requests */
module.exports = function(app){
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file == "index.js") return;
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app);
    });
}