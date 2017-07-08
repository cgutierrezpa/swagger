var env = process.env.NODE_ENV || 'local',
config = require('../config/config.js')[env],
promise = require('bluebird');
mysql = promise.promisifyAll(require('mysql')),

/* We need to Promisify mysql functions */
promise.promisifyAll(require("mysql/lib/Connection").prototype);
promise.promisifyAll(require("mysql/lib/Pool").prototype);

var state = {
    pool: null,
    mode: null,
}

exports.connect = function(done) {
    state.pool = mysql.createPool({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.db,
        port: config.database.port
    });

    state.mode = config.database.mode;
    done();
}

exports.get = function() {
    return state.pool;
}

exports.fixtures = function(data) {
    var pool = state.pool;

    if (!pool) return done(new Error('Missing database connection.'));

    var names = Object.keys(data.tables);

    async.each(names, function(name, cb) {
        async.each(data.tables[name], function(row, cb) {
            var keys = Object.keys(row),
            values = keys.map(function(key) { return "'" + row[key] + "'" });
            pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', cb);
        }, cb);
    }, done);
}

exports.drop = function(tables, done) {
    var pool = state.pool;

    if (!pool) return done(new Error('Missing database connection.'))

        async.each(tables, function(name, cb) {
            pool.query('DELETE * FROM ' + name, cb)
        }, done);
}

exports.tables = {
    user: 't_user',
    place: 't_place',
    city: 'd_city',
    country: 'd_country',
    service: 't_agency_service',
    event: 't_event',
    service_description: 't_agency_service_description',
    signup_token: 't_signup_token',
    reset_token: 't_reset_token'
}